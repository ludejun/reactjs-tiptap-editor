---
description: TextDirection

next:
  text: TextUnderline
  link: /extensions/TextUnderline/index.md
---

# Text Direction

Set the writing direction of text blocks for left-to-right or right-to-left content.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, TextDirection, RichTextTextDirection } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextDirection];

export default function TextDirectionExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
    textDirection: 'auto',
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTextDirection />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

```vue [Vue]
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextDirection, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextDirection];

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
```

:::

::: tip Vue
Not in the Vue layer yet: `RichTextTextDirection` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

The example sets `textDirection: "auto"` on `useEditor` so the direction control can also restore automatic direction. Direction determines writing order; use [Text Align](/extensions/TextAlign/) to change alignment.
