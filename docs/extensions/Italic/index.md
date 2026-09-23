---
description: Italic

next:
  text: Katex
  link: /extensions/Katex/index.md
---

# Italic

Apply italic emphasis to selected text.

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
import { Italic, RichTextItalic } from 'ai-sparkwrite-editor/italic';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Italic];

export default function ItalicExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextItalic />
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
import { Italic } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextItalic } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Italic];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextItalic />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Select text and click **Italic**, or enable it before typing. The command is `editor.chain().focus().toggleItalic().run()`.

## Options

### shortcutKeys

Type: `string[]`\
Default: `['mod', 'I']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
