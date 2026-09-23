---
description: History

next:
  text: HorizontalRule
  link: /extensions/HorizontalRule/index.md
---

# History

Undo and redo editing transactions.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, History, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, History];

export default function HistoryExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextUndo />
      <RichTextRedo />
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
import { History, RichTextProvider, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, History];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextUndo />
    <RichTextRedo />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Register `History` once. It extends Tiptap 3’s `UndoRedo` extension, so do not also register `UndoRedo` or StarterKit’s undo history. The buttons become available when there is a change to undo or redo. Defaults are `depth: 100` and `newGroupDelay: 500` (milliseconds).

## Options

### shortcutKeys

Type: `string[][]`\
Default: `[['mod', 'Z'], ['shift', 'mod', 'Z']]`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
