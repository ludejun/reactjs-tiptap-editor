---
description: BulletList

next:
  text: Clear
  link: /zh/extensions/Clear/index.md
---

# BulletList

将段落组织为无序列表。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。安装与你其他 Tiptap 包相同版本的 `@tiptap/extension-list`。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { BulletList, RichTextBulletList } from 'ai-sparkwrite-editor/bulletlist';
import { ListItem } from '@tiptap/extension-list';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, BulletList];

export default function BulletListExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBulletList />
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
import { BulletList } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextBulletList } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ListItem, BulletList];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextBulletList />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

将 `ListItem` 与 `BulletList` 一起注册；它定义了每个列表项的内容。将光标置于一个段落中并点击列表按钮。在自定义控件中可使用 `editor.chain().focus().toggleBulletList().run()`。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['shift', 'mod', '8']`

控件所显示的快捷键标签。参阅[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
