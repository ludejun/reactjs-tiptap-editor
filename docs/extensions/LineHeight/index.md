---
description: LineHeight

next:
  text: Link
  link: /extensions/Link/index.md
---

# Line Height

Apply a line-height value through the text-style mark.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). Install `@tiptap/extension-text-style` at the same version as your other Tiptap packages. The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, LineHeight, RichTextLineHeight } from 'ai-sparkwrite-editor';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, LineHeight];

export default function LineHeightExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextLineHeight />
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
import { TextStyle } from '@tiptap/extension-text-style';
import { LineHeight, RichTextProvider, RichTextLineHeight } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, LineHeight];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextLineHeight />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Register `TextStyle`. Select text, then choose a value from the dropdown. `Default` removes the explicit line height. Configure the choices with `lineHeights`; the values are CSS line heights, such as `1.5` or `2`.

## Configuration

```ts
import { LineHeight } from 'ai-sparkwrite-editor';

LineHeight.configure({
  lineHeights: ['Default', '1.5', '2', '2.5'],
});
```

Use this configured extension in place of the unconfigured one in `extensions`. The default choices are `Default`, `1.5`, `2`, `2.5`, `3`, `3.5`, and `4`.
