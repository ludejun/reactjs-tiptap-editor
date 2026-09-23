---
description: Install ai-sparkwrite-editor and render a working editor in React or Vue

next:
  text: RichTextKit
  link: /guide/kit.md
---

# Getting Started

`ai-sparkwrite-editor` is Tiptap extensions plus ready-made controls, from **one import per framework**: `ai-sparkwrite-editor` for React, `ai-sparkwrite-editor/vue` for Vue. The fastest start is the kit — `RichTextKit` registers every feature, `RichTextKitToolbar` and `RichTextKitMenus` render the UI — and you can just as well pick features one by one from the same import. Bundlers that tree-shake ES modules only ship what you reference, so the single import costs nothing (see [Bundle size](/guide/bundle-size)).

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

The `@tiptap/extension-*` packages are only needed when you assemble the extensions yourself (next section but one); the kit brings its own.

### 2. The whole editor in ten lines

`RichTextKit` is every feature as one extension, like Tiptap's StarterKit (every option on its [own page](/guide/kit)); `RichTextKitToolbar` and `RichTextKitMenus` render a toolbar, the AI composer dock, the bubble menus, the drag handle and the slash menu for whatever is registered.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import {
  RichTextKit,
  RichTextKitMenus,
  RichTextKitToolbar,
  RichTextProvider,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

export default function Editor() {
  const editor = useEditor({
    extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })],
    content: '<p>Hello</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextKitToolbar />
      <EditorContent editor={editor} />
      <RichTextKitMenus />
    </RichTextProvider>
  );
}
```

Every key of `RichTextKit.configure({ … })` is a feature: `false` leaves it out (and its button and menus disappear with it), an object configures it — `image: { upload }`, `codeBlock: { defaultLanguage: 'ts' }`, `ai: { endpoint }`. Features that need a key or a callback are opt-in and appear only when given an object: `imageGif: { GIPHY_API_KEY }`, `mention: { suggestion }`, `emoji: {}`, `excalidraw: {}`, `drawer: {}`, `twitter: {}`, `shortMessage: { messages }`, `recorder: {}`, `placeholder: { placeholder: 'Write…' }`, `horizontalRule: {}`. `<RichTextKitToolbar more={false}>` drops the "More tools" panel; its children are placed as extra controls. `<RichTextKitMenus composer={false} dragHandle={false} />` trims the floating UI.

### 3. Or pick the features yourself

The same import gives you every extension and control; register the extensions you want and place their controls:

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  Bold,
  RichTextBold,
  Italic,
  RichTextItalic,
  History,
  RichTextUndo,
  RichTextRedo,
  RichTextBubbleText,
} from 'ai-sparkwrite-editor';
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

The stylesheet supplies the controls and the content styles; the consuming app does not need Tailwind. Leave the AI pieces out if you do not want them — every feature is opt-in. The per-feature subpaths (`ai-sparkwrite-editor/bold`, `/ai`, `/bubble/text`…) still exist for bundlers that do not tree-shake.

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

`ai-sparkwrite-editor/vue` depends only on `vue`, `@tiptap/vue-3` and `lucide-vue-next`; nothing from React is loaded. It exports the extensions too (the framework-free ones plus the blocks with a Vue node view), so a Vue app needs this one import.

### 2. The whole editor in ten lines

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import {
  RichTextKit,
  RichTextKitMenus,
  RichTextKitToolbar,
  RichTextProvider,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })],
  content: '<p>Hello</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextKitToolbar />
    <EditorContent :editor="editor" />
    <RichTextKitMenus />
  </RichTextProvider>
</template>
```

The Vue kit takes the same options as the React one, minus the React-only features (Excalidraw, the drawer, emoji, mentions, the Twitter embed, the slash menu); `column` and `imageGif` are opt-in.

### 3. Or pick the features yourself

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold,
  History,
  Italic,
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

Everything — extensions, node views and controls — comes from `ai-sparkwrite-editor/vue`; the framework-free `ai-sparkwrite-editor/core` entry remains for headless or non-Vue setups. The full list is in [Frameworks](/guide/frameworks). Only English is bundled; register other languages with `localeActions.setMessage` (see [Internationalization](/guide/internationalization)).

## The pieces

| Piece                                      | Responsibility                                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `useEditor`                                | Creates the Tiptap instance and configures content, extensions, and callbacks.                 |
| `RichTextKit`                              | Every feature as one extension; `.configure({ bold: false, ai: { endpoint } })` shapes it.     |
| `RichTextKitToolbar`, `RichTextKitMenus`   | A toolbar and the floating UI for whatever is registered.                                      |
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

[AI](/extensions/AI/) for the composer, autocomplete and providers · [Toolbar](/guide/toolbar) and [Bubble Menu](/guide/bubble-menu) for composing the UI · [Features](/guide/features) for every extension and its options · [Frameworks](/guide/frameworks) for the core/React/Vue split · [Internationalization](/guide/internationalization) · [Custom Theme](/guide/custom-theme) · [Bundle size](/guide/bundle-size).
