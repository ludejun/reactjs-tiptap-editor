---
description: MultiColumn

next:
  text: Details
  link: /extensions/Details/index.md
---

# Column

Arrange document blocks in a multi-column layout.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-richtext-editor';
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from 'ai-richtext-editor/column';
import { RichTextBubbleMenuDragHandle } from 'ai-richtext-editor/bubble/drag-handle';
import 'ai-richtext-editor/style.css';

const DocumentColumn = Document.extend({ content: '(block|columns)+' });

const extensions = [DocumentColumn, Paragraph, Text, Column, ColumnNode, MultipleColumnNode];

export default function ColumnExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextColumn />
      <RichTextBubbleMenuDragHandle />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

Register all three exports: `Column` supplies behavior, while `ColumnNode` and `MultipleColumnNode` define the layout nodes. Replace the base Document with `DocumentColumn` as shown below; do not register both. Column controls (insert column before/after, delete column) live in the block menu of `RichTextBubbleMenuDragHandle`: hover any block inside a column and open the menu.
