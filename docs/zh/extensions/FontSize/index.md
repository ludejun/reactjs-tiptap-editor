---
description: FontSize

next:
  text: FormatPainter
  link: /zh/extensions/FormatPainter/index.md
---

# Font Size

选择所选文本使用的字号。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。安装与你其他 Tiptap 包版本一致的 `@tiptap/extension-text-style`。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, FontSize, RichTextFontSize } from 'ai-sparkwrite-editor';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontSize];

export default function FontSizeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextFontSize />
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
import { FontSize, RichTextProvider, RichTextFontSize } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontSize];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextFontSize />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

注册 `TextStyle`。通过 `fontSizes` 配置 CSS 尺寸值，例如 `14px`，或使用对象形式，例如 `{ name: "Large", value: "24px" }`。在你自己的控件中可以使用 `editor.chain().focus().setFontSize("18px").run()` 或 `unsetFontSize()`。

## 紧凑样式

`<RichTextFontSize compact />` 会渲染一个图标按钮，而不是显示当前字号的触发器。宽版触发器适合放在主工具栏中，因为一眼就能看到当前字号正是它的价值所在；而在按名称排列的菜单行中，它恰恰是唯一无法对齐的控件，因此紧凑样式与 `RichTextLineHeight` 保持一致的形态。

## 配置

```ts
import { FontSize } from 'ai-sparkwrite-editor';

FontSize.configure({
  fontSizes: ['Default', '14px', '18px', { name: 'Large', value: '24px' }],
});
```

在 `extensions` 中使用这个已配置的扩展，替代未配置的版本。
