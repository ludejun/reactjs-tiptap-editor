import CopyOrDownloadAsMarkdownButtons from 'vitepress-plugin-llms/vitepress-components/CopyOrDownloadAsMarkdownButtons.vue';
import Theme from 'vitepress/theme';

// import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client'
import './style.css';
import 'uno.css';

// import '@nolebase/vitepress-plugin-git-changelog/client/style.css'
// import '@shikijs/vitepress-twoslash/style.css'
import Layout from './Layout.vue';

import type { EnhanceAppContext } from 'vitepress';

export default {
  ...Theme,
  Layout,
  enhanceApp({ app }: EnhanceAppContext) {
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons);

    // app.use(TwoslashFloatingVue)
  },
};
