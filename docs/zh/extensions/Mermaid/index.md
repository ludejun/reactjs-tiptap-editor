---
description: Mermaid 图表

next:
  text: MoreMark
  link: /zh/extensions/MoreMark/index.md
---

# Mermaid

根据 Mermaid 源文本创建可编辑的图表。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Mermaid, RichTextMermaid } from 'ai-sparkwrite-editor/mermaid';
import { RichTextBubbleMermaid } from 'ai-sparkwrite-editor/bubble/mermaid';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Mermaid];

export default function MermaidExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextMermaid />
      <RichTextBubbleMermaid />
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
import { Mermaid, RichTextProvider, RichTextMermaid } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Mermaid];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextMermaid />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
尚未加入 Vue 层：`RichTextBubbleMermaid`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点击工具栏按钮，输入图表源文本，然后应用即可插入图表。挂载 `RichTextBubbleMermaid` 以获得上下文操作。重新打开已保存的图表节点时，请保持 Mermaid 扩展处于注册状态。
