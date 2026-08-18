import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'copy-404',
      closeBundle() {
        try {
          const fs = require('node:fs');
          const path = require('node:path');
          const distPath = path.resolve(__dirname, 'dist');
          if (fs.existsSync(path.join(distPath, 'index.html'))) {
            fs.copyFileSync(
              path.join(distPath, 'index.html'),
              path.join(distPath, '404.html')
            );
          }
        } catch {
          // ignore in environments without require
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
