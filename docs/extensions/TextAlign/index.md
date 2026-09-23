---
description: TextAlign

next:
  text: TextDirection
  link: /extensions/TextDirection/index.md
---

# Text Align

Align supported text blocks to the left, center, right, or both margins.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { TextAlign, RichTextAlign } from 'ai-sparkwrite-editor/textalign';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextAlign];

export default function TextAlignExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextAlign />
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
import { TextAlign } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextTextAlign } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextAlign];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextTextAlign />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Place the cursor in a paragraph and choose an alignment. Configure `types` with the node names you want to support, for example `TextAlign.configure({ types: ["paragraph", "heading"] })`. Register Heading as well if your document uses headings.

## Options

### shortcutKeys

Type: `string[][]`\
Default: `[['mod', 'shift', 'L'], ['mod', 'shift', 'E'], ['mod', 'shift', 'R'], ['mod', 'shift', 'J']]`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
