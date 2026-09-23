---
description: LineHeight

next:
  text: Link
  link: /zh/extensions/Link/index.md
---

# Line Height

通过 text-style 标记应用行高值。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。安装与你其他 Tiptap 包版本一致的 `@tiptap/extension-text-style`。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { LineHeight, RichTextLineHeight } from 'ai-sparkwrite-editor/lineheight';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, LineHeight];

export default function LineHeightExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextLineHeight />
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
import { TextStyle } from '@tiptap/extension-text-style';
import { LineHeight } from 'ai-sparkwrite-editor/core';
import { RichTextProvider, RichTextLineHeight } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, LineHeight];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextLineHeight />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

注册 `TextStyle`。选中文本后，从下拉菜单中选择一个数值。`Default` 会移除显式设置的行高。通过 `lineHeights` 配置可选项；这些值是 CSS 行高，例如 `1.5` 或 `2`。

## 配置

```ts
import { LineHeight } from 'ai-sparkwrite-editor/lineheight';

LineHeight.configure({
  lineHeights: ['Default', '1.5', '2', '2.5'],
});
```

在 `extensions` 中使用这个已配置的扩展，替代未配置的版本。默认选项为 `Default`、`1.5`、`2`、`2.5`、`3`、`3.5` 和 `4`。
