---
description: 粗体

next:
  text: BulletList
  link: /zh/extensions/BulletList/index.md
---

# Bold

为选中的文本应用粗体强调，或在输入前启用粗体。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Bold, RichTextBold } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold];

export default function BoldExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBold />
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
import { Bold, RichTextProvider, RichTextBold } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextBold />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选中一个词，点击**粗体**按钮。再次点击可移除该标记。使用 `editor.chain().focus().toggleBold().run()` 可从你自己的控件中触发该操作。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['mod', 'B']`

控件上显示的快捷键标签。要修改实际的按键绑定，请参阅 [快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)。
