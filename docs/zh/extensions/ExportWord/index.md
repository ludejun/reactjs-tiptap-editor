---
description: 导出 Word

next:
  text: ExportMarkdown
  link: /zh/extensions/ExportMarkdown/index.md
---

# Export Word

将当前文档下载为 `.docx` 文件。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, ExportWord, RichTextExportWord } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportWord];

export default function ExportWordExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExportWord />
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
import { ExportWord, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportWord];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
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
尚未加入 Vue 层：`RichTextExportWord`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点击工具栏按钮，或调用 `editor.commands.exportToWord(editor.state.doc)`。下载的文件名为 `richtext-export-document.docx`。当前的序列化器不包含图片，也没有为所有自定义节点或标记定义映射；在依赖 Word 导出之前，请先测试你文档中用到的功能集。

## 加载行为

Word 序列化器会在触发导出时才加载。`exportToWord` 会立即返回一个 Tiptap 命令的布尔值；它不会返回一个表示下载已完成的 Promise。序列化与下载都是异步进行的，失败信息会记录到控制台。`editor.can().exportToWord(editor.state.doc)` 不会加载序列化器，也不会触发下载。
