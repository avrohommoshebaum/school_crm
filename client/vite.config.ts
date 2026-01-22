import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "../server/public",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split MUI libraries (largest dependencies)
          'mui-vendor': [
            '@mui/material',
            '@mui/icons-material',
            '@emotion/react',
            '@emotion/styled'
          ],
          // Split router libraries
          'router-vendor': [
            'react-router',
            'react-router-dom'
          ],
          // Split chart library if used
          'charts-vendor': ['recharts'],
          // Split icon library
          'icons-vendor': ['lucide-react'],
        },
      },
    },
  },
  // Ensure CSP-compatible build
  server: {
    headers: {
      // CSP for Vite dev server - allows connections to local API
      "Content-Security-Policy": [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Vite HMR needs unsafe-eval
        "style-src 'self' 'unsafe-inline'",
        "connect-src 'self' http://localhost:8080 http://127.0.0.1:8080 ws://localhost:5173 ws://localhost:5174 ws://127.0.0.1:5173 ws://127.0.0.1:5174",
        "img-src 'self' data: https://storage.googleapis.com https://storage.cloud.google.com",
        "media-src 'self' blob:",
      ].join("; "),
    },
  },
});
