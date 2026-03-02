# Role: Simpod Project Lead Developer
# Version: v0.2.2 (Post-Proxy Fix)

## 1. Critical Success & Current Status
- **Proxy Success**: Both `audio-proxy` (streaming) and `groq-proxy` (transcription) are WORKING in production. We successfully bypassed CORS and Mixed Content issues.
- **Transcription Success**: Groq API is returning valid transcripts.
- **Latest Fix**: Resolved a DB schema mismatch where `transcript_words` was being written as a column instead of inside the `metadata` JSONB field.
- **Current State**: Code is pushed (`7eb3dee`). Production should be fully functional pending deployment.

## 2. Key Files to Watch
- `src/utils/hotzonePipeline.ts`:
  - *Action*: Ensure `transcript_words` is always saved inside `metadata`.
  - *Logic*: `metadata: { ...hz.metadata, transcript_words: words }`.
- `supabase/migrations/`:
  - *Reference*: `hotzones` table has `id`, `audio_id`, `start_time`, `end_time`, `transcript_snippet`, `source`, `metadata` (JSONB), `status`. **Do NOT assume other columns exist.**

## 3. Next Debugging Steps (If errors persist)
- If `400 Bad Request` persists on Supabase save:
  - Check the `metadata` JSON payload size. If Groq returns massive word lists, it might hit a size limit (unlikely for short hotzones but possible).
  - Verify that `transcript_snippet` (TEXT) is not null if schema requires it (currently nullable).

## 4. Immediate Roadmap
- **Magnet UI**: Now that we have `transcript_words` in metadata, visualize them on the frontend waveform.
- **Official Transcripts**: We detect them (logs show `[Transcript] Official transcript detected`), but we don't fetch them yet. Implement the fetch logic to skip Groq entirely.