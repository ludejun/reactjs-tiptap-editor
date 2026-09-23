---
description: Search And Replace

next:
  text: ShortMessage
  link: /zh/extensions/ShortMessage/index.md
---

# Search And Replace

在文档中查找文本，并替换单个匹配项或全部匹配项。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, SearchAndReplace, RichTextSearchAndReplace } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, SearchAndReplace];

export default function SearchAndReplaceExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextSearchAndReplace />
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
import { SearchAndReplace, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, SearchAndReplace];

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
Vue 层暂未提供：`RichTextSearchAndReplace` —— 请在你自己的控件中调用对应的命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

打开工具栏对话框，输入搜索词，在替换之前使用匹配项导航。如果需要让用户能够撤销替换操作，请注册 [History](/zh/extensions/History/)。

## Props

| Prop                       | 类型         | 说明               | 默认值                    |
| -------------------------- | ------------ | ------------------ | ------------------------- |
| `searchTerm`               | `string`     | 搜索词             | `''`                      |
| `replaceTerm`              | `string`     | 替换词             | `''`                      |
| `searchResultClass`        | `string`     | 搜索结果的类名     | `'search-result'`         |
| `searchResultCurrentClass` | `string`     | 当前搜索结果的类名 | `'search-result-current'` |
| `caseSensitive`            | `boolean`    | 区分大小写         | `false`                   |
| `disableRegex`             | `boolean`    | 禁用正则表达式     | `false`                   |
| `onChange`                 | `() => void` | 变更回调           | `undefined`               |
