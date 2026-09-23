---
description: UnderLine

next:
  text: Twitter
  link: /extensions/Twitter/index.md
---

# Underline

Underline selected text or text typed after enabling the mark.

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
import { TextUnderline, RichTextUnderline } from 'ai-sparkwrite-editor/textunderline';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextUnderline];

export default function TextUnderlineExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextUnderline />
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
import { TextUnderline } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextUnderline } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextUnderline];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextUnderline />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Click the underline button to toggle the mark. For a custom button, use `editor.chain().focus().toggleUnderline().run()`.

## Options

### shortcutKeys

Type: `string[]`\
Default: `['mod', 'U']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
