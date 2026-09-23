---
description: CodeBlock

next:
  text: CodeView
  link: /zh/extensions/CodeView/index.md
---

# CodeBlock

插入带语法高亮和语言选择的多行代码块。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, CodeBlock, RichTextCodeBlock } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

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

```vue [Vue]
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { CodeBlock, RichTextProvider, RichTextCodeBlock } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, CodeBlock];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextCodeBlock />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

点击工具栏按钮以插入一个纯文本代码块。每个代码块会在右上角渲染自己的工具栏——语言选择器、复制和删除——悬停时显示，因此无需额外挂载任何组件。请用该扩展替换任何其他 `codeBlock` 扩展，以避免节点名称重复。
