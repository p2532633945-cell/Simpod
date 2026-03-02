# Simpod Development Log

## 2026-03-02 (Current)

### Summary
Focused on fixing critical deployment issues and implementing remote audio transcription. The core MVP workflow is being established but faces network/security challenges (Mixed Content/CORS) in production.

### ✅ Completed & Verified (Locally)
- **Automatic Playback Fix**: Resolved race condition in `useAudioEngine` that caused infinite play/pause loop.
- **Hybrid Search**: Implemented search across Podcast Index & iTunes with deduplication.
- **Data Structure**: Separated `hotzones` (private) from `transcripts` (public/shared) in Supabase.
- **Groq Integration**: Connected Whisper API for word-level transcription.

### 🚀 v0.2.3 - Smart Incremental Generation (In Progress)
- **Goal**: Support extending existing hotzones instead of skipping them when a new anchor is added near the boundary.
- **Features**:
  - **Smart Extension**: Detects if an anchor falls near the end of an existing zone and extends it.
  - **Diff Transcription**: Only transcribes the newly added duration (the "diff") to save costs and time.
  - **Official Transcript Support**: (Planned) Prioritize `<podcast:transcript>` from RSS.

### � Pending Verification (Deployed)
- **Remote Audio Slicing (CORS Proxy)**: 
  - Implemented `corsproxy.io` to bypass Mixed Content (HTTPS -> HTTP) and CORS restrictions.
  - **Status**: Code committed (`Fix_CORS_Proxy`) but pending successful deployment to Vercel. Previous deployment failed due to network timeout during push.

### 📅 Next Steps (Tomorrow)
1.  **Transcript Sourcing Strategy**:
    - Prioritize fetching existing transcripts from RSS/Podcast Index to reduce Groq costs.
    - Fallback to Groq only when necessary.
2.  **Intelligent Hotzone Refinement**:
    - Improve "Magnet" logic: Visual UI for snapping to sentence boundaries.
    - Add "Undo/Redo" or manual adjustment for auto-generated zones.
3.  **Long-Term Audio Proxy**:
    - Replace temporary `corsproxy.io` with custom Vercel Serverless Function to ensure stability and control.

### 🐛 Known Issues
- **GitHub Connection**: Intermittent timeouts preventing `git push`.
- **Mixed Content**: Remote audio from HTTP sources (e.g., BBC) fails on HTTPS Vercel deployment without proxy.
