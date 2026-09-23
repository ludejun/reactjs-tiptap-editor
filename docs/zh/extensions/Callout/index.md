---
description: Callout
---

# Callout

将文本组织在一个视觉上突出的提示块中。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Callout, RichTextCallout } from 'ai-sparkwrite-editor/callout';
import { RichTextBubbleCallout } from 'ai-sparkwrite-editor/bubble/callout';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Callout];

export default function CalloutExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextCallout />
      <RichTextBubbleCallout />
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
import { Callout, RichTextProvider, RichTextCallout } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Callout];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextCallout />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Vue 层暂未提供：`RichTextBubbleCallout` —— 请在你自己的控件中调用对应的命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

打开工具栏对话框，选择一种提示块类型，输入标题和正文内容，然后应用。挂载 `RichTextBubbleCallout` 以支持上下文编辑。callout 是一个带有 `type`、`title` 和 `body` 属性的原子节点，而不是嵌套编辑器块的容器。

## 通过代码插入

在 editor 非空的情况下，你可以直接插入一个 callout：

```ts
editor
  .chain()
  .focus()
  .setCallout({
    type: 'tip',
    title: 'Save your work',
    body: 'Use the Save button before leaving this page.',
  })
  .run();
```

内置对话框提供 `note`、`tip`、`important`、`warning` 和 `caution` 五种类型。
