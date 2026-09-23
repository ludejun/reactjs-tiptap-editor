---
description: ImageGif

next:
  text: ImportWord
  link: /extensions/ImportWord/index.md
---

# ImageGif

Search for animated GIFs and insert one into the document.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { ImageGif, RichTextImageGif } from 'ai-sparkwrite-editor/imagegif';
import { RichTextBubbleImageGif } from 'ai-sparkwrite-editor/bubble/media';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  ImageGif.configure({ provider: 'giphy', API_KEY: 'YOUR_GIPHY_API_KEY' }),
];

export default function ImageGifExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextImageGif />
      <RichTextBubbleImageGif />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
``` [React]

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { ImageGif, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  ImageGif.configure({ provider: 'giphy', API_KEY: 'YOUR_GIPHY_API_KEY' }),
];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::

::: tip Vue
Not in the Vue layer yet: `RichTextImageGif`, `RichTextBubbleImageGif` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Set `provider` to `"giphy"` (the default) or `"tenor"`, and supply that provider’s `API_KEY`. The placeholder in the example must be replaced for search to work. Click the GIF button, search, and choose a result. Mount `RichTextBubbleImageGif` for contextual editing.
