---
description: Export Markdown

next:
  text: FontFamily
  link: /extensions/FontFamily/index.md
---

# Export Markdown

Download the current document as a `.md` file, or get the markdown string to send to your backend.

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
import { Bold } from 'ai-sparkwrite-editor/bold';
import { Heading } from 'ai-sparkwrite-editor/heading';
import { ExportMarkdown, RichTextExportMarkdown } from 'ai-sparkwrite-editor/exportmarkdown';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold, Heading, ExportMarkdown];

export default function ExportMarkdownExample() {
  const editor = useEditor({
    extensions,
    content: '<h1>Title</h1><p>Try this <strong>feature</strong> here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExportMarkdown />
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
import { Bold, Heading, ExportMarkdown } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold, Heading, ExportMarkdown];

const editor = useEditor({
  extensions,
  content: '<h1>Title</h1><p>Try this <strong>feature</strong> here.</p>',
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
Not in the Vue layer yet: `RichTextExportMarkdown` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Press the toolbar button to download the document as markdown. The serializer (`@tiptap/markdown`) is loaded on demand the first time it is used, so it does not affect the initial bundle.

Every node is serialized:

| Content                                                                   | Output                                     |
| ------------------------------------------------------------------------- | ------------------------------------------ |
| Headings, paragraphs, bold, italic, strike, code, links, images, lists    | Standard / GFM markdown                    |
| Task lists, tables, blockquotes, code blocks, horizontal rules, highlight | GFM markdown                               |
| Details (toggle)                                                          | `<details><summary>…</summary>…</details>` |
| Callout                                                                   | GitHub alert (`> [!NOTE]`, `> [!TIP]`, …)  |
| Table of contents block                                                   | `[TOC]`                                    |
| Katex                                                                     | `$formula$`                                |
| Attachment                                                                | `[file name](url)`                         |
| Twitter                                                                   | `[url](url)`                               |
| Columns                                                                   | Column contents one after another          |
| Subscript / superscript                                                   | `<sub>` / `<sup>`                          |
| Video, iframe, mermaid, excalidraw, drawer and other custom nodes         | Rendered as HTML so nothing is lost        |

Text styles such as color, font size, font family, alignment and line height are dropped, as markdown has no equivalent.

## Use from code

```ts
import { getMarkdown } from 'ai-sparkwrite-editor/exportmarkdown';

// download
editor.chain().focus().exportToMarkdown({ fileName: 'notes.md' }).run();

// get the string (e.g. to save on your server)
const markdown = await getMarkdown(editor);
```

## Options

```ts
ExportMarkdown.configure({
  // name of the downloaded file
  fileName: 'richtext-export-document.md',
  // indentation for nested lists
  indentation: { style: 'space', size: 2 },
});
```
