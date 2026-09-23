---
description: Mermaid

next:
  text: MoreMark
  link: /extensions/MoreMark/index.md
---

# Mermaid

Create editable diagrams from Mermaid source text.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Mermaid,
  RichTextMermaid,
  RichTextBubbleMermaid,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Mermaid];

export default function MermaidExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextMermaid />
      <RichTextBubbleMermaid />
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
import { Mermaid, RichTextProvider, RichTextMermaid } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Mermaid];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextMermaid />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Not in the Vue layer yet: `RichTextBubbleMermaid` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Click the toolbar button, enter diagram source, and apply it to insert a diagram. Mount `RichTextBubbleMermaid` for contextual actions. Keep the Mermaid extension registered when reopening saved diagram nodes.
