# Deployment Guide

## 1. Vercel Authentication (Login Prompt on Mobile)
If you see a login prompt when opening the app on your mobile device, this is due to **Vercel Deployment Protection**.
By default, Vercel protects "Preview" deployments (and sometimes production if configured) with authentication.

**To disable this for your Production deployment:**
1. Go to your Vercel Project Dashboard.
2. Click on **Settings** -> **Deployment Protection**.
3. Under **Vercel Authentication**, ensure it is **Disabled** for "Production" (or "Preview" if you want to share that link publicly).
4. Save the changes.

## 2. PWA (Progressive Web App) Support
Simpod is now a PWA! This means:
- You can **install** it on your phone or desktop.
- It works offline (caches assets).
- It feels like a native app (no browser chrome).

**How to Install:**
- **iOS (Safari)**: Tap the "Share" button -> "Add to Home Screen".
- **Android (Chrome)**: Tap the menu (three dots) -> "Install App" or "Add to Home Screen".
- **Desktop (Chrome/Edge)**: Click the install icon in the address bar.

## 3. Environment Variables
Ensure the following Environment Variables are set in your Vercel Project Settings:

- `VITE_SUPABASE_URL`: Your Supabase URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `PODCAST_INDEX_KEY`: Your Podcast Index API Key.
- `PODCAST_INDEX_SECRET`: Your Podcast Index API Secret.

## 4. Troubleshooting
- **White Screen**: Check the browser console. Usually due to missing environment variables.
- **Search Issues**: If search fails, check the `api/podcast-search` function logs in Vercel Dashboard -> Functions.
