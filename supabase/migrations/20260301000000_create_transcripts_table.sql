-- Create a new table for shared transcripts
-- This table stores processed transcription results (text + word-level timestamps) for audio segments.
-- It is shared across all users to enable data reuse and reduce API costs.

CREATE TABLE public.transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_id TEXT NOT NULL, -- The unique identifier for the podcast episode/file
    start_time DOUBLE PRECISION NOT NULL, -- Start time of the transcribed segment
    end_time DOUBLE PRECISION NOT NULL, -- End time of the transcribed segment
    text TEXT NOT NULL, -- The full transcribed text
    words JSONB, -- Word-level timestamps: [{word, start, end}, ...]
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Add an index for fast lookups by audio_id and time range
    CONSTRAINT transcripts_audio_time_unique UNIQUE (audio_id, start_time, end_time)
);

-- Enable RLS
ALTER TABLE public.transcripts ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read transcripts (Shared Data)
CREATE POLICY "Public transcripts are viewable by everyone" 
ON public.transcripts FOR SELECT 
USING (true);

-- Policy: Anyone can insert transcripts (Crowdsourcing)
-- In a real prod app, this might be restricted to server-side only or authenticated users
CREATE POLICY "Anyone can upload transcripts" 
ON public.transcripts FOR INSERT 
WITH CHECK (true);

-- Add comments
COMMENT ON TABLE public.transcripts IS 'Stores shared transcription segments to avoid redundant API calls.';
