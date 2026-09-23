---
description: Twitter

next:
  text: Video
  link: /extensions/Video/index.md
---

# Twitter

Embed a Twitter/X post in the document.

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
import { Twitter, RichTextTwitter } from 'ai-sparkwrite-editor/twitter';
import { RichTextBubbleTwitter } from 'ai-sparkwrite-editor/bubble/twitter';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Twitter];

export default function TwitterExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTwitter />
      <RichTextBubbleTwitter />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
``` [React]

:::

::: warning React only
This feature's interactive UI depends on React libraries; the Vue layer does not include it yet. See [Frameworks](/guide/frameworks) for what the Vue entry covers.
:::

## How to use

Open the toolbar dialog and enter a supported post URL. Displaying the post depends on its availability and the embed service. Mount `RichTextBubbleTwitter` for contextual actions; a saved editor node does not archive the remote post.
