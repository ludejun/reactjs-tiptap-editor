---
description: MoreMark

next:
  text: OrderedList
  link: /zh/extensions/OrderedList/index.md
---

# More Mark

为公式、引用和批注添加下标和上标格式。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, MoreMark, RichTextMoreMark } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, MoreMark];

export default function MoreMarkExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextMoreMark />
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
import { MoreMark, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, MoreMark];

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
Vue 层暂未提供：`RichTextMoreMark` —— 请在你自己的控件中调用对应的命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

该扩展会为你注册下标和上标标记。选中文本并从菜单中选择所需的标记。可以通过 `MoreMark.configure({ subscript: false })` 或 `{ superscript: false }` 禁用其中一个；请避免重复注册独立的标记扩展。

## 选项

### shortcutKeys

类型：`string[][]`\
默认值：`[['mod', '.'], ['mod', ',']]`

控件中显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以更改实际的按键绑定。
