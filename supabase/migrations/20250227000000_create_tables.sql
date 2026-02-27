-- Create anchors table
CREATE TABLE IF NOT EXISTS public.anchors (
    id TEXT PRIMARY KEY,
    audio_id TEXT NOT NULL,
    timestamp FLOAT NOT NULL,
    source TEXT CHECK (source IN ('manual', 'auto')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create hotzones table
CREATE TABLE IF NOT EXISTS public.hotzones (
    id TEXT PRIMARY KEY,
    audio_id TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    transcript_snippet TEXT,
    source TEXT CHECK (source IN ('manual', 'auto')) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    status TEXT CHECK (status IN ('pending', 'reviewed', 'archived')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotzones ENABLE ROW LEVEL SECURITY;

-- Create policies for anchors
-- Allow anonymous and authenticated users to read all anchors (for demo purposes)
CREATE POLICY "Allow public read access on anchors"
ON public.anchors FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anonymous and authenticated users to insert anchors
CREATE POLICY "Allow public insert access on anchors"
ON public.anchors FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create policies for hotzones
-- Allow anonymous and authenticated users to read all hotzones
CREATE POLICY "Allow public read access on hotzones"
ON public.hotzones FOR SELECT
TO anon, authenticated
USING (true);

-- Allow anonymous and authenticated users to insert hotzones
CREATE POLICY "Allow public insert access on hotzones"
ON public.hotzones FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to update hotzones
CREATE POLICY "Allow public update access on hotzones"
ON public.hotzones FOR UPDATE
TO anon, authenticated
USING (true);

-- Grant permissions (Crucial step often missed)
GRANT ALL ON public.anchors TO anon;
GRANT ALL ON public.anchors TO authenticated;
GRANT ALL ON public.hotzones TO anon;
GRANT ALL ON public.hotzones TO authenticated;
