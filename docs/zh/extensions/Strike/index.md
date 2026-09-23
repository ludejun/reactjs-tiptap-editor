---
description: 删除线

next:
  text: Table
  link: /zh/extensions/Table/index.md
---

# Strike

为文本标记删除线，同时在文档中保留该文本。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Strike, RichTextStrike } from 'ai-sparkwrite-editor/strike';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Strike];

export default function StrikeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextStrike />
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
import { Strike } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextStrike } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Strike];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextStrike />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选中文本并点击删除线按钮。在自定义控件中可以使用 `editor.chain().focus().toggleStrike().run()`。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['shift', 'mod', 'S']`

控件显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
