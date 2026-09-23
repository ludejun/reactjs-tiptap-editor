# Frameworks

The editor is Tiptap underneath, and Tiptap is framework-agnostic: the same extensions run in React, Vue, Svelte or a plain page through their respective bindings. What is React-specific here is the **UI** — toolbar controls, bubble menus, dialogs, and the node views that make blocks like the divider or the code block interactive inside the document.

The package is therefore split in two layers:

| Layer | Import                                                      | Depends on React | Contents                                                                                                                                                                                                                                                                                                                          |
| ----- | ----------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core  | `ai-sparkwrite-editor/core`                                           | No               | Extensions without node views (marks, headings, lists, tables, links, alignment, indent, font, colour, divider…; columns and the suggestion popups — mention, short message — stay in the React layer for now), paste rules, search & replace, recorder, the AI transport and markdown rendering, image bookkeeping, translations |
| React | `ai-sparkwrite-editor`, `ai-sparkwrite-editor/<feature>`, `ai-sparkwrite-editor/bubble/*` | Yes              | Everything above plus controls, bubble menus, dialogs and node views                                                                                                                                                                                                                                                              |

A build check (`tests/core-headless.test.mjs`) walks the chunk graph of the core bundle and fails if anything reachable from it imports `react`, `@tiptap/react`, Radix or lucide.

## Vue

Two imports: `ai-sparkwrite-editor/core` for the extensions and `ai-sparkwrite-editor/vue` for the UI. The Vue layer ships a provider, composables, toolbar primitives, ready-made controls for the core extensions, and Vue node views (the divider today). It depends only on `vue`, `@tiptap/vue-3` and `lucide-vue-next`, and shares the stylesheet with the React controls, so both toolbars look the same.

```bash
pnpm add ai-sparkwrite-editor @tiptap/vue-3 @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text lucide-vue-next
```

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold,
  Heading,
  BulletList,
  ListItem,
  Table,
  TextAlign,
  RichPaste,
  localeActions,
} from 'ai-sparkwrite-editor/core';
import {
  Divider, // core divider + Vue node view
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextHeading,
  RichTextBold,
  RichTextBulletList,
  RichTextTable,
  RichTextTextAlign,
  RichTextDivider,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

import zhCN from 'ai-sparkwrite-editor/locales/zh-cn';

localeActions.setMessage('zh_CN', zhCN); // only English is bundled
localeActions.setLang('zh_CN');

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Heading,
    BulletList,
    ListItem,
    Table,
    TextAlign,
    Divider,
    RichPaste,
  ],
  content: '<p>你好</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextHeading />
      <RichTextToolbarDivider />
      <RichTextBold /><RichTextBulletList /><RichTextTextAlign />
      <RichTextToolbarDivider />
      <RichTextTable /><RichTextDivider />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

`RichTextProvider` renders the root element with the `ai-sparkwrite-editor` class and hands the editor to every control below it. The example under `examples/vue` in the repository is this page with every control on it (`pnpm --dir examples/vue dev`).

### What the Vue layer contains

| Kind                     | Exports                                                                                                                                                                                                                                                                                                                     |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider and composables | `RichTextProvider`, `useEditorInstance()`, `useEditorState(selector, fallback)`, `useLocale()`                                                                                                                                                                                                                              |
| Toolbar primitives       | `RichTextToolbar`, `RichTextToolbarDivider`, `RichTextToolbarButton`, `RichTextDropdown`, `RichTextToolbarMore`, `RichTextToolbarMoreGroup`, `RichTextToolbarMoreRow`                                                                                                                                                       |
| Controls                 | `RichTextUndo`, `RichTextRedo`, `RichTextBold`, `RichTextItalic`, `RichTextUnderline`, `RichTextStrike`, `RichTextCode`, `RichTextClear`, `RichTextHeading`, `RichTextBulletList`, `RichTextOrderedList`, `RichTextTaskList`, `RichTextBlockquote`, `RichTextTextAlign`, `RichTextLink`, `RichTextTable`, `RichTextDivider` |
| Node views               | `Divider` (style picker and editable caption, same DOM and CSS as the React one)                                                                                                                                                                                                                                            |

Your own control is a `RichTextToolbarButton` with an `onClick` that runs a command, or a `RichTextDropdown` with items; `useEditorState` gives it reactive `isActive`/`can()` state.

### Not in Vue yet

Bubble menus, the AI panel, dialogs (link, image upload, Katex, Mermaid) and the node views for code block, callout, details, image, video, iframe, Katex, Mermaid, Excalidraw, drawer, attachment, table of contents. Their extensions still work — blocks render through `renderHTML`, `generateAIText` and `markdownToSlice` do the AI work — but the in-document affordances are React only. The Vue divider node view is the template for porting the rest: same DOM, same classes, `VueNodeViewRenderer` instead of `ReactNodeViewRenderer`.

## Plain JavaScript

```ts
import { Editor } from '@tiptap/core';
import { Bold, Heading, Table, RichPaste } from 'ai-sparkwrite-editor/core';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [/* Document, Paragraph, Text, */ Bold, Heading, Table, RichPaste],
});
```

## What stays React-only today

- Controls and bubble menus (`RichText*` components).
- Node views: code block language picker, callout, details, image (crop, caption, rotate), video, iframe, Katex, Mermaid, Excalidraw, drawer, attachment, emoji and mention popups, table of contents, the AI panel.

Each of these is a thin layer over a command or an attribute the core already exposes, so a Vue port is UI work, not editor work. The natural order is: a Vue `Divider` node view (smallest), then the AI panel (`generateAIText` + `markdownToSlice` already do the heavy lifting), then the bubble menus.

## Adding a framework-free extension

Keep the extension module (`src/extensions/<Name>/<Name>.ts`) free of component imports and re-export components from the folder's `index.ts` only; the build makes the React entry from `index.ts` and the core entry from the extension module, so the two never share a React-bearing chunk. Then export it from `src/core.ts` and run the headless check.
