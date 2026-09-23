---
description: CodeBlock

next:
  text: CodeView
  link: /extensions/CodeView/index.md
---

# CodeBlock

Insert a multi-line code block with syntax highlighting and language selection.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'sparkwrite';
import { CodeBlock, RichTextCodeBlock } from 'sparkwrite/codeblock';
import 'sparkwrite/style.css';

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

## How to use

Click the toolbar button to insert a plain-text code block. Each block renders its own toolbar in the top-right corner — language picker, copy and delete — revealed on hover, so there is nothing extra to mount. Register this extension in place of any other `codeBlock` extension to avoid duplicate node names.
