---
description: HorizontalRule

next:
  text: Iframe
  link: /zh/extensions/Iframe/index.md
---

# Horizontal Rule

在块之间插入一条水平分隔线。

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
import { HorizontalRule, RichTextHorizontalRule } from 'ai-sparkwrite-editor/horizontalrule';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, HorizontalRule];

export default function HorizontalRuleExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextHorizontalRule />
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

将光标放在分隔线应出现的位置，然后点击工具栏按钮。对应的命令是 `editor.chain().focus().setHorizontalRule().run()`。如果希望在末尾的非段落块之后自动创建一个段落，可添加 Tiptap 的 `TrailingNode`。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['mod', 'alt', 'S']`

控件所显示的快捷键标签。参阅[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
