---
description: 内嵌框架

next:
  text: Image
  link: /zh/extensions/Image/index.md
---

# Iframe

在一个 iframe 节点中嵌入外部内容。

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
import { Iframe, RichTextIframe } from 'ai-sparkwrite-editor/iframe';
import { RichTextBubbleIframe } from 'ai-sparkwrite-editor/bubble/iframe';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

export default function IframeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIframe />
      <RichTextBubbleIframe />
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
import { Iframe, RichTextProvider, RichTextIframe } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIframe />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
尚未加入 Vue 层：`RichTextBubbleIframe`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

打开工具栏对话框并提供一个可嵌入的 URL。挂载 `RichTextBubbleIframe` 以获得上下文控件。部分站点会阻止被嵌入到 iframe 中；请使用该服务提供的嵌入 URL，并确保你应用的内容安全策略（CSP）允许该来源。
