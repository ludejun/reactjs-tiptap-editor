---
description: Heading

next:
  text: Highlight
  link: /zh/extensions/Highlight/index.md
---

# Heading

将段落转换为指定级别的标题。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Heading, RichTextHeading } from 'ai-sparkwrite-editor/heading';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Heading.configure({ levels: [1, 2, 3] })];

export default function HeadingExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextHeading />
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
import { Heading } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextHeading } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Heading.configure({ levels: [1, 2, 3] })];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextHeading />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

把光标放在某个段落中，然后在工具栏中选择级别。`levels` 用于控制可用的标题级别，例如 `Heading.configure({ levels: [1, 2, 3] })`。如需自定义操作，可使用 `editor.chain().focus().toggleHeading({ level: 2 }).run()`。
