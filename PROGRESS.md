# Simpod Development Progress

This file tracks the implementation status of the Simpod project features based on the PRD.

## Phase 1: MVP Core (Blind Marking & Hotzones)

### 1. Audio Engine & Media Linkage
- [x] **Integrate Audio Player**: Implemented `useAudioEngine` hook wrapping HTML5 Audio with Zustand state management.
- [x] **Hardware Media Keys**: Mapped `MediaSession` API "Next Track" and "Previous Track" events to "Add Anchor" and "Seek" functions.
- [x] **Non-blocking `addAnchor`**: Created a seamless anchor timestamp capture function that does not pause playback.

### 2. Hotzone Pipeline
- [x] **Layer 1 (Mechanical)**: Implemented `audioUtils.ts` to physically slice audio blobs from `[Anchor-10s, Anchor+10s]`.
- [x] **Transcription Integration**: Integrated Groq API (`whisper-large-v3`) to transcribe the sliced audio segments.
- [ ] **Layer 2 (Contextual Alignment)**: *Pending.* Currently using raw 20s window; needs logic to align boundaries to nearest full sentences using word-level timestamps.
- [x] **Database Storage**: Configured Supabase `hotzones` table and implemented `saveHotzone` API with RLS policies.

### 3. Batch Review UI
- [x] **Review Deck Component**: Built a full-screen modal with Framer Motion transitions for reviewing hotzones.
- [x] **Spotlight View**: Implemented UI where the current text is bold and context is dimmed (opacity 40%).
- [x] **Scroll Interaction**: Added vertical scrolling support for viewing transcript context.

### 4. Smart Cruise Mode
- [x] **Speed Control UI**: Created `SmartCruiseControl` component to toggle mode and visualize status.
- [ ] **Dynamic Speed Adjustment**: *Pending.* Logic exists in UI but needs to be hooked up to real-time playback position monitoring against the new `hotzones` data.

### 5. Data & Infrastructure
- [x] **Project Setup**: Initialized Vite + React + TypeScript + Tailwind CSS structure.
- [x] **Supabase Setup**: Applied migrations for `anchors` and `hotzones` tables.
- [x] **Groq API**: Configured secure API calls to Groq for cost-effective transcription.

## Phase 2: User System & Mobile Polish (Upcoming)
- [ ] **User Authentication**: Implement Supabase Auth.
- [ ] **PWA Support**: Add manifest and service workers for installability.
- [ ] **Real File Upload**: (Completed in Phase 1) Added local file upload support.
