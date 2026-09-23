---
description: Attachment

next:
  text: Blockquote
  link: /zh/extensions/Blockquote/index.md
---

# Attachment

插入一个可下载的文件卡片，由应用方提供上传处理函数。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Attachment, RichTextAttachment } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

async function uploadAttachment(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/attachments', { method: 'POST', body });
  if (!response.ok) throw new Error('Attachment upload failed');
  const data = await response.json();
  if (typeof data.url !== 'string' || !data.url) {
    throw new Error('Upload response must contain a URL');
  }
  return data.url;
}

const extensions = [Document, Paragraph, Text, Attachment.configure({ upload: uploadAttachment })];

export default function AttachmentExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextAttachment />
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
import { Attachment, RichTextProvider, RichTextAttachment } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

async function uploadAttachment(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/attachments', { method: 'POST', body });
  if (!response.ok) throw new Error('Attachment upload failed');
  const data = await response.json();
  if (typeof data.url !== 'string' || !data.url) {
    throw new Error('Upload response must contain a URL');
  }
  return data.url;
}

const extensions = [Document, Paragraph, Text, Attachment.configure({ upload: uploadAttachment })];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextAttachment />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

点击附件按钮以添加一个占位卡片，然后在该卡片中选择一个文件。上传回调函数接收一个 `File`，并必须返回其下载 URL。示例中的接口需要你自行实现，它必须返回 `{ "url": "https://..." }`。上传完成后请保存文档。
