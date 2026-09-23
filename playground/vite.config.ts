import * as path from 'node:path';

import react from '@vitejs/plugin-react';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const isAnalyze = mode === 'analyze';

  return {
    define: {
      'process.env': {},
    },
    // The playground hosts both UI layers: React is the app, Vue is mounted
    // into it for the framework switch.
    plugins: [react(), vue()],
    optimizeDeps: {
      include: ['react'],
    },
    css: {
      devSourcemap: isDev,
    },
    build: {
      sourcemap: isAnalyze,
    },
    resolve: {
      alias: [{ find: '@', replacement: path.resolve(import.meta.dirname, 'src') }],
      // The linked workspace package resolves 'react' from the repo root; force a single copy.
      dedupe: ['react', 'react-dom', 'vue', '@tiptap/core', '@tiptap/pm'],
    },
    server: {
      host: '0.0.0.0',
      port: 8000,
    },
    preview: {
      host: '0.0.0.0',
      port: 8000,
    },
  };
});
