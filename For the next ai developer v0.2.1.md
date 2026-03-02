# Role: Simpod Project Lead Developer
# Context: You are taking over the development of "Simpod", an AI-powered podcast player for language learners.

## 1. Project Overview & Status
- **Core Value**: "Blind Marking" -> "Hotzone Generation" -> "Review". Users mark difficult audio segments while listening, and AI transcribes/explains them later.
- **Current Stage**: MVP (v0.2.1). Core features are implemented but facing production deployment challenges (CORS/Mixed Content).
- **Tech Stack**: React (Vite), Zustand, Tailwind, Supabase (DB), Vercel (Hosting & Serverless Functions), Groq API (Whisper).

## 2. Critical Status Update (Read Carefully!)
The previous developer has implemented two critical fixes LOCALLY to resolve production errors, but **git push failed due to network issues**.
- **Pending Commit 1**: `Fix_BBC_Proxy_Redirect` (Added redirect support to `api/audio-proxy.ts`).
- **Pending Commit 2**: `Fix_Groq_Proxy_CORS` (Created `api/groq-proxy.ts` to proxy Groq API calls).
- **Current State**: Local code is ahead of remote. `npm run dev` works, but production Vercel deployment is broken until push succeeds.

## 3. Key Files to Review
- `DEV_LOG.md`: Contains the most up-to-date daily progress and known issues. **Start here.**
- `api/audio-proxy.ts`: The new custom proxy for streaming remote audio (handles Mixed Content & Range Requests).
- `api/groq-proxy.ts`: The new proxy for Groq transcription (handles CORS & API Key security).
- `src/utils/hotzonePipeline.ts`: The core logic for slicing audio and calling transcription.
- `src/components/PodcastDetail.tsx`: RSS parsing logic (now extracts official transcripts).

## 4. Immediate Priorities (Do This First)
1.  **Push Code**: Retry `git push origin master`. This is blocking the production fix.
2.  **Verify Production**: Once pushed, check Vercel deployment. Verify that:
    - Playing BBC podcasts works (no 302 errors).
    - "Generate Zones" works (no CORS errors from Groq).
3.  **Cost Optimization**: Continue the "Transcript Sourcing Strategy".
    - In `hotzonePipeline.ts`, implement the logic to fetch and parse the *official transcript* (if detected) instead of calling Groq.

## 5. Development Guidelines (Strict Rules)
- **Do NOT revert the Proxy logic**: The proxies in `/api/` are essential for bypassing browser security restrictions (CORS/Mixed Content). Do not switch back to direct client-side fetch.
- **Streaming First**: When dealing with audio, always use streams/pipes. Do not load full files into memory (Vercel has 4.5MB body limit).
- **Data Privacy**: Keep `hotzones` private (user-specific) and `transcripts` public (shared/reused). See `supabase/migrations` for schema.

## 6. Next Steps (Roadmap)
- **Magnet UI**: Visualize the "magnetic snapping" of hotzones to sentence boundaries.
- **PWA Offline**: Investigate Service Worker caching for audio (future task).

Please proceed with **Priority #1** and assume the local code is the source of truth.