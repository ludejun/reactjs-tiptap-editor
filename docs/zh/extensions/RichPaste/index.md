---
description: RichPaste

next:
  text: SearchAndReplace
  link: /zh/extensions/SearchAndReplace/index.md
---

# Rich Paste

修复浏览器容易处理错误的两种粘贴场景：Word 列表和从代码编辑器复制的代码。

从网页、Excel、Google Docs 或 Word 粘贴内容时，标题、加粗、链接、表格和颜色通常都能正确保留，因为剪贴板上的 HTML 可以映射到编辑器的 schema。但有两种来源例外：

- **Word 列表。** Word 不会在剪贴板上写入 `<ul>` 或 `<ol>`。每一项都是带有 `mso-list` 样式、前面跟着字面项目符号字符的段落，因此列表会以 `·` 开头的普通段落形式到达。该扩展会重建这段内容为真正的嵌套列表，从 Word 的 `level` 中读取嵌套层级，并在标记为 `1.`、`a)` 或 `iv.` 时选择有序列表。
- **代码编辑器。** VS Code、Sublime、Xcode 和 JetBrains 会在一个等宽字体、`white-space: pre` 的容器内，为每个 token 复制一个带颜色的 `<span>`。若不做处理，这会变成一段段带颜色的文字。该扩展会识别这种容器，并根据纯文本副本插入代码块，而不是保留原样。单行内容会变为行内代码而非代码块。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能。它没有工具栏控件；请将其与 `CodeBlock`、`BulletList` 和 `OrderedList` 一起注册，这样才有可粘贴的目标。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { BulletList } from 'ai-sparkwrite-editor/bulletlist';
import { CodeBlock } from 'ai-sparkwrite-editor/codeblock';
import { OrderedList } from 'ai-sparkwrite-editor/orderedlist';
import { RichPaste } from 'ai-sparkwrite-editor/richpaste';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, BulletList, OrderedList, CodeBlock, RichPaste];

export default function RichPasteExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Paste a Word list or a snippet from VS Code here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
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
import { BulletList, OrderedList, RichPaste } from 'ai-sparkwrite-editor/core';
import { CodeBlock, RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, BulletList, OrderedList, CodeBlock, RichPaste];

const editor = useEditor({
  extensions,
  content: '<p>Paste a Word list or a snippet from VS Code here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 选项

### wordLists

类型：`boolean`\
默认值：`true`

将 Word 的列表段落重建为真正的列表。

### codeBlocks

类型：`boolean`\
默认值：`true`

将从代码编辑器粘贴的内容转换为代码块。

### detectLanguage

类型：`(code: string) => string`\
默认值：无

根据粘贴内容的文本猜测其语言，并返回代码块能够识别的名称（空字符串表示“未知”）。代码块扩展内置了一个可复用的猜测函数：

```ts
import { guessLanguage } from 'ai-sparkwrite-editor/codeblock';

RichPaste.configure({ detectLanguage: guessLanguage });
```

## 不会改变的行为

在代码块内粘贴内容会保持默认行为，本身就已经能保留文本。包含段落、标题、表格或列表的 HTML 永远不会被当作代码处理，即使它使用了等宽字体。
