---
description: Indent

next:
  text: Italic
  link: /extensions/Italic/index.md
---

# Indent

Increase or decrease indentation of supported blocks.

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
import { Indent, RichTextIndent } from 'ai-sparkwrite-editor/indent';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Indent];

export default function IndentExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIndent />
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
import { Indent } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextIndent } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Indent];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIndent />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Place the cursor in a paragraph and use the indent controls. For list nesting, register the corresponding list and item extensions too. Indentation changes layout; it does not insert spaces into the text.

## Options

### shortcutKeys

Type: `string[][]`\
Default: `[['Tab'], ['Shift', 'Tab']]`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
