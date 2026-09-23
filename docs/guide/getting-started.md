---
description: Install ai-sparkwrite-editor and render a working editor in React or Vue

next:
  text: Toolbar
  link: /guide/toolbar.md
---

# Getting Started

`ai-sparkwrite-editor` is Tiptap extensions plus ready-made controls. You create the editor instance, choose its features, and compose the interface. The same extensions serve both frameworks: React imports each feature from `ai-sparkwrite-editor/<feature>`, Vue imports the extensions from `ai-sparkwrite-editor/core` and the UI from `ai-sparkwrite-editor/vue`.

Keep every `@tiptap/*` package on one compatible version. This repository uses `^3.29.2`; `@tiptap/vue-3` has to match `@tiptap/core` exactly.

## React

### 1. Install

::: code-group

```sh [pnpm]
pnpm add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [npm]
npm install ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [bun]
bun add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [yarn]
yarn add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

:::

Feature subpaths such as `ai-sparkwrite-editor/bold` are part of the package, not separate installs. When an example imports another `@tiptap/*` package, add that package too.

### 2. Render a working editor

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { Italic, RichTextItalic } from 'ai-sparkwrite-editor/italic';
import { History, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor/history';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  History,
  Bold,
  Italic,
  // One URL on your backend; which provider and model answer is its business.
  AI.configure({ endpoint: '/api/ai' }),
  AIAutocomplete,
];

export default function TextEditor() {
  const editor = useEditor({
    extensions,
    content: '<p>Select some text, or press the AI button.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextAI />
        <RichTextToolbarDivider />
        <RichTextUndo />
        <RichTextRedo />
        <RichTextBold />
        <RichTextItalic />
      </RichTextToolbar>
      <EditorContent editor={editor} />
      <RichTextAIComposer />
      <RichTextBubbleText />
    </RichTextProvider>
  );
}
```

The stylesheet supplies the controls and the content styles; the consuming app does not need Tailwind. Leave the AI pieces out if you do not want them — every feature is opt-in.

### Next.js and server rendering

Keep the editor in a client component (`'use client'`) with `immediatelyRender: false`, handle the initial `null` editor before rendering the provider, and import the stylesheet where your framework allows global CSS. See the [Tiptap React integration](https://tiptap.dev/docs/editor/getting-started/install/react).

## Vue

### 1. Install

::: code-group

```sh [pnpm]
pnpm add ai-sparkwrite-editor @tiptap/vue-3@3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2 lucide-vue-next
```

```sh [npm]
npm install ai-sparkwrite-editor @tiptap/vue-3@3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2 lucide-vue-next
```

:::

`ai-sparkwrite-editor/vue` depends only on `vue`, `@tiptap/vue-3` and `lucide-vue-next`; nothing from React is loaded.

### 2. Render a working editor

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Bold, History, Italic } from 'ai-sparkwrite-editor/core';
import {
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  RichTextBold,
  RichTextBubbleText,
  RichTextItalic,
  RichTextProvider,
  RichTextRedo,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextUndo,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    History,
    Bold,
    Italic,
    AI.configure({ endpoint: '/api/ai' }), // one URL on your backend
    AIAutocomplete,
  ],
  content: '<p>Select some text, or press the AI button.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextAI />
      <RichTextToolbarDivider />
      <RichTextUndo /><RichTextRedo /><RichTextBold /><RichTextItalic />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
    <RichTextBubbleText />
  </RichTextProvider>
</template>
```

Block extensions with an interactive node view (`CodeBlock`, `Image`, `Katex`, `Divider`, …) come from `ai-sparkwrite-editor/vue` too, so the Vue node view is attached; everything else comes from `core`. The full list is in [Frameworks](/guide/frameworks). Only English is bundled; register other languages with `localeActions.setMessage` (see [Internationalization](/guide/internationalization)).

## The pieces

| Piece                                      | Responsibility                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `useEditor`                                | Creates the Tiptap instance and configures content, extensions, and callbacks.                 |
| `Document`, `Paragraph`, `Text`            | Define the minimal document structure. Register each once.                                     |
| `Bold`, `Image`, `AI`, etc.                | Add nodes, marks, commands, or behaviour to `extensions`.                                      |
| `RichTextProvider`                         | Makes the editor available to the controls and carries the root class the stylesheet keys off. |
| `RichTextBold`, `RichTextAI`, etc.         | Controls for registered extensions. Place them in the toolbar yourself.                        |
| `RichTextAIComposer`, `RichTextBubbleText` | The dock under the editor and the selection menu. Place them after `EditorContent`.            |
| `EditorContent`                            | Renders the editable document. It does not add a toolbar.                                      |

For each feature, register the extension **and** render its control if you want a button. Importing a control alone does not enable the feature; an extension can also be driven through commands without a button. Avoid registering both a library extension and a Tiptap extension with the same name — if you use `StarterKit`, disable overlapping features there first.

## Save, load, read-only

Read the document in `onUpdate` and debounce network saves:

```ts
const editor = useEditor({
  extensions,
  onUpdate: ({ editor }) => {
    const nextDocument = editor.getJSON(); // or editor.getHTML()
    save(nextDocument);
  },
});
```

Pass saved HTML or Tiptap JSON as `content` when creating the editor. For a document loaded later, call `editor.commands.setContent(html, { emitUpdate: false })` once, not on every `onUpdate`. Keep the extensions that stored content needs registered when loading it; a node the schema does not know cannot be represented.

Read-only: `editable: false` in `useEditor`, or `editor.setEditable(false)` later. The AI dock, menus and Space/Tab entry points hide themselves while the editor is not editable.

## Troubleshooting

| Symptom                                       | What to check                                                                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| A control is missing                          | Register its extension and render the control under `RichTextProvider`.                                                    |
| Unknown node or missing command               | Check the feature's page for companion extensions (lists need `ListItem`, colours need `TextStyle`).                       |
| Duplicate extension warning                   | Remove overlapping registrations, including those inside `StarterKit`.                                                     |
| UI has no styling                             | Import `ai-sparkwrite-editor/style.css` and any feature-specific stylesheet.                                               |
| Two copies of `@tiptap/core`                  | Pin `@tiptap/vue-3` (and every `@tiptap/*`) to the same version; a mismatch breaks the schema.                             |
| Content does not change after fetching        | Use `setContent` after loading; `content` only initialises the document.                                                   |
| A slash placeholder appears but no menu opens | Register `SlashCommand` and mount `SlashCommandList` (React); a placeholder is only text.                                  |
| The AI button does nothing                    | Register the `AI` extension with an `endpoint` (or a model / `generate`); otherwise the panel shows a configuration error. |
| Upload does not persist                       | Supply an upload callback that resolves to a durable URL.                                                                  |

## Where next

[AI](/extensions/AI/) for the composer, autocomplete and providers · [Toolbar](/guide/toolbar) and [Bubble Menu](/guide/bubble-menu) for composing the UI · [Features](/guide/features) for every extension and its import path · [Frameworks](/guide/frameworks) for the core/React/Vue split · [Internationalization](/guide/internationalization) · [Custom Theme](/guide/custom-theme) · [Bundle size](/guide/bundle-size).
