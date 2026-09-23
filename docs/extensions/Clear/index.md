---
description: Clear

next:
  text: Code
  link: /extensions/Code/index.md
---

# Clear

Remove text marks and reset block formatting in the current selection.

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
import { Clear, RichTextClear } from 'ai-sparkwrite-editor/clear';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Clear];

export default function ClearExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextClear />
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
import { Clear } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextClear } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Clear];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextClear />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::


## How to use

Select the content to reset and click the eraser. This runs `editor.chain().focus().clearNodes().unsetAllMarks().run()`: it clears formatting, not the document’s text. To intentionally empty the document, use Tiptap’s `editor.commands.clearContent()`.
