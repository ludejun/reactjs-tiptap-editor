---
description: Export Word

next:
  text: ExportMarkdown
  link: /extensions/ExportMarkdown/index.md
---

# Export Word

Download the current document as a `.docx` file.

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
import { ExportWord, RichTextExportWord } from 'ai-sparkwrite-editor/exportword';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportWord];

export default function ExportWordExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExportWord />
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
import { ExportWord } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportWord];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Not in the Vue layer yet: `RichTextExportWord` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Click the toolbar button or call `editor.commands.exportToWord(editor.state.doc)`. The download uses `richtext-export-document.docx`. The current serializer excludes images and does not define mappings for every custom node or mark; test your document’s feature set before relying on Word export.

## Loading behavior

The Word serializer loads when export is requested. `exportToWord` returns a Tiptap command boolean immediately; it does not return a promise indicating that the download has finished. Serialization and download happen asynchronously, and failures are logged to the console. `editor.can().exportToWord(editor.state.doc)` does not load the serializer or start a download.
