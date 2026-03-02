# Changelog

All notable changes to this project will be documented in this file.

## [0.3.1] - 2026-03-02
### Added
- **Smart Hotzone Extension**: Automatically extends existing hotzones when new anchors are added near their boundaries, preventing duplicate segments.
- **Direct RSS Input**: Support for pasting RSS feed URLs directly into the search bar in Podcast Library.

### Fixed
- **Hotzone Schema**: Resolved `transcript_words` column error by correctly nesting it within `metadata` JSONB.
- **RSS Proxy**: Fixed 500 errors by adding proper User-Agent headers and URL decoding.

## [0.3.0] - 2026-03-02
> **Tag**: `v0.3.0-baseline` (Commit: `7642595`)

### Milestone: MVP Core Features
This release marks the completion of the core MVP workflow:
- **Transcription**: Integrated Groq/Whisper API for fast, accurate speech-to-text.
- **Backtrack Playback**: Added "J" key / "Backtrack" button in Review Deck to replay the previous hotzone instantly.
- **Smart Hotzones (Basic)**:
  - **Idempotency**: Prevents re-transcribing already processed segments.
  - **Review Deck**: Interactive cards with playback controls and context scrolling.

## [0.2.0] - 2026-03-01
### Added
- **Hotzone Data Model**: Defined schema for `Hotzone` and `TranscriptSegment`.
- **Supabase Integration**: Connected `hotzones` table for persistence.

### Added
- **PWA Support**: Added `vite-plugin-pwa` configuration, `manifest.json`, and service worker strategy for offline capability and "Add to Home Screen" functionality.
- **Hybrid API Strategy**: Implemented a robust search system that falls back to iTunes API when Podcast Index fails or returns no results (fixing "6minutes" search issue).
- **Vercel Serverless Functions**: Created `/api/podcast-search` to handle secure API requests and bypass CORS issues in production.

### Changed
- **Mobile UI**: Removed the intrusive `vite-plugin-trae-solo-badge` which was causing layout distortion on mobile devices.
- **Audio Player**: Optimized waveform animation and progress bar responsiveness to fix "stiffness" issues.
- **Deployment**: Migrated from pure client-side fetching to Vercel Serverless architecture for better stability and security.

### Fixed
- **Search**: Fixed issue where searching for combined words (e.g., "6minutes") returned no results by implementing a fuzzy search fallback.
- **Encoding**: Fixed character encoding issues for Chinese podcast titles and descriptions.
- **Local Dev**: Resolved conflicts between `vite-plugin-vercel` and local development environment by implementing a conditional proxy strategy.

## [0.0.1] - 2026-02-27

### Added
- Initial project structure with React, TypeScript, and Tailwind CSS.
- Basic Audio Engine hook (`useAudioEngine`).
- Podcast Player UI components.
