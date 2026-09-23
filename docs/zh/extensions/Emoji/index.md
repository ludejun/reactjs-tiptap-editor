---
description: Emoji

next:
  text: Excalidraw
  link: /zh/extensions/Excalidraw/index.md
---

# Emoji

通过选择器或建议插入表情符号。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Emoji, RichTextEmoji } from 'ai-sparkwrite-editor/emoji';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Emoji];

export default function EmojiExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextEmoji />
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

打开工具栏中的选择器并选择一个表情符号。该扩展自带表情数据和建议 UI，不需要上传接口或单独的工具栏提供方。

- 表情列表复制自此处：https://github.com/ludejun/ai-sparkwrite-editor-demo/blob/master/src/components/Editor/emojis.ts

## 加载行为

工具栏选择器 UI 在弹出层首次打开时才会加载。该扩展仍然会包含完整的表情字典，用于模式行为、简码（shortcode）和文档往返；延迟加载选择器并不会移除这份字典。如果你提供了单独的建议数据集，可以在异步的 `suggestion.items` 回调中动态导入它。
