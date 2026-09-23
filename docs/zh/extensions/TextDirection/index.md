---
description: 文字方向

next:
  text: TextUnderline
  link: /zh/extensions/TextUnderline/index.md
---

# Text Direction

为文本块设置书写方向，即从左到右或从右到左。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { TextDirection, RichTextTextDirection } from 'ai-sparkwrite-editor/textdirection';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextDirection];

export default function TextDirectionExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
    textDirection: 'auto',
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTextDirection />
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
import { TextDirection } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextDirection];

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
尚未加入 Vue 层：`RichTextTextDirection`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

示例在 `useEditor` 上设置了 `textDirection: "auto"`，这样方向控件也能恢复为自动方向。方向决定的是书写顺序；如需更改对齐方式，请使用 [Text Align](/zh/extensions/TextAlign/)。
