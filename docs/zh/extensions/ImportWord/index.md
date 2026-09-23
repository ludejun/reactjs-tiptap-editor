---
description: Import Word

next:
  text: Indent
  link: /zh/extensions/Indent/index.md
---

# Import Word

将 Word `.docx` 文件转换为编辑器内容。

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
import { ImportWord, RichTextImportWord } from 'ai-sparkwrite-editor/importword';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ImportWord];

export default function ImportWordExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextImportWord />
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
import { ImportWord } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ImportWord];

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
Vue 层暂未提供：`RichTextImportWord` —— 请在你自己的控件中调用对应的命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点击工具栏按钮并选择一个 `.docx` 文件。导入会替换当前文档，因此请先保存已有内容。默认的文件大小限制为 10 MiB。转换后的 HTML 会由当前激活的 schema 解析，因此请注册你希望保留的格式、列表、表格和图片相关扩展。Word 的页面布局无法保证在转换后完整保留。

## 配置

| 选项             | 作用                                                             | 默认值                    |
| ---------------- | ---------------------------------------------------------------- | ------------------------- |
| `limit`          | `.docx` 文件的最大字节数。                                       | `10 * 1024 * 1024`。      |
| `convert`        | 自定义的 `(file: File) => Promise<string>` 转换函数，返回 HTML。 | 内置的 Mammoth 转换实现。 |
| `mammothOptions` | 传递给内置 HTML 转换器的选项。                                   | 省略。                    |
| `upload`         | 上传从转换后的 HTML 中提取出的内嵌图片。                         | 省略。                    |

例如，将数组中的 `ImportWord` 替换为：

```ts
import { ImportWord } from 'ai-sparkwrite-editor/importword';

ImportWord.configure({
  limit: 5 * 1024 * 1024,
});
```

### 内嵌图片

注册库提供的 `Image` 扩展以保留导入的图片。ImportWord 的 `upload` 处理函数接收一个 `File[]`，并必须按相同顺序返回一个 `{ src: string }` 对象数组。这与 Image 扩展的上传处理函数不同，后者接收单个文件并返回单个 URL 字符串。

如果没有配置该处理函数，转换后的图片源仍会保留在 HTML 中。目前的上传处理逻辑期望从转换中得到 base64 图片源；如果自定义的 `convert` 实现返回的是远程图片 URL，则该实现自身需要负责图片存储，并省略此上传处理函数。

## 加载行为

内置的 Mammoth 转换器会在选中有效文件后才加载。自定义的 `convert` 回调会绕过内置转换器。首次导入可能会因为加载转换代码而耗时较长。
