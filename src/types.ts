export interface Anchor {
  id: string;
  audio_id: string;
  timestamp: number; // in seconds
  source: 'manual' | 'auto';
  created_at: string;
}

export interface Hotzone {
  id: string;
  audio_id: string;
  start_time: number; // in seconds
  end_time: number; // in seconds
  transcript_snippet: string;
  source: 'manual' | 'auto';
  metadata: {
    confidence?: number;
    difficulty_score?: number;
    user_adjustment_history?: Array<{
      action: 'expand' | 'shrink' | 'merge';
      timestamp: string;
    }>;
  };
  status: 'pending' | 'reviewed' | 'archived';
  created_at: string;
}

export interface TranscriptSegment {
  id: string;
  audio_id: string;
  text: string;
  start_time: number;
  end_time: number;
}

export interface AudioMetadata {
  id: string;
  title: string;
  url: string;
  duration: number;
  transcript?: TranscriptSegment[];
}
