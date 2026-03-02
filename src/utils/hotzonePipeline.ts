import { Anchor, Hotzone, TranscriptSegment } from '../types';
import { sliceAudio, sliceRemoteAudio } from './audioUtils';
import { transcribeAudio } from '../lib/groqService';
import { findExistingTranscript, saveTranscript } from '../lib/api';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateHotzoneFromAnchor = (
  anchor: Anchor,
  transcript: TranscriptSegment[]
): Hotzone => {
  // Layer 1: Mechanical (+/- 10s) with Reaction Offset (-2s)
  // Reaction Offset: Shift center point back by 2s to account for user reaction time.
  const REACTION_OFFSET = 2; 
  const CENTER_POINT = Math.max(0, anchor.timestamp - REACTION_OFFSET);
  
  let startTime = Math.max(0, CENTER_POINT - 10);
  let endTime = CENTER_POINT + 10;

  // Layer 2: Contextual (Sentence Alignment)
  // Only applicable if full transcript is available (Mock Mode)
  if (transcript && transcript.length > 0) {
    const overlappingSegments = transcript.filter(
      (seg) => seg.end_time > startTime && seg.start_time < endTime
    );

    if (overlappingSegments.length > 0) {
      const firstSegment = overlappingSegments[0];
      const lastSegment = overlappingSegments[overlappingSegments.length - 1];
      startTime = Math.min(startTime, firstSegment.start_time);
      endTime = Math.max(endTime, lastSegment.end_time);
    }
  }

  // Extract text snippet from mock transcript if available
  const snippet = transcript
    .filter((seg) => seg.end_time > startTime && seg.start_time < endTime)
    .map((seg) => seg.text)
    .join(' ');

  return {
    id: generateId(),
    audio_id: anchor.audio_id,
    start_time: startTime,
    end_time: endTime,
    transcript_snippet: snippet || "Processing...", // Placeholder if no transcript yet
    source: anchor.source,
    metadata: {
      confidence: 0.8,
    },
    status: 'pending',
    created_at: new Date().toISOString(),
  };
};

