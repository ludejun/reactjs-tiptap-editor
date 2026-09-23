---
description: MultiColumn

next:
  text: Details
  link: /zh/extensions/Details/index.md
---

# Column

将文档中的块以多栏布局排列。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
  RichTextColumn,
} from 'ai-sparkwrite-editor/column';
import { RichTextBubbleMenuDragHandle } from 'ai-sparkwrite-editor/bubble/drag-handle';
import 'ai-sparkwrite-editor/style.css';

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

:::

::: warning 仅 React
该功能的交互式 UI 依赖 React 相关库；Vue 层目前尚未包含它。参阅[框架支持](/zh/guide/frameworks)了解 Vue 入口涵盖的内容。
:::

## 使用方式

需要注册全部三个导出项：`Column` 提供行为逻辑，`ColumnNode` 和 `MultipleColumnNode` 定义布局节点。如下所示，用 `DocumentColumn` 替换基础的 Document，不要同时注册两者。分栏控件（在前/后插入分栏、删除分栏）位于 `RichTextBubbleMenuDragHandle` 的块菜单中：将鼠标悬停在分栏内的任意块上并打开菜单即可。
