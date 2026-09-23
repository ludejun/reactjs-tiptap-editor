---
description: 历史记录

next:
  text: HorizontalRule
  link: /zh/extensions/HorizontalRule/index.md
---

# History

撤销和重做编辑事务。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, History, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, History];

export default function HistoryExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextUndo />
      <RichTextRedo />
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
import { History, RichTextProvider, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, History];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextUndo />
    <RichTextRedo />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

只需注册一次 `History`。它扩展自 Tiptap 3 的 `UndoRedo` 扩展，因此请勿再注册 `UndoRedo` 或 StarterKit 自带的撤销历史。当存在可撤销或可重做的更改时，按钮才会变为可用。默认值为 `depth: 100` 和 `newGroupDelay: 500`（毫秒）。

## 选项

### shortcutKeys

类型：`string[][]`\
默认值：`[['mod', 'Z'], ['shift', 'mod', 'Z']]`

控件显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
