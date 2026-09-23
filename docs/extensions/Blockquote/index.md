---
description: Blockquote

next:
  text: Bold
  link: /extensions/Bold/index.md
---

# Blockquote

Wrap paragraphs in a blockquote to distinguish quoted material.

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
import { Blockquote, RichTextBlockquote } from 'ai-sparkwrite-editor/blockquote';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Blockquote];

export default function BlockquoteExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBlockquote />
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
import { Blockquote } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextBlockquote } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Blockquote];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextBlockquote />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Place the cursor in a paragraph or select several paragraphs, then click the blockquote button. Click it again to lift the content out of the quote. The command is `editor.chain().focus().toggleBlockquote().run()`.
