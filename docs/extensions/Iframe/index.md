---
description: Iframe

next:
  text: Image
  link: /extensions/Image/index.md
---

# Iframe

Embed external content in an iframe node.

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
import { Iframe, RichTextIframe } from 'ai-sparkwrite-editor/iframe';
import { RichTextBubbleIframe } from 'ai-sparkwrite-editor/bubble/iframe';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

export default function IframeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIframe />
      <RichTextBubbleIframe />
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
import { Iframe, RichTextProvider, RichTextIframe } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIframe />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::

::: tip Vue
Not in the Vue layer yet: `RichTextBubbleIframe` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Open the toolbar dialog and provide an embeddable URL. Mount `RichTextBubbleIframe` for contextual controls. Some sites block iframe embedding; use the service’s embed URL and ensure your application’s content-security policy permits that origin.
