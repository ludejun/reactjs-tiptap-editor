---
description: 导出 Markdown

next:
  text: FontFamily
  link: /zh/extensions/FontFamily/index.md
---

# Export Markdown

将当前文档下载为 `.md` 文件，或获取 markdown 字符串发送给你的后端。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Bold,
  Heading,
  ExportMarkdown,
  RichTextExportMarkdown,
} from 'ai-sparkwrite-editor';
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
import { Bold, Heading, ExportMarkdown, RichTextProvider } from 'ai-sparkwrite-editor/vue';
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
Vue 层暂未提供：`RichTextExportMarkdown`——请在你自己的控件中调用对应命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点击工具栏按钮，将文档下载为 markdown。序列化器（`@tiptap/markdown`）在首次使用时按需加载，因此不会影响初始包体积。

每种节点都会被序列化：

| 内容                                                    | 输出                                       |
| ------------------------------------------------------- | ------------------------------------------ |
| 标题、段落、加粗、斜体、删除线、代码、链接、图片、列表  | 标准 / GFM markdown                        |
| 任务列表、表格、引用块、代码块、分隔线、高亮            | GFM markdown                               |
| 折叠块（Details）                                       | `<details><summary>…</summary>…</details>` |
| 提示框（Callout）                                       | GitHub alert（`> [!NOTE]`、`> [!TIP]`……）  |
| 目录块                                                  | `[TOC]`                                    |
| Katex                                                   | `$formula$`                                |
| 附件                                                    | `[file name](url)`                         |
| Twitter                                                 | `[url](url)`                               |
| 分栏                                                    | 各栏内容依次排列                           |
| 上标 / 下标                                             | `<sub>` / `<sup>`                          |
| 视频、iframe、mermaid、excalidraw、抽屉及其他自定义节点 | 渲染为 HTML，内容不丢失                    |

颜色、字号、字体、对齐方式、行高等文本样式会被丢弃，因为 markdown 没有对应的语法。

## 在代码中使用

```ts
import { getMarkdown } from 'ai-sparkwrite-editor';

// 下载
editor.chain().focus().exportToMarkdown({ fileName: 'notes.md' }).run();

// 获取字符串（例如保存到你的服务器）
const markdown = await getMarkdown(editor);
```

## 选项

```ts
ExportMarkdown.configure({
  // 下载文件的文件名
  fileName: 'richtext-export-document.md',
  // 嵌套列表的缩进方式
  indentation: { style: 'space', size: 2 },
});
```
