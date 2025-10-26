import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'lovable-uploads/*.png'],
      manifest: {
        name: 'Voxcal - Intelligente Terminbuchung',
        short_name: 'Voxcal',
        description: 'KI-gestützte Terminbuchung per Telefon für Praxen',
        theme_color: '#007BFF',
        icons: [
          {
            src: '/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/f8bf1ba1-4dee-42dd-9c1d-543ca3de4a53.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/jdbprivzprvpfoxrfyjy\.supabase\.co\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
