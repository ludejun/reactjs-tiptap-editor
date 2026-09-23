---
description: Excalidraw

next:
  text: ExportPdf
  link: /zh/extensions/ExportPdf/index.md
---

# Excalidraw

创建并插入 Excalidraw 绘图。

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
import { Excalidraw, RichTextExcalidraw } from 'ai-sparkwrite-editor/excalidraw';
import { RichTextBubbleExcalidraw } from 'ai-sparkwrite-editor/bubble/excalidraw';
import 'ai-sparkwrite-editor/style.css';
import '@excalidraw/excalidraw/index.css';

const extensions = [Document, Paragraph, Text, Excalidraw];

export default function ExcalidrawExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExcalidraw />
      <RichTextBubbleExcalidraw />
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

请在编辑器样式表旁一并加载 `@excalidraw/excalidraw/index.css`。打开工具栏对话框，创建一幅绘图，然后应用它。挂载 `RichTextBubbleExcalidraw` 以获得上下文相关的操作。如需解析其 CSS 导入，请直接安装 `@excalidraw/excalidraw`。
