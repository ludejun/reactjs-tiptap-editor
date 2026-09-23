---
description: BulletList

next:
  text: Clear
  link: /extensions/Clear/index.md
---

# BulletList

Organize paragraphs into an unordered list.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). Install `@tiptap/extension-list` at the same version as your other Tiptap packages. The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { BulletList, RichTextBulletList } from 'ai-sparkwrite-editor/bulletlist';
import { ListItem } from '@tiptap/extension-list';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, BulletList];

export default function BulletListExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBulletList />
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
import { ListItem } from '@tiptap/extension-list';
import { BulletList } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextBulletList } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, BulletList];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextBulletList />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::


## How to use

Register `ListItem` alongside `BulletList`; it defines the content of each list entry. Place the cursor in a paragraph and click the list button. Use `editor.chain().focus().toggleBulletList().run()` from a custom control.

## Options

### shortcutKeys

Type: `string[]`\
Default: `['shift', 'mod', '8']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
