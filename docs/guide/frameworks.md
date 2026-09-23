# Frameworks

The editor is Tiptap underneath, and Tiptap is framework-agnostic: the same extensions run in React, Vue, Svelte or a plain page through their respective bindings. What is React-specific here is the **UI** — toolbar controls, bubble menus, dialogs, and the node views that make blocks like the divider or the code block interactive inside the document.

The package is therefore split in two layers:

| Layer | Import | Depends on React | Contents |
| --- | --- | --- | --- |
| Core | `ai-richtext-editor/core` | No | Extensions without node views (marks, headings, lists, tables, links, alignment, indent, font, colour, divider…; columns and the suggestion popups — mention, short message — stay in the React layer for now), paste rules, search & replace, recorder, the AI transport and markdown rendering, image bookkeeping, translations |
| React | `ai-richtext-editor`, `ai-richtext-editor/<feature>`, `ai-richtext-editor/bubble/*` | Yes | Everything above plus controls, bubble menus, dialogs and node views |

A build check (`tests/core-headless.test.mjs`) walks the chunk graph of the core bundle and fails if anything reachable from it imports `react`, `@tiptap/react`, Radix or lucide.

## Vue

Use `@tiptap/vue-3` for the editor and `ai-richtext-editor/core` for the document behaviour. Bring your own toolbar (Tiptap commands are the same everywhere) and the stylesheet:

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold, Heading, BulletList, OrderedList, Table, Divider, RichPaste, Recorder,
  generateAIText, markdownToSlice, localeActions,
} from 'ai-richtext-editor/core';
import 'ai-richtext-editor/style.css';

localeActions.setLang('zh_CN');

const editor = useEditor({
  extensions: [Document, Paragraph, Text, Bold, Heading, BulletList, OrderedList, Table, Divider, RichPaste, Recorder],
  content: '<p>你好</p>',
});

async function askAI(prompt: string) {
  const text = await generateAIText(
    { protocol: 'openai', apiKey: '', baseURL: '/api/ai', model: 'gpt-4o-mini', maxTokens: 1024, headers: {}, systemPrompt: '', generate: null, translateLanguages: [], enableImageInput: false, enableFileInput: false, imageMimes: [], fileMimes: [], maxAttachmentSize: 0 },
    { messages: [{ role: 'user', content: prompt }], systemPrompt: 'You write documents.', signal: new AbortController().signal },
    (chunk) => console.log(chunk) // stream
  );
  const { from, to } = editor.value!.state.selection;
  editor.value!.view.dispatch(editor.value!.state.tr.replaceRange(from, to, markdownToSlice(editor.value!, text)));
}
</script>

<template>
  <div class="ai-richtext-editor">
    <button @click="editor?.chain().focus().toggleBold().run()">B</button>
    <button @click="editor?.chain().focus().setDivider({ variant: 'text', label: 'Chapter' }).run()">Divider</button>
    <EditorContent :editor="editor" />
  </div>
</template>
```

Wrap the editor in an element with the `ai-richtext-editor` class so the stylesheet applies. Blocks that have React node views (`Divider` in the React package, code block, callout, image…) render through their `renderHTML` in Vue: a divider is still a divider, a code block still a `<pre>`; only the in-document editing affordances (style picker, caption input, language menu) are missing until a Vue node view exists.

## Plain JavaScript

```ts
import { Editor } from '@tiptap/core';
import { Bold, Heading, Table, RichPaste } from 'ai-richtext-editor/core';

const editor = new Editor({ element: document.querySelector('#editor')!, extensions: [/* Document, Paragraph, Text, */ Bold, Heading, Table, RichPaste] });
```

## What stays React-only today

- Controls and bubble menus (`RichText*` components).
- Node views: code block language picker, callout, details, image (crop, caption, rotate), video, iframe, Katex, Mermaid, Excalidraw, drawer, attachment, emoji and mention popups, table of contents, the AI panel.

Each of these is a thin layer over a command or an attribute the core already exposes, so a Vue port is UI work, not editor work. The natural order is: a Vue `Divider` node view (smallest), then the AI panel (`generateAIText` + `markdownToSlice` already do the heavy lifting), then the bubble menus.

## Adding a framework-free extension

Keep the extension module (`src/extensions/<Name>/<Name>.ts`) free of component imports and re-export components from the folder's `index.ts` only; the build makes the React entry from `index.ts` and the core entry from the extension module, so the two never share a React-bearing chunk. Then export it from `src/core.ts` and run the headless check.
