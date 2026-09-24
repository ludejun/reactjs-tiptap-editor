---
description: Notice
---

# Notice

A coloured box with an icon — **Info**, **Success**, **Warning** or **Tip** — holding ordinary editable blocks: paragraphs, lists, code, tables. The kind of block most document editors offer under "+ → Info notice".

<div class="notice" data-type="success"><p><strong>Saved as plain HTML.</strong> A notice is <code>&lt;div class="notice" data-type="success"&gt;</code> around normal blocks, so the saved document renders the same box anywhere the stylesheet is loaded — no node view, no custom renderer.</p></div>

## Setup

Start with the packages in [Getting Started](/guide/getting-started). `RichTextKit` already includes the notice (option `notice`). To assemble it yourself:

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Notice,
  RichTextNotice,
  RichTextBubbleNotice,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Notice];

export default function NoticeExample() {
  const editor = useEditor({
    extensions,
    content: '<div class="notice" data-type="info"><p>Try this feature here.</p></div>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextNotice />
      <RichTextBubbleNotice />
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
import {
  Notice,
  RichTextProvider,
  RichTextNotice,
  RichTextBubbleNotice,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Notice];

const editor = useEditor({
  extensions,
  content: '<div class="notice" data-type="info"><p>Try this feature here.</p></div>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextNotice />
    <RichTextBubbleNotice />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## How to use

- **Toolbar**: `RichTextNotice` is a dropdown of the four types. Picking one wraps the selected blocks (or the current paragraph); picking the type of the notice you are in removes it; picking another type changes it.
- **Slash menu**: `/notice`, `/info`, `/success`, `/warning`, `/tip` each insert one entry — "Info notice", "Success notice"… — like the "+" menu of other editors.
- **Bubble menu**: `RichTextBubbleNotice` appears above the notice the caret is in, with the four types and a remove button.
- **Keyboard**: Enter on an empty last line leaves the box, the way lists end.

## Saved format

```html
<div class="notice" data-type="warning">
  <p>Publishing replaces the live page.</p>
  <ul><li><p>Check the table first.</p></li></ul>
</div>
```

`data-type` is one of `info`, `success`, `warning`, `tip`; anything else is read back as `info`. The colours and icons come from the stylesheet (`.notice[data-type='…']`), so a read-only page needs only `ai-sparkwrite-editor/style.css`. Override `--notice-color`, `--notice-background` and `--notice-icon` per type to restyle.

Markdown export writes GitHub-style alerts: `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, and `> [!SUCCESS]` (which other renderers show as a plain quote).

## Commands

```ts
editor.chain().focus().setNotice('tip').run(); // wrap the selection
editor.chain().focus().toggleNotice('warning').run(); // wrap, retype, or remove
editor.chain().focus().updateNotice('success').run(); // change the type
editor.chain().focus().unsetNotice().run(); // lift the blocks out
```

`NOTICE_TYPES` lists the types and their colours; `getNoticeType()` normalises unknown values.
