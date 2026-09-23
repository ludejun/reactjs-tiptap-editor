---
description: CodeBlock

next:
  text: CodeView
  link: /extensions/CodeView/index.md
---

# CodeBlock

Insert a multi-line code block with syntax highlighting and language selection.

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
import { CodeBlock, RichTextCodeBlock } from 'ai-sparkwrite-editor/codeblock';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, CodeBlock];

export default function CodeBlockExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextCodeBlock />
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
import { CodeBlock, RichTextProvider, RichTextCodeBlock } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, CodeBlock];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextCodeBlock />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Click the toolbar button to insert a plain-text code block. Each block renders its own toolbar in the top-right corner — language picker, copy and delete — revealed on hover, so there is nothing extra to mount. Register this extension in place of any other `codeBlock` extension to avoid duplicate node names.
