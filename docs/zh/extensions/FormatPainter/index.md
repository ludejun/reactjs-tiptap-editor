---
description: FormatPainter

next:
  text: Heading
  link: /zh/extensions/Heading/index.md
---

# Format Painter

将行内格式从一处选区复制到另一处选区。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  FormatPainter,
  RichTextFormatPainter,
  Bold,
  RichTextBold,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold, FormatPainter];

export default function FormatPainterExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBold />
      <RichTextFormatPainter />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

:::

::: warning 仅 React
此功能的交互界面依赖 React 库，Vue 层暂未包含该功能。Vue 入口涵盖的内容参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

注册你想要复制的标记扩展，例如 Bold、Italic、Color 或 FontSize。格式刷复制的是已有的标记，它本身不会新增这些功能。示例中包含 Bold，方便你先为源选区设置格式后再复制。

## 行为

1. 选中已经带有目标格式的文本。
2. 点击格式刷按钮。
3. 选中目标文本。
4. 复制的标记会应用到目标选区，格式刷随后自动关闭。

按 `Escape` 或再次点击按钮可取消格式刷状态。

## 命令

### setPainter

复制当前选区的标记，并开启格式刷模式。

```ts
editor.commands.setPainter();
```

### unsetPainter

取消格式刷模式。

```ts
editor.commands.unsetPainter();
```
