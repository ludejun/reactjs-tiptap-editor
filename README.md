<p align="center">
  <img src="./docs/public/logo.svg" alt="SparkWrite" width="88" />
</p>

<h1 align="center">ai-sparkwrite-editor</h1>

<p align="center">
  <b>Tell the editor what you want. It writes it, right there in the page.</b><br/>
  An AI-first rich-text editor SDK on Tiptap for React and Vue: prose, tables, code, task lists, formulas and diagrams are produced by the model and land in the document as real, editable blocks.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-sparkwrite-editor"><img alt="npm" src="https://img.shields.io/npm/v/ai-sparkwrite-editor.svg?label=npm&color=804dff" /></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
</p>

<p align="center">
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/"><b>📘 Documentation</b></a>
  &nbsp;·&nbsp;
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/playground/"><b>🎮 Live Playground</b></a>
  &nbsp;·&nbsp;
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/guide/getting-started"><b>🚀 Getting Started</b></a>
  &nbsp;·&nbsp;
  <a href="./README.zh-CN.md"><b>🇨🇳 中文文档</b></a>
</p>

![The editor with the AI composer open under the document](./screenshot/screenshot.png)

## Features

**AI, in the document**

- **Composer dock** — type a request under the editor and the answer streams into the page as headings, lists, tables and code blocks. Keep, undo, retry, or refine the same span; one undo step. Toolbar ✨, `⌘J` or `/ai`.
- **Whole-document actions** — continue writing, summarize, outline, suggest a title, extract action items, fix grammar everywhere, translate. One click each; the document goes to the model as Markdown, so its structure survives.
- **Selection menu** — improve, shorten, expand, simplify, change tone, explain, translate, turn into a table or a list. Works after Select All.
- **Ghost text** — pause while typing and the next words appear in grey; Tab keeps them. Space on an empty line asks AI.
- **Formulas and diagrams from a sentence** — the Katex and Mermaid dialogs write the source and render it live.
- **Your backend, your model** — the frontend configures one `endpoint`. It receives the conversation as JSON and answers with text or a stream; which provider and model reply is your business. Direct OpenAI/Anthropic calls and a custom `generate` remain available. Answers are parsed through the editor schema: nothing is pasted, nothing unknown gets in.

**Everything else a document needs**

- 50+ extensions: headings, lists, tables, code blocks with language detection, images with cropping and captions, dividers, columns, callouts, details, Katex, Mermaid, Excalidraw, video, iframe, attachments, emoji, mentions, table of contents, search & replace, Word/PDF/Markdown import and export.
- Paste from Word, Google Docs, Excel and code editors keeps its shape.
- 16 languages, loaded on demand, with matching CJK, Devanagari and Bengali fonts.
- Record and replay a writing session as timestamped steps.
- One import per feature; the extension and its control come from the same subpath. Bundles stay small — importing `bold` costs about 30 KB of library code and one icon.
- Prefixed Tailwind classes and a handful of CSS variables, so it fits your design system.

## Quick start

Keep every `@tiptap/*` package on one version (`^3.29`).

### React

```bash
pnpm add ai-sparkwrite-editor @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

export function Editor() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      AI.configure({ endpoint: '/api/ai' }), // one URL on your backend; it picks the provider and model
      AIAutocomplete,
    ],
    content: '<p>Hello</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextAI />
        <RichTextToolbarDivider />
        <RichTextBold />
      </RichTextToolbar>
      <EditorContent editor={editor} />
      <RichTextAIComposer />
      <RichTextBubbleText />
    </RichTextProvider>
  );
}
```

### Vue

```bash
pnpm add ai-sparkwrite-editor @tiptap/vue-3 @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text lucide-vue-next
```

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Bold } from 'ai-sparkwrite-editor/core';
import {
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  RichTextBubbleText,
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextBold,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    AI.configure({ endpoint: '/api/ai' }), // one URL on your backend; it picks the provider and model
    AIAutocomplete,
  ],
  content: '<p>Hello</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextAI />
      <RichTextToolbarDivider />
      <RichTextBold />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
    <RichTextBubbleText />
  </RichTextProvider>
</template>
```

Extensions come from `ai-sparkwrite-editor/core` (framework-free), the Vue UI from `ai-sparkwrite-editor/vue`, both on the same stylesheet as the React controls.

Your `/api/ai` receives `{ messages, systemPrompt, stream }` and answers `{ text }` or a stream of `data: {"text"}` events — the contract and a ten-line server are in the [AI docs](https://ludejun.github.io/ai-sparkwrite-editor/extensions/AI/). Every other feature works the same way as `bold`: the extension and its control come from `ai-sparkwrite-editor/<feature>`, listed under [Features](https://ludejun.github.io/ai-sparkwrite-editor/guide/features).

## Documentation

Everything is on the docs site: **[ludejun.github.io/ai-sparkwrite-editor](https://ludejun.github.io/ai-sparkwrite-editor/)** — [getting started](https://ludejun.github.io/ai-sparkwrite-editor/guide/getting-started), [AI](https://ludejun.github.io/ai-sparkwrite-editor/extensions/AI/), [every feature and its import path](https://ludejun.github.io/ai-sparkwrite-editor/guide/features), [frameworks](https://ludejun.github.io/ai-sparkwrite-editor/guide/frameworks), [customization](https://ludejun.github.io/ai-sparkwrite-editor/guide/customization), [bundle size](https://ludejun.github.io/ai-sparkwrite-editor/guide/bundle-size). Try it first in the **[live playground](https://ludejun.github.io/ai-sparkwrite-editor/playground/)**, which answers with a demo model so every AI flow works without a key.

## Development

```bash
pnpm install
pnpm build:lib      # the playground imports the built lib/
pnpm playground     # http://localhost:8000, React ⇄ Vue switch in the header
pnpm type-check && pnpm lint
pnpm docs:dev
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the commit convention and how upstream fixes are brought in.

## Origin

The code base started as a fork of [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor) by hunghg255 and its contributors and has since been reworked extensively. Thank you to them and to the [Tiptap](https://tiptap.dev) and [shadcn/ui](https://ui.shadcn.com/) projects. MIT licensed.
