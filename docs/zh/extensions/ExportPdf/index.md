---
description: 导出 PDF

next:
  text: ExportWord
  link: /zh/extensions/ExportWord/index.md
---

# Export PDF

为编辑器内容打开浏览器的打印流程。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { ExportPdf, RichTextExportPdf } from 'ai-sparkwrite-editor/exportpdf';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportPdf];

export default function ExportPdfExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextExportPdf />
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
import { ExportPdf } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, ExportPdf];

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
Vue 层尚未提供：`RichTextExportPdf`——请通过自己的控件调用对应命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点击工具栏按钮，然后在弹出的对话框中选择浏览器提供的 PDF 目标（如果可用）。这里使用的是浏览器打印功能，而不是直接返回一个 PDF Blob。请在下方配置纸张尺寸和页边距，并留意打印预览，因为最终效果由浏览器决定。

---

## 选项

### paperSize

类型：`PaperSize`

默认值：`'Letter'`

指定导出 PDF 时使用的纸张尺寸。

支持的取值：

```ts
type PaperSize = 'Legal' | 'Letter' | 'Tabloid' | 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5';
```

### margins

类型：

```ts
{
  top: PageMargin;
  right: PageMargin;
  bottom: PageMargin;
  left: PageMargin;
}
```

默认值：

```ts
{
  top: '0.4in',
  right: '0.4in',
  bottom: '0.4in',
  left: '0.4in'
}
```

控制页面四边的边距。可以使用英寸（`in`）、厘米（`cm`）、毫米（`mm`）或磅（`pt`）作为单位。

支持的取值：

```ts
type PageMargin =
  // 英寸
  | '0in'
  | '0.25in'
  | '0.4in'
  | '0.5in'
  | '0.75in'
  | '1in'
  | '1.25in'
  | '1.5in'
  | '1.75in'
  | '2in'
  // 厘米
  | '0cm'
  | '0.5cm'
  | '1cm'
  | '1.5cm'
  | '2cm'
  | '2.5cm'
  | '3cm'
  | '4cm'
  | '5cm'
  // 毫米
  | '0mm'
  | '5mm'
  | '10mm'
  | '15mm'
  | '20mm'
  | '25mm'
  | '30mm'
  | '40mm'
  | '50mm'
  // 磅
  | '0pt'
  | '18pt'
  | '36pt'
  | '54pt'
  | '72pt'
  | '90pt'
  | '108pt'
  | '144pt';
```

用法示例：

```ts
import { ExportPdf } from 'ai-sparkwrite-editor/exportpdf';

ExportPdf.configure({
  paperSize: 'A4',
  margins: {
    top: '1in',
    right: '0.4in',
    bottom: '1in',
    left: '0.4in',
  },
});
```
