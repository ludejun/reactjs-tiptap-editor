---
description: 文字颜色

next:
  text: Column
  link: /zh/extensions/Column/index.md
---

# Color

为当前选区应用文字颜色。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。安装与其他 Tiptap 包相同版本的 `@tiptap/extension-text-style`。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Color, RichTextColor } from 'ai-sparkwrite-editor';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, Color];

export default function ColorExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextColor />
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
import { Color, RichTextProvider, RichTextColor } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, Color];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextColor />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

请注册 `TextStyle`，因为颜色是以 text-style 属性存储的。选中文本后使用颜色选择器。对应命令是 `editor.chain().focus().setColor("#2563eb").run()` 和 `editor.chain().focus().unsetColor().run()`。

## 配置调色板

在你的扩展数组中，用以下配置代替 `Color`：

```ts
import { Color } from 'ai-sparkwrite-editor';

Color.configure({
  colors: ['#dc2626', '#16a34a', '#2563eb', '#262626'],
  defaultColor: '#2563eb',
});
```

| 选项           | 作用                           | 默认值                 |
| -------------- | ------------------------------ | ---------------------- |
| `colors`       | 颜色选择器中显示的调色板条目。 | 省略时使用内置调色板。 |
| `defaultColor` | 键盘操作使用的初始颜色。       | 无。                   |
| `shortcutKeys` | 控件显示的快捷键标签。         | `['⇧', 'alt', 'C']`。  |

实际的键盘绑定是 **Alt-Shift-C**。它会应用最近一次选择的颜色；如果整个选区已经是该颜色，则会移除它。在没有已选颜色或默认颜色的情况下，它会移除已有的文字颜色，对未着色的文本则不做改动。

修改 `shortcutKeys` 只会改变显示的标签，不会改变实际绑定。参见[自定义键盘快捷键](/zh/guide/toolbar#keyboard-shortcuts)。

## 以编程方式设置格式

在已注册 Color 扩展且 editor 非空的情况下：

```ts
editor.chain().focus().setColor('#2563eb').run();
editor.chain().focus().unsetColor().run();
const currentColor = editor.getAttributes('textStyle').color;
```

Color 改变的是文字前景色。如需在文字后方添加背景色，请使用 [Highlight](/zh/extensions/Highlight/)。