export const processAnchorsToHotzones = async (
  anchors: Anchor[],
  transcript: TranscriptSegment[],
  audioFile?: File, // Optional: Real audio file for processing
  audioUrl?: string, // Optional: Remote URL
  transcriptInfo?: { url: string; type: string }, // Optional: Official transcript
  existingHotzones: Hotzone[] = [] // Optional: Existing hotzones to avoid reprocessing
): Promise<Hotzone[]> => {
  
  // 0. Filter out anchors that are already covered by existing finalized hotzones
  // AND Detect Extensions
  const BUFFER = 2;
  const newHotzonesToCreate: Anchor[] = [];
  const hotzonesToUpdate = new Map<string, { hz: Hotzone, extendRight: number, extendLeft: number }>();

  // Deep clone existing hotzones so we don't mutate state directly (though Map values are refs)
  // We will work with a copy for calculations
  const workingHotzones = existingHotzones.map(h => ({ ...h }));

  for (const anchor of anchors) {
      // 1. Find nearby existing zone
      // Relaxed buffer for "nearby" detection (e.g. 5s) to allow extension
      const EXTENSION_BUFFER = 5; 
      
      const nearbyZoneIndex = workingHotzones.findIndex(hz => 
          anchor.timestamp >= hz.start_time - EXTENSION_BUFFER && 
          anchor.timestamp <= hz.end_time + EXTENSION_BUFFER
      );

      if (nearbyZoneIndex !== -1) {
          const nearbyZone = workingHotzones[nearbyZoneIndex];
          
          // Calculate theoretical target zone for this anchor
          const REACTION_OFFSET = 2;
          const center = Math.max(0, anchor.timestamp - REACTION_OFFSET);
          const targetStart = Math.max(0, center - 10);
          const targetEnd = center + 10;

          // Check coverage
          if (targetStart >= nearbyZone.start_time - BUFFER && targetEnd <= nearbyZone.end_time + BUFFER) {
              console.log(`[Skipping] Anchor at ${anchor.timestamp.toFixed(2)}s covered by existing hotzone ${nearbyZone.id}.`);
              continue;
          }

          // Not fully covered -> Calculate Extension
          let extendLeft = 0;
          let extendRight = 0;

          if (targetStart < nearbyZone.start_time) {
              extendLeft = nearbyZone.start_time - targetStart;
              // Limit left extension to reasonable amount (e.g. don't extend 10 mins back)
              // For mechanical anchors, it's usually small.
          }
          
          if (targetEnd > nearbyZone.end_time) {
              extendRight = targetEnd - nearbyZone.end_time;
          }

          if (extendLeft > 0 || extendRight > 0) {
              console.log(`[Extending] Zone ${nearbyZone.id} by Left:${extendLeft.toFixed(2)}s, Right:${extendRight.toFixed(2)}s`);
              
              // Update the working copy immediately so subsequent anchors in this batch see the extended zone
              nearbyZone.start_time = Math.min(nearbyZone.start_time, targetStart);
              nearbyZone.end_time = Math.max(nearbyZone.end_time, targetEnd);
              
              // Register for processing
              const existingEntry = hotzonesToUpdate.get(nearbyZone.id);
              if (existingEntry) {
                  // Aggregate extensions
                  hotzonesToUpdate.set(nearbyZone.id, {
                      hz: nearbyZone, // updated ref
                      extendLeft: Math.max(existingEntry.extendLeft, extendLeft), // This logic is slightly flawed if multiple anchors push boundaries. 
                      // Better: The workingZone IS the source of truth for final boundaries.
                      // The 'extend' values are just flags to say "we need to transcribe".
                      // Actually, we need to know the *ranges* to transcribe (the Diffs).
                      extendRight: 0 // Placeholder, we'll calc diff later
                  });
              } else {
                  hotzonesToUpdate.set(nearbyZone.id, { hz: nearbyZone, extendLeft, extendRight });
              }
          }

      } else {
          // No nearby zone -> Create New
          newHotzonesToCreate.push(anchor);
      }
  }

  // Helper to slice and transcribe a specific range
  const processRange = async (start: number, end: number, audioId: string): Promise<{ text: string, words: any[] }> => {
      if (end <= start) return { text: "", words: [] };
      
      console.log(`[ASR] Processing diff range: ${start.toFixed(2)} - ${end.toFixed(2)}`);
      
      let audioSlice: Blob;
      if (audioFile) {
          audioSlice = await sliceAudio(audioFile, start, end);
      } else if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
          audioSlice = await sliceRemoteAudio(audioUrl, start, end);
      } else {
          // Fallback mock
          return { text: " [Extended] ", words: [] };
      }

      // Check cache first? (Maybe later)
      const result = await transcribeAudio(audioSlice);
      
      // Adjust timestamps relative to the global start
      const adjustedWords = result.words?.map(w => ({
          ...w,
          start: start + w.start,
          end: start + w.end
      })) || [];

      return { text: result.text, words: adjustedWords };
  };

  // 1. Process Updates (Extensions)
  const updatedResults = await Promise.all(Array.from(hotzonesToUpdate.values()).map(async ({ hz }) => {
      // Re-calculate diffs based on the FINAL state of 'hz' (working copy) vs 'original'
      const original = existingHotzones.find(h => h.id === hz.id);
      if (!original) return hz; // Should not happen

      let newText = original.transcript_snippet;
      let newWords = original.transcript_words || [];

      // Diff Left
      if (hz.start_time < original.start_time) {
          const { text, words } = await processRange(hz.start_time, original.start_time, hz.audio_id);
          newText = text + " " + newText;
          newWords = [...words, ...newWords];
      }

      // Diff Right
      if (hz.end_time > original.end_time) {
           const { text, words } = await processRange(original.end_time, hz.end_time, hz.audio_id);
           newText = newText + " " + text;
           newWords = [...newWords, ...words];
      }

      return {
          ...hz,
          transcript_snippet: newText,
          transcript_words: newWords,
          metadata: {
              ...hz.metadata,
              user_adjustment_history: [
                  ...(hz.metadata.user_adjustment_history || []),
                  { action: 'expand', timestamp: new Date().toISOString() }
              ]
          }
      } as Hotzone;
  }));


  if (newHotzonesToCreate.length === 0 && updatedResults.length === 0) {
      console.log("No new anchors or extensions to process.");
      return [];
  }

  // 2. Generate New Mechanical Hotzones
  const hotzones = newHotzonesToCreate.map((anchor) => generateHotzoneFromAnchor(anchor, transcript));

  // 3. Sort by start time
  hotzones.sort((a, b) => a.start_time - b.start_time);

  // 4. Merge overlapping NEW hotzones (Current Logic)
  // ... (Keep existing merge logic for new zones)
  const mergedNewHotzones: Hotzone[] = [];
  if (hotzones.length > 0) {
      let current = hotzones[0];
      for (let i = 1; i < hotzones.length; i++) {
        const next = hotzones[i];
        if (next.start_time <= current.end_time + 2) {
          current.end_time = Math.max(current.end_time, next.end_time);
        } else {
          mergedNewHotzones.push(current);
          current = next;
        }
      }
      mergedNewHotzones.push(current);
  }

  // 5. Process NEW hotzones
  console.log(`Starting batch transcription for ${mergedNewHotzones.length} NEW hotzones...`);
  
  const processedNewHotzones = await Promise.all(mergedNewHotzones.map(async (hz) => {
    // ... (Keep existing transcription logic for new zones)
    // Reuse the exact same logic block as before
    try {
      let audioSlice: Blob;
      
      if (audioFile) {
          audioSlice = await sliceAudio(audioFile, hz.start_time, hz.end_time);
      } else if (audioUrl && typeof audioUrl === 'string' && audioUrl.startsWith('http')) {
          console.log(`[Hotzone] Slicing remote audio: ${audioUrl}`);
          audioSlice = await sliceRemoteAudio(audioUrl, hz.start_time, hz.end_time);
      } else {
          const match = transcript.find(t => t.start_time <= hz.start_time && t.end_time >= hz.end_time);
          if (match) return { ...hz, transcript_snippet: match.text };
          return { ...hz, transcript_snippet: "[Audio source missing for transcription]" };
      }
      
      let text = hz.transcript_snippet;
      let words: Array<{ word: string; start: number; end: number }> | undefined = undefined;
      
      if (!text || text === "Processing...") {
        const existing = await findExistingTranscript(hz.audio_id, hz.start_time, hz.end_time);
        if (existing) {
            console.log(`[Reuse] Found shared transcript for Hotzone ${hz.id}`);
            text = existing.text;
            words = existing.words;
        } else {
            console.log(`[API] Transcribing Hotzone ${hz.id}...`);
            const result = await transcribeAudio(audioSlice);
            text = result.text;
            words = result.words;
            await saveTranscript(hz.audio_id, hz.start_time, hz.end_time, text, words);
        }

        if (words && words.length > 0) {
            const firstWord = words[0];
            const lastWord = words[words.length - 1];
            const relativeStart = firstWord.start;
            const relativeEnd = lastWord.end;
            const newStartTime = hz.start_time + relativeStart;
            const newEndTime = hz.start_time + relativeEnd;
            
            console.log(`[Magnet] Refined ${hz.id}: ${hz.start_time.toFixed(2)}->${newStartTime.toFixed(2)}`);
            
            return { 
                ...hz, 
                start_time: newStartTime, 
                end_time: newEndTime, 
                transcript_snippet: text,
                transcript_words: words.map(w => ({
                        ...w,
                        start: hz.start_time + w.start,
                        end: hz.start_time + w.end
                })),
                metadata: {
                    ...hz.metadata,
                }
            };
        }
      }
      return { ...hz, transcript_snippet: text };
    } catch (error) {
      console.error(`Error processing hotzone ${hz.id}:`, error);
      return { ...hz, transcript_snippet: "[Processing Failed]" };
    }
  }));

  // Combine Updated and New
  return [...updatedResults, ...processedNewHotzones];
};
