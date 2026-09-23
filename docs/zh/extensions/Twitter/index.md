---
description: Twitter

next:
  text: Video
  link: /zh/extensions/Video/index.md
---

# Twitter

在文档中嵌入一条 Twitter/X 帖子。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Twitter,
  RichTextTwitter,
  RichTextBubbleTwitter,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Twitter];

export default function TwitterExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTwitter />
      <RichTextBubbleTwitter />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

:::

::: warning 仅 React
该功能的交互式 UI 依赖 React 相关库；Vue 层目前尚未包含它。参阅[框架支持](/zh/guide/frameworks)了解 Vue 入口涵盖的内容。
:::

## 使用方式

打开工具栏对话框，输入一个受支持的帖子 URL。帖子能否显示取决于其可用性和嵌入服务。挂载 `RichTextBubbleTwitter` 以获得上下文相关的操作；已保存的编辑器节点并不会归档远端的帖子内容。
