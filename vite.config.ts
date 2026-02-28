import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from 'vite-plugin-pwa';
import vercel from 'vite-plugin-vercel';

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Simpod - The Power of Pepper',
        short_name: 'Simpod',
        description: 'AI-Powered Podcast Player for Language Learners',
        theme_color: '#0D0D0F',
        background_color: '#0D0D0F',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    }),
    // vercel(), // Disable vercel plugin temporarily as it causes 500 errors in some environments
    tsconfigPaths()
  ],
})
