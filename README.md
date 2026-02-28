# Simpod - The Power of Pepper 🌶️

Simpod is an AI-powered podcast player designed for language learners. It features "Smart Cruise" mode, which automatically detects and loops key vocabulary segments ("Hotzones") in podcasts.

## Features

- **RSS Podcast Aggregator**: Search and subscribe to any podcast (via iTunes & Podcast Index).
- **Smart Cruise Control**: Auto-loops difficult segments.
- **AI Transcription**: (Planned) Local & Cloud transcription.
- **PWA Support**: Installable on Mobile & Desktop.
- **Vercel Serverless**: Backend proxy for CORS and API handling.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Vercel Serverless Functions, Supabase (Database)
- **State Management**: Zustand
- **Audio**: Custom Audio Engine Hook

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` (create it if missing) and add your keys:
   ```env
   VITE_SUPABASE_URL=your_url
   VITE_SUPABASE_ANON_KEY=your_key
   PODCAST_INDEX_KEY=your_key
   PODCAST_INDEX_SECRET=your_secret
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```

## Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for Vercel configuration and PWA details.

## License

MIT
