// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // auto-open browser on dev start
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false, // allow self-signed SSL in dev if needed
      },
    },
  },
  build: {
    outDir: 'dist', // ensure Render uses dist as publish directory
    sourcemap: true, // helpful for debugging production errors
  },
  resolve: {
    alias: {
      '@': '/src', // shorthand for imports (e.g., import Home from '@/pages/Home')
    },
  },
});
