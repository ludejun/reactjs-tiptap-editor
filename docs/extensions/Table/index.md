---
description: Table

next:
  text: TableOfContents
  link: /extensions/TableOfContents/index.md
---

# Table

Insert tables and edit their rows, columns, and cells.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Table, RichTextTable } from 'ai-sparkwrite-editor/table';
import { RichTextBubbleTable } from 'ai-sparkwrite-editor/bubble/table';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Table];

export default function TableExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTable />
      <RichTextBubbleTable />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

The library’s `Table` includes row, header, cell, and cell-background extensions. Do not add duplicates. Click the toolbar grid to choose a table size, then select cells to use `RichTextBubbleTable`. You can also call `editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()`.

## Leaving a table

A table is only as wide as its columns need, which leaves empty space beside and
under it. Clicking in that space puts the caret after the table rather than in
the nearest cell — without this, a click to the right of a table looks like the
caret is stuck inside it. An empty paragraph is inserted first when the table is
the last block or is followed by another table.

The same move is available from the keyboard and from the table's context menu
(right-click a cell → "Paragraph After Table"), where the menu shows the
shortcut for the current platform:

| Platform       | Shortcut                         |
| -------------- | -------------------------------- |
| macOS          | <kbd>⌘</kbd> <kbd>Enter</kbd>    |
| Windows, Linux | <kbd>Ctrl</kbd> <kbd>Enter</kbd> |

It is also a command, so a custom control can call it:

```ts
editor.chain().focus().insertParagraphAfterTable().run();
```

## Corners

The table's corners are `calc(var(--radius) - 2px)`, the same step down from
the editor's `--radius` that code blocks and menus use, so it matches the rest
of your UI. This needs `border-collapse: separate` (a collapsed table ignores
`border-radius`), which the stylesheet sets along with zeroed spacing and
one border edge per cell, so the grid looks the same as a collapsed one.
