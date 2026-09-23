---
description: RichPaste

next:
  text: SearchAndReplace
  link: /extensions/SearchAndReplace/index.md
---

# Rich Paste

Fixes the two pastes browsers get wrong: Word lists and code copied from a code editor.

Pasting from a web page, Excel, Google Docs or Word already keeps headings, bold, links, tables and colours, because the HTML on the clipboard maps onto the editor schema. Two sources do not:

- **Word lists.** Word does not put `<ul>` or `<ol>` on the clipboard. Each item is a paragraph with an `mso-list` style and a literal bullet character in front, so a list arrives as plain paragraphs starting with `·`. This extension rebuilds the run as a real nested list, reading the nesting depth from Word's `level` and choosing a numbered list when the marker is `1.`, `a)` or `iv.`.
- **Code editors.** VS Code, Sublime, Xcode and JetBrains copy one coloured `<span>` per token inside a monospace, `white-space: pre` container. That would land as paragraphs of coloured text. This extension recognises the container and inserts a code block from the plain-text copy instead. A single line becomes inline code rather than a block.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature. It has no toolbar control; add it next to `CodeBlock`, `BulletList` and `OrderedList` so there is something to paste into.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-richtext-editor';
import { BulletList } from 'ai-richtext-editor/bulletlist';
import { CodeBlock } from 'ai-richtext-editor/codeblock';
import { OrderedList } from 'ai-richtext-editor/orderedlist';
import { RichPaste } from 'ai-richtext-editor/richpaste';
import 'ai-richtext-editor/style.css';

const extensions = [Document, Paragraph, Text, BulletList, OrderedList, CodeBlock, RichPaste];

export default function RichPasteExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Paste a Word list or a snippet from VS Code here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## Options

### wordLists

Type: `boolean`\
Default: `true`

Rebuild Word's list paragraphs as lists.

### codeBlocks

Type: `boolean`\
Default: `true`

Paste from a code editor as a code block.

### detectLanguage

Type: `(code: string) => string`\
Default: none

Guesses the language of a pasted block from its text and returns a name the code block understands (an empty string means "unknown"). The code block extension ships a guesser you can reuse:

```ts
import { guessLanguage } from 'ai-richtext-editor/codeblock';

RichPaste.configure({ detectLanguage: guessLanguage });
```

## What is not changed

Pasting inside a code block is left to the default behaviour, which already keeps the text. HTML that contains paragraphs, headings, tables or lists is never treated as code, even when it uses a monospace font.
