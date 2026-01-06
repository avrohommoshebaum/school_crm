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
});
