---
description: 清除格式

next:
  text: Code
  link: /zh/extensions/Code/index.md
---

# Clear

清除当前选区中的文本标记，并重置块级格式。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Clear, RichTextClear } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Clear];

export default function ClearExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextClear />
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
import { Clear, RichTextProvider, RichTextClear } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Clear];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextClear />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选中要重置的内容，点击橡皮擦按钮。这会执行 `editor.chain().focus().clearNodes().unsetAllMarks().run()`：它清除的是格式，而不是文档中的文字。如果确实要清空文档，请使用 Tiptap 的 `editor.commands.clearContent()`。
