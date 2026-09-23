---
description: 目录

next:
  text: TaskList
  link: /zh/extensions/TaskList/index.md
---

# TableOfContents

追踪文档中的标题，并插入一个实时更新的目录块。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Heading,
  TableOfContents,
  RichTextTableOfContents,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Heading, TableOfContents];

export default function TableOfContentsExample() {
  const editor = useEditor({
    extensions,
    content: '<h1>Title</h1><p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTableOfContents />
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
  Heading,
  TableOfContents,
  RichTextProvider,
  RichTextTableOfContents,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Heading, TableOfContents];

const editor = useEditor({
  extensions,
  content: '<h1>Title</h1><p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextTableOfContents />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

`TableOfContents` 做两件事：

1. 它会监视每一个标题，为每个标题赋予稳定的 `id` / `data-toc-id` 属性，并通过 `editor.storage.tableOfContents.content` 暴露标题列表。
2. 它注册了 `tableOfContentsNode` 块。点击工具栏按钮或输入 `/toc` 即可插入该块。这个块会在标题发生变化时重新渲染，按层级为条目编号（`1`、`1.1`、`1.1.1`），高亮当前视口中的标题，并在点击时滚动到对应标题。

在导出的 HTML 中，该块被渲染为 `<div data-type="table-of-contents"></div>`；目录列表本身是在运行时根据标题动态生成的。

## 通过代码插入

```ts
editor.chain().focus().insertTableOfContents().run();
```

## 在编辑器之外渲染大纲

使用 `useTableOfContents` 这个 hook，用同一份数据构建侧边栏：

```tsx
import { useTableOfContents, scrollToTableOfContentsItem } from 'ai-sparkwrite-editor';

function Outline({ editor }) {
  const items = useTableOfContents(editor);

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} style={{ paddingLeft: (item.level - 1) * 12 }}>
          <button onClick={() => scrollToTableOfContentsItem(editor, item)}>
            {item.textContent}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## 选项

```ts
import { getLinearIndexes } from 'ai-sparkwrite-editor';

TableOfContents.configure({
  // node types that count as headings (default: ['heading'])
  anchorTypes: ['heading'],
  // hierarchical numbering by default; use getLinearIndexes for 1, 2, 3…
  getIndex: getLinearIndexes,
  // generate stable ids instead of random uuids
  getId: (text) => text.toLowerCase().replace(/\s+/g, '-'),
  // element that scrolls, used to compute the active heading (default: window)
  scrollParent: () => document.querySelector('.editor-scroll'),
  HTMLAttributes: { class: 'table-of-contents' },
});
```
