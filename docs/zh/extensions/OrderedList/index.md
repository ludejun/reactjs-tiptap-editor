---
description: OrderedList

next:
  text: SearchAndReplace
  link: /zh/extensions/SearchAndReplace/index.md
---

# Ordered List

将段落整理为有序列表。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。安装与你其他 Tiptap 包版本一致的 `@tiptap/extension-list`。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { OrderedList, RichTextOrderedList } from 'ai-sparkwrite-editor/orderedlist';
import { ListItem } from '@tiptap/extension-list';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, OrderedList];

export default function OrderedListExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextOrderedList />
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
import { ListItem } from '@tiptap/extension-list';
import { OrderedList } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextOrderedList } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, OrderedList];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextOrderedList />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

注册 `ListItem` 与 `OrderedList` 一同使用。选中段落并点击有序列表按钮，或调用 `editor.chain().focus().toggleOrderedList().run()`。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['mod', 'shift', '7']`

控件中显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以更改实际的按键绑定。
