---
description: Drawer

next:
  text: Emoji
  link: /zh/extensions/Emoji/index.md
---

# Drawer

创建手绘涂鸦并插入到文档中。

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
  Drawer,
  RichTextDrawer,
  RichTextBubbleDrawer,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';
import 'easydrawer/styles.css';

const extensions = [Document, Paragraph, Text, Drawer];

export default function DrawerExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextDrawer />
      <RichTextBubbleDrawer />
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

请在编辑器样式表旁一并加载 `easydrawer/styles.css`。打开绘图对话框，进行绘制，然后应用结果。你可以提供一个 `upload` 回调、resolve 出一个持久 URL，从而将生成的 SVG 存储到远端。如需解析其 CSS 导入，请直接安装 `easydrawer`。

## 加载行为

绘图画布会在创建或编辑对话框打开时加载。首次打开可能会显示加载占位符，模块加载失败时会提供重试操作。请保留上面的样式表导入，以便画布在可用时具有正确的样式。
