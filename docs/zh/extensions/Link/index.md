---
description: Link

next:
  text: Mention
  link: /zh/extensions/Mention/index.md
---

# Link

为文本添加或编辑超链接。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Link, RichTextLink, RichTextBubbleLink } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Link];

export default function LinkExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextLink />
      <RichTextBubbleLink />
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
import { Link, RichTextProvider, RichTextLink, RichTextBubbleLink } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Link];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextLink />
    <RichTextBubbleLink />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选中要添加链接的文本，打开工具栏对话框，输入 URL。挂载 `RichTextBubbleLink` 可以在选中链接后对其进行编辑。使用 `editor.chain().focus().setLink({ href: "https://example.com" }).run()` 为选区应用链接，使用 `unsetLink()` 移除链接。
