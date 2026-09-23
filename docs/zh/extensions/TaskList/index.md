---
description: 任务列表

next:
  text: TextAlign
  link: /zh/extensions/TextAlign/index.md
---

# Task List

创建带交互式复选框的清单。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, TaskList, RichTextTaskList } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TaskList];

export default function TaskListExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTaskList />
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
import { TaskList, RichTextProvider, RichTextTaskList } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TaskList];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextTaskList />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

本库的 `TaskList` 已包含 `TaskItem`；请勿再注册其他任务项扩展。点击工具栏按钮创建清单，点击复选框可切换其选中状态。使用 `TaskList.configure({ taskItem: { nested: true } })` 可允许嵌套任务。

## 选项

### shortcutKeys

类型：`string[]`\
默认值：`['shift', 'mod', '9']`

控件显示的快捷键标签。参见[键盘快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)以修改实际的按键绑定。
