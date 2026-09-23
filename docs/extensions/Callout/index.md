---
description: Callout
---

# Callout

Group text in a visually distinct callout box.

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
import { Callout, RichTextCallout } from 'ai-sparkwrite-editor/callout';
import { RichTextBubbleCallout } from 'ai-sparkwrite-editor/bubble/callout';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Callout];

export default function CalloutExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextCallout />
      <RichTextBubbleCallout />
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
import { Callout, RichTextProvider, RichTextCallout } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Callout];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextCallout />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
``` [Vue]

:::

::: tip Vue
Not in the Vue layer yet: `RichTextBubbleCallout` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Open the toolbar dialog, choose a callout type, enter its title and body, and apply it. Mount `RichTextBubbleCallout` for contextual editing. The callout is an atomic node with `type`, `title`, and `body` attributes, rather than a container of nested editor blocks.

## Insert from code

With a non-null editor, you can insert a callout directly:

```ts
editor
  .chain()
  .focus()
  .setCallout({
    type: 'tip',
    title: 'Save your work',
    body: 'Use the Save button before leaving this page.',
  })
  .run();
```

The built-in dialog offers `note`, `tip`, `important`, `warning`, and `caution` types.
