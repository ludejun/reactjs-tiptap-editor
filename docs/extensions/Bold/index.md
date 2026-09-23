---
description: Bold

next:
  text: BulletList
  link: /extensions/BulletList/index.md
---

# Bold

Apply bold emphasis to selected text, or enable bold before typing.

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
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold];

export default function BoldExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBold />
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
import { Bold } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextBold } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextBold />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::


## How to use

Select a word and click **Bold**. Click again to remove the mark. Use `editor.chain().focus().toggleBold().run()` to trigger it from your own control.

## Options

### shortcutKeys

Type: `string[]`\
Default: `['mod', 'B']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
