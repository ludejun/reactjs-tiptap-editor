---
description: ImageGif

next:
  text: ImportWord
  link: /zh/extensions/ImportWord/index.md
---

# ImageGif

搜索动态 GIF 并将其插入到文档中。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  ImageGif,
  RichTextImageGif,
  RichTextBubbleImageGif,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  ImageGif.configure({ provider: 'giphy', API_KEY: 'YOUR_GIPHY_API_KEY' }),
];

export default function ImageGifExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextImageGif />
      <RichTextBubbleImageGif />
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
import { ImageGif, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  ImageGif.configure({ provider: 'giphy', API_KEY: 'YOUR_GIPHY_API_KEY' }),
];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Vue 层暂未提供：`RichTextImageGif`、`RichTextBubbleImageGif` —— 请在你自己的控件中调用对应的命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

将 `provider` 设置为 `"giphy"`（默认值）或 `"tenor"`，并提供对应服务商的 `API_KEY`。示例中的占位符必须替换后搜索才能生效。点击 GIF 按钮，搜索并选择一个结果。挂载 `RichTextBubbleImageGif` 以支持上下文编辑。
