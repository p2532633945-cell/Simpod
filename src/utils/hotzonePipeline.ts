import { Anchor, Hotzone, TranscriptSegment } from '../types';
import { sliceAudio } from './audioUtils';
import { transcribeAudio } from '../lib/groqService';

// Simple UUID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export const generateHotzoneFromAnchor = (
  anchor: Anchor,
  transcript: TranscriptSegment[]
): Hotzone => {
  // Layer 1: Mechanical (+/- 10s)
  let startTime = Math.max(0, anchor.timestamp - 10);
  let endTime = anchor.timestamp + 10;

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
    // If no audio file (remote stream), skip slicing/transcribing for MVP
    // Unless we implement remote slicing.
    if (!audioFile) {
        // Fallback: try to find match in mock transcript or just keep as placeholder
        const match = transcript.find(t => t.start_time <= hz.start_time && t.end_time >= hz.end_time);
        if (match) {
             return { ...hz, transcript_snippet: match.text };
        }
        return { ...hz, transcript_snippet: "[Remote audio transcription not supported in MVP]" };
    }

    try {
      const audioSlice = await sliceAudio(audioFile, hz.start_time, hz.end_time);
      
      let text = hz.transcript_snippet;
      
      // Check if metadata already has text (e.g. re-run)
      if (!text || text === "Processing...") {
        console.log(`Transcribing Hotzone ${hz.id}...`);
        text = await transcribeAudio(audioSlice);
        
        console.log(`Transcription complete for ${hz.id}: "${text.substring(0, 20)}..."`);
      }
      return { ...hz, transcript_snippet: text };
    } catch (error) {
      console.error(`Error processing hotzone ${hz.id}:`, error);
      return { ...hz, transcript_snippet: "[Processing Failed]" };
    }
  }));

  return processedHotzones;
};
