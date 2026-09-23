import { defineConfig } from 'vite';

import { MarkdownTransform } from './.vitepress/plugins/markdownTransform';

export default defineConfig({
  plugins: [MarkdownTransform()],
  optimizeDeps: {
    exclude: ['vitepress'],
  },
});
