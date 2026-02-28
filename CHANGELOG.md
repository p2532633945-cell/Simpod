# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.1.0] - 2026-02-28

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
