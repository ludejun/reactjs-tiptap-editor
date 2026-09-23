import { version } from '../../package.json';

import { createTranslate } from './i18n/utils';

import type { DefaultTheme, HeadConfig, LocaleConfig } from 'vitepress';

const docsLink = 'https://ludejun.github.io/ai-sparkwrite-editor';
const githubRepo = 'ludejun/ai-sparkwrite-editor';
const githubLink: 'https://github.com/ludejun/ai-sparkwrite-editor' = `https://github.com/${githubRepo}`;

const VERSIONS: (DefaultTheme.NavItemWithLink | DefaultTheme.NavItemChildren)[] = [
  { text: `v${version} (current)`, link: '/' },
  {
    text: 'Release Notes',
    link: 'https://github.com/ludejun/ai-sparkwrite-editor/releases',
  },
  {
    text: 'Contributing',
    link: 'https://github.com/ludejun/ai-sparkwrite-editor/blob/main/CONTRIBUTING.md',
  },
];

export function getLocaleConfig(lang: string) {
  const t = createTranslate(lang);

  const urlPrefix = lang && lang !== 'en' ? `/${lang}` : '';
  const title = 'ai-sparkwrite-editor';
  const description = t(
    'AI-first rich-text editor SDK on Tiptap: streaming AI writing as real document nodes, formulas and diagrams from a sentence, 16 languages, session replay. React UI, framework-agnostic core.'
  );

  const head: HeadConfig[] = [
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:url', content: docsLink }],
    ['meta', { property: 'twitter:card', content: 'summary_large_image' }],
    ['link', { rel: 'icon', href: '/favicon.ico', type: 'image/x-icon' }],
    ['meta', { name: 'theme-color', content: '#914796' }],
    [
      'link',
      {
        rel: 'apple-touch-icon',
        href: '/apple-touch-icon.png',
        sizes: '180x180',
      },
    ],
  ];

  const nav: DefaultTheme.NavItem[] = [
    {
      text: t('Guide'),
      link: `${urlPrefix}/guide/getting-started`,
      activeMatch: 'guide',
    },
    {
      text: t('Extensions'),
      link: `${urlPrefix}/extensions/Attachment/index.md`,
      activeMatch: 'extensions',
    },
    {
      text: t('Playground'),
      link: 'https://ludejun.github.io/ai-sparkwrite-editor/playground/',
    },
    {
      text: `v${version}`,
      items: VERSIONS,
    },
  ];

  const sidebar: DefaultTheme.SidebarItem[] = [
    {
      text: t('Guide'),
      items: [
        {
          text: t('Getting Started'),
          link: `${urlPrefix}/guide/getting-started`,
        },
        {
          text: t('Toolbar'),
          link: `${urlPrefix}/guide/toolbar`,
        },
        {
          text: t('Features'),
          link: `${urlPrefix}/guide/features`,
        },
        {
          text: t('Frameworks'),
          link: `${urlPrefix}/guide/frameworks`,
        },
        {
          text: t('Customization'),
          link: `${urlPrefix}/guide/customization`,
        },
        {
          text: t('Bundle size'),
          link: `${urlPrefix}/guide/bundle-size`,
        },
        {
          text: t('Bubble Menu'),
          link: `${urlPrefix}/guide/bubble-menu`,
        },
        {
          text: t('Internationalization'),
          link: `${urlPrefix}/guide/internationalization`,
        },
        {
          text: t('Custom Theme'),
          link: `${urlPrefix}/guide/custom-theme`,
        },
        {
          text: t('How to Migrate'),
          link: `${urlPrefix}/guide/how-to-migrate`,
        },
      ],
    },
    {
      text: t('Extensions'),
      items: [
        { text: 'AI', link: '/extensions/AI/index.md' },
        { text: 'Attachment', link: '/extensions/Attachment/index.md' },
        { text: 'Blockquote', link: '/extensions/Blockquote/index.md' },
        { text: 'Bold', link: '/extensions/Bold/index.md' },
        { text: 'BulletList', link: '/extensions/BulletList/index.md' },
        { text: 'Callout', link: '/extensions/Callout/index.md' },
        { text: 'Clear', link: '/extensions/Clear/index.md' },
        { text: 'Code', link: '/extensions/Code/index.md' },
        { text: 'CodeBlock', link: '/extensions/CodeBlock/index.md' },
        { text: 'CodeView', link: '/extensions/CodeView/index.md' },
        { text: 'Color', link: '/extensions/Color/index.md' },
        { text: 'Column', link: '/extensions/Column/index.md' },
        { text: 'Details', link: '/extensions/Details/index.md' },
        { text: 'Drawer', link: '/extensions/Drawer/index.md' },
        { text: 'Emoji', link: '/extensions/Emoji/index.md' },
        { text: 'Excalidraw', link: '/extensions/Excalidraw/index.md' },
        { text: 'ExportPdf', link: '/extensions/ExportPdf/index.md' },
        { text: 'ExportWord', link: '/extensions/ExportWord/index.md' },
        { text: 'ExportMarkdown', link: '/extensions/ExportMarkdown/index.md' },
        { text: 'FontFamily', link: '/extensions/FontFamily/index.md' },
        { text: 'FontSize', link: '/extensions/FontSize/index.md' },
        { text: 'FormatPainter', link: '/extensions/FormatPainter/index.md' },
        { text: 'Heading', link: '/extensions/Heading/index.md' },
        { text: 'Highlight', link: '/extensions/Highlight/index.md' },
        { text: 'History', link: '/extensions/History/index.md' },
        {
          text: 'HorizontalRule',
          link: '/extensions/HorizontalRule/index.md',
        },
        { text: 'Iframe', link: '/extensions/Iframe/index.md' },
        { text: 'Image', link: '/extensions/Image/index.md' },
        { text: 'ImageGif', link: '/extensions/ImageGif/index.md' },
        { text: 'ImportWord', link: '/extensions/ImportWord/index.md' },
        { text: 'Indent', link: '/extensions/Indent/index.md' },
        { text: 'Italic', link: '/extensions/Italic/index.md' },
        { text: 'Katex', link: '/extensions/Katex/index.md' },
        { text: 'LineHeight', link: '/extensions/LineHeight/index.md' },
        { text: 'Link', link: '/extensions/Link/index.md' },
        { text: 'Mention', link: '/extensions/Mention/index.md' },
        { text: 'Mermaid', link: '/extensions/Mermaid/index.md' },
        { text: 'MoreMark', link: '/extensions/MoreMark/index.md' },
        { text: 'OrderedList', link: '/extensions/OrderedList/index.md' },
        {
          text: 'Recorder',
          link: '/extensions/Recorder/index.md',
        },
        {
          text: 'RichPaste',
          link: '/extensions/RichPaste/index.md',
        },
        {
          text: 'SearchAndReplace',
          link: '/extensions/SearchAndReplace/index.md',
        },
        { text: 'ShortMessage', link: '/extensions/ShortMessage/index.md' },
        { text: 'SlashCommand', link: '/extensions/SlashCommand/index.md' },
        { text: 'Strike', link: '/extensions/Strike/index.md' },
        { text: 'Table', link: '/extensions/Table/index.md' },
        { text: 'TableOfContents', link: '/extensions/TableOfContents/index.md' },
        { text: 'TaskList', link: '/extensions/TaskList/index.md' },
        { text: 'TextAlign', link: '/extensions/TextAlign/index.md' },
        { text: 'TextDirection', link: '/extensions/TextDirection/index.md' },
        { text: 'TextUnderline', link: '/extensions/TextUnderline/index.md' },
        { text: 'Twitter', link: '/extensions/Twitter/index.md' },
        { text: 'Video', link: '/extensions/Video/index.md' },
      ],
    },
  ];

  const themeConfig: DefaultTheme.Config = {
    logo: '/logo.png',
    nav,
    sidebar,
    socialLinks: [
      { icon: 'github', link: githubLink },
      {
        icon: 'npm',
        link: 'https://www.npmjs.com/package/ai-sparkwrite-editor',
      },
    ],
    footer: {
      message: t('Made with ❤️'),
      copyright: 'MIT License © 2026-PRESENT <a href="https://github.com/ludejun">ludejun</a>',
    },
    editLink: {
      pattern: `${githubLink}/edit/main/docs/:path`,
      text: t('Edit this page on GitHub'),
    },
  };

  const localeConfig: LocaleConfig<DefaultTheme.Config>[string] = {
    label: t('English'),
    lang: t('en'),
    title,
    description,
    head,
    themeConfig,
  };

  return localeConfig;
}
