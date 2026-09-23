---
description: 表格

next:
  text: TableOfContents
  link: /zh/extensions/TableOfContents/index.md
---

# Table

插入表格，并编辑其行、列与单元格。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Table, RichTextTable, RichTextBubbleTable } from 'ai-sparkwrite-editor';
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

```vue [Vue]
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Table,
  RichTextProvider,
  RichTextTable,
  RichTextBubbleTable,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Table];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextTable />
    <RichTextBubbleTable />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

本库的 `Table` 已包含行、表头、单元格与单元格背景色扩展，请勿再重复添加。点击工具栏中的网格来选择表格尺寸，然后选中单元格以使用 `RichTextBubbleTable`。你也可以调用 `editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()`。

## 离开表格

表格的宽度只取决于列的需要，因此其旁边和下方会留有空白区域。点击这片空白会将光标放在表格之后，而不是最近的单元格中——如果没有这一处理，点击表格右侧看起来就像光标卡在了表格内部。当表格是最后一个块，或者其后紧跟着另一张表格时，会先插入一个空段落。

同样的操作也可以通过键盘和表格的右键菜单完成（右键单击单元格 →“表格后插入段落”），菜单会显示当前平台对应的快捷键：

| 平台           | 快捷键                           |
| -------------- | -------------------------------- |
| macOS          | <kbd>⌘</kbd> <kbd>Enter</kbd>    |
| Windows、Linux | <kbd>Ctrl</kbd> <kbd>Enter</kbd> |

这同时也是一条命令，因此自定义控件可以直接调用：

```ts
editor.chain().focus().insertParagraphAfterTable().run();
```

## 圆角

表格的圆角为 `calc(var(--radius) - 2px)`，与代码块和菜单相比编辑器 `--radius` 的下降幅度一致，因此能与界面其余部分保持一致。这需要 `border-collapse: separate`（合并边框的表格会忽略 `border-radius`），样式表已设置好该属性，并将间距清零、每个单元格只保留一条边框线，使网格看起来与合并边框的表格一致。
