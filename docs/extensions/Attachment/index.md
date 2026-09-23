---
description: Attachment

next:
  text: Blockquote
  link: /extensions/Blockquote/index.md
---

# Attachment

Insert a downloadable file card with an application-provided upload handler.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Attachment, RichTextAttachment } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

async function uploadAttachment(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/attachments', { method: 'POST', body });
  if (!response.ok) throw new Error('Attachment upload failed');
  const data = await response.json();
  if (typeof data.url !== 'string' || !data.url) {
    throw new Error('Upload response must contain a URL');
  }
  return data.url;
}

const extensions = [Document, Paragraph, Text, Attachment.configure({ upload: uploadAttachment })];

export default function AttachmentExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextAttachment />
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
import { Attachment, RichTextProvider, RichTextAttachment } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

async function uploadAttachment(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/attachments', { method: 'POST', body });
  if (!response.ok) throw new Error('Attachment upload failed');
  const data = await response.json();
  if (typeof data.url !== 'string' || !data.url) {
    throw new Error('Upload response must contain a URL');
  }
  return data.url;
}

const extensions = [Document, Paragraph, Text, Attachment.configure({ upload: uploadAttachment })];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextAttachment />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

Click the attachment button to add a placeholder, then choose a file in that card. The upload callback receives one `File` and must resolve with its download URL. The endpoint in this example is yours to implement; it must return `{ "url": "https://..." }`. Save the document after uploading completes.
