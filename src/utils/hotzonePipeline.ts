import { Anchor, Hotzone, TranscriptSegment } from '../types';
import { sliceAudio, sliceRemoteAudio } from './audioUtils';
import { transcribeAudio } from '../lib/groqService';
import { findExistingTranscript, saveTranscript } from '../lib/api';
import { useAudioStore } from '../store/useAudioStore';

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
  audioFile?: File // Optional: Real audio file for processing
): Promise<Hotzone[]> => {
  
  // 1. Generate Mechanical Hotzones first
  let hotzones = anchors.map((anchor) => generateHotzoneFromAnchor(anchor, transcript));

  // 2. Sort by start time
  hotzones.sort((a, b) => a.start_time - b.start_time);

  // 3. Merge overlapping hotzones
  const mergedHotzones: Hotzone[] = [];
  if (hotzones.length === 0) return [];

  let current = hotzones[0];

  for (let i = 1; i < hotzones.length; i++) {
    const next = hotzones[i];
    
    // Check overlap (or very close, e.g. < 2s gap)
    if (next.start_time <= current.end_time + 2) {
      // Merge
      current.end_time = Math.max(current.end_time, next.end_time);
      
      // Merge metadata
      if (!current.metadata.user_adjustment_history) current.metadata.user_adjustment_history = [];
      current.metadata.user_adjustment_history.push({
        action: 'merge',
        timestamp: new Date().toISOString(),
      });
    } else {
      mergedHotzones.push(current);
      current = next;
    }
  }
  mergedHotzones.push(current);

  // 4. Process hotzones (transcribe if audio file exists, or use transcript fallback)
  console.log(`Starting batch transcription for ${mergedHotzones.length} hotzones...`);
  
  const processedHotzones = await Promise.all(mergedHotzones.map(async (hz) => {
    // Determine source: Local File or Remote URL?
    // We need to pass the audio URL down here if audioFile is missing.
    // However, the current signature is (..., audioFile?: File).
    // We should probably rely on `useAudioStore` or pass the URL.
    // BUT, `processAnchorsToHotzones` is a standalone utility.
    // 
    // HACK: For MVP, we can fetch the URL from the store directly if audioFile is missing.
    // This couples the utility to the store, but it solves the prop drilling issue instantly.
    // A cleaner way is to add `audioUrl` as a parameter.
    
    // Let's assume we update the signature in a moment. For now, let's use a workaround or update the caller.
    // Actually, let's update the signature of this function to accept `audioUrl`.
    
    // Wait, I can't easily change the signature without changing the caller in App.tsx.
    // Let's check App.tsx first.
    
    // TEMPORARY FIX:
    // We will assume that if audioFile is missing, we can try to fetch from `window.audioUrl_HACK` or similar? No.
    // Let's import the store to get the current URL.
    const audioUrl = useAudioStore.getState().audioSrc; // Direct store access
    
    try {
      let audioSlice: Blob;
      
      if (audioFile) {
          audioSlice = await sliceAudio(audioFile, hz.start_time, hz.end_time);
      } else if (audioUrl && audioUrl.startsWith('http')) {
          console.log(`[Hotzone] Slicing remote audio: ${audioUrl}`);
          audioSlice = await sliceRemoteAudio(audioUrl, hz.start_time, hz.end_time);
      } else {
          // Fallback: try to find match in mock transcript or just keep as placeholder
          const match = transcript.find(t => t.start_time <= hz.start_time && t.end_time >= hz.end_time);
          if (match) {
               return { ...hz, transcript_snippet: match.text };
          }
          return { ...hz, transcript_snippet: "[Audio source missing for transcription]" };
      }
      
      let text = hz.transcript_snippet;
      let words: Array<{ word: string; start: number; end: number }> | undefined = undefined;
      
      // Check if metadata already has text (e.g. re-run)
      if (!text || text === "Processing...") {
        
        // 1. Try to find existing transcript in Shared DB (Reuse Logic)
        const existing = await findExistingTranscript(hz.audio_id, hz.start_time, hz.end_time);
        
        if (existing) {
            console.log(`[Reuse] Found shared transcript for Hotzone ${hz.id}`);
            text = existing.text;
            words = existing.words;
        } else {
            // 2. If not found, call Groq API
            console.log(`[API] Transcribing Hotzone ${hz.id}...`);
            const result = await transcribeAudio(audioSlice);
            text = result.text;
            words = result.words;
            
            console.log(`[API] Transcription complete for ${hz.id}`);
            
            // 3. Save to Shared DB for future reuse
            // Note: We save the raw result for the *original* slice (hz.start_time, hz.end_time)
            // BEFORE magnet adjustment, so next time we find it by the same coordinates.
            await saveTranscript(hz.audio_id, hz.start_time, hz.end_time, text, words);
        }

        // --- Layer 2: Magnet Logic (Snap to Sentence Boundaries) ---
        // If we have word timestamps, we can refine the start/end times.
        if (words && words.length > 0) {
            // Find the first and last word
            const firstWord = words[0];
            const lastWord = words[words.length - 1];
            
            // Adjust Hotzone boundaries relative to the SLICE
            // Note: Groq returns timestamps relative to the start of the SLICE (0s), not the original file.
            // So we need to add hz.start_time to map back to global time.
            
            // Heuristic:
            // 1. If the first word starts > 0.5s, it means silence at start -> Trim it.
            // 2. If the text seems cut off (no punctuation at end), maybe we should expand? 
            //    (Expanding requires re-slicing which is complex. For now, let's just trim/snap inwards)
            
            const relativeStart = firstWord.start;
            const relativeEnd = lastWord.end;
            
            const newStartTime = hz.start_time + relativeStart;
            const newEndTime = hz.start_time + relativeEnd;
            
            console.log(`[Magnet] Refined ${hz.id}: ${hz.start_time.toFixed(2)}->${newStartTime.toFixed(2)} | ${hz.end_time.toFixed(2)}->${newEndTime.toFixed(2)}`);
            
            return { 
                ...hz, 
                start_time: newStartTime, 
                end_time: newEndTime, 
                transcript_snippet: text,
                transcript_words: words.map(w => ({
                    ...w,
                    start: hz.start_time + w.start, // Map to global time
                    end: hz.start_time + w.end
                }))
            };
        }
      }
      return { ...hz, transcript_snippet: text };
    } catch (error) {
      console.error(`Error processing hotzone ${hz.id}:`, error);
      return { ...hz, transcript_snippet: "[Processing Failed]" };
    }
  }));

  return processedHotzones;
};
