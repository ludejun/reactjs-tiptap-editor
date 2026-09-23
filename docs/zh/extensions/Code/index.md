---
description: 行内代码

next:
  text: CodeBlock
  link: /zh/extensions/CodeBlock/index.md
---

# Code

将一小段文字格式化为行内代码。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Code, RichTextCode } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Code];

export default function CodeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextCode />
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
import { Code, RichTextProvider, RichTextCode } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Code];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextCode />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选中诸如变量名之类的文本，然后点击代码按钮。如果需要带语言选择器的多行代码，请改用 [Code Block](/zh/extensions/CodeBlock/)。行内命令是 `editor.chain().focus().toggleCode().run()`。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['mod', 'E']`

控件上显示的快捷键标签。要修改实际的按键绑定，请参阅 [快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)。
