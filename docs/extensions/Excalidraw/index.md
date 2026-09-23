---
description: Excalidraw

next:
  text: ExportPdf
  link: /extensions/ExportPdf/index.md
---

# Excalidraw

Create and insert Excalidraw drawings.

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
  Excalidraw,
  RichTextExcalidraw,
  RichTextBubbleExcalidraw,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';
import '@excalidraw/excalidraw/index.css';

const extensions = [Document, Paragraph, Text, Excalidraw];

export default function ExcalidrawExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExcalidraw />
      <RichTextBubbleExcalidraw />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

:::

::: warning React only
This feature's interactive UI depends on React libraries; the Vue layer does not include it yet. See [Frameworks](/guide/frameworks) for what the Vue entry covers.
:::

## How to use

Load `@excalidraw/excalidraw/index.css` alongside the editor stylesheet. Open the toolbar dialog, create a drawing, and apply it. Mount `RichTextBubbleExcalidraw` for contextual actions. Install `@excalidraw/excalidraw` directly if needed to resolve its CSS import.
