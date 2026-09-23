---
description: 缩进

next:
  text: Italic
  link: /zh/extensions/Italic/index.md
---

# Indent

增加或减少受支持块的缩进。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Indent, RichTextIndent } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Indent];

export default function IndentExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIndent />
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
import { Indent, RichTextProvider, RichTextIndent } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Indent];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIndent />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

将光标放在某个段落中，使用缩进控件。若要支持列表嵌套，请同时注册对应的列表和列表项扩展。缩进改变的是布局，不会在文本中插入空格。

## 选项

### shortcutKeys

类型：`string[][]`\
默认值：`[['Tab'], ['Shift', 'Tab']]`

控件显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
