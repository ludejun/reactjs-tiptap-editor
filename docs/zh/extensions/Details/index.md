---
description: 折叠块

next:
  text: Drawer
  link: /zh/extensions/Drawer/index.md
---

# Details

带摘要行和隐藏内容的可折叠切换块，类似 Notion 的 toggle。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Details, RichTextDetails } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Details];

export default function DetailsExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextDetails />
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
import { Details, RichTextProvider, RichTextDetails } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Details];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextDetails />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

`Details` 会一次性注册三个节点：`details`、`detailsSummary` 和 `detailsContent`，因此只需添加这一个扩展。点击工具栏按钮（或按 `Mod-Alt-D`）可将当前块包裹为折叠块，在折叠块内再次按下则会将其解除包裹。输入 `/toggle` 可从斜杠菜单中插入一个折叠块。

点击箭头图标即可展开或收起该块。展开状态会保存在文档中（`persist: true`），因此在保存并重新加载后仍会以 `<details open>` 的形式保留。

折叠块内的键盘行为：

- 在摘要行中按 `Enter`：若该块处于展开状态，会在内容区中创建一个新段落；若处于收起状态，则会在该块之后创建。
- 在空摘要行开头按 `Backspace`，会解除该折叠块的包裹。
- 在内容区最后一个空段落上按 `Enter`，会退出该折叠块。

## 从代码中插入

在 editor 非空的情况下，你可以包裹或解除包裹当前选区：

```ts
editor.chain().focus().setDetails().run();
editor.chain().focus().unsetDetails().run();
```

## 选项

```ts
Details.configure({
  // 是否在文档中保留展开状态（默认：true）
  persist: true,
  // 展开时添加到外层容器的类名（默认：'is-open'）
  openClassName: 'is-open',
  HTMLAttributes: { class: 'details' },
  // 转发给内部节点
  summary: { HTMLAttributes: { class: 'details-summary' } },
  content: { HTMLAttributes: { class: 'details-content' } },
});
```
