---
description: Notice
---

# Notice 提示块

带图标的彩色提示框，四种类型：**信息**、**成功**、**警告**、**技巧**，里面放的是普通的可编辑块：段落、列表、代码、表格。也就是多数文档编辑器 “+ → Info notice” 插入的那种块。

<div class="notice" data-type="success"><p><strong>以普通 HTML 保存。</strong> 提示块就是包在普通块外面的 <code>&lt;div class="notice" data-type="success"&gt;</code>，因此保存的文档在任何加载了样式表的页面都渲染出同样的框——不需要 node view，也不需要自定义渲染器。</p></div>

## 安装

先按[快速开始](/zh/guide/getting-started)装好依赖。`RichTextKit` 已内置提示块（选项 `notice`）。自行拼装：

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Notice,
  RichTextNotice,
  RichTextBubbleNotice,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Notice];

export default function NoticeExample() {
  const editor = useEditor({
    extensions,
    content: '<div class="notice" data-type="info"><p>在这里试试。</p></div>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextNotice />
      <RichTextBubbleNotice />
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
import {
  Notice,
  RichTextProvider,
  RichTextNotice,
  RichTextBubbleNotice,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Notice];

const editor = useEditor({
  extensions,
  content: '<div class="notice" data-type="info"><p>在这里试试。</p></div>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextNotice />
    <RichTextBubbleNotice />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用

- **工具栏**：`RichTextNotice` 是四种类型的下拉。选一种即把选中的块（或当前段落）包进提示块；在提示块里再选同一类型则移除，选另一类型则切换。
- **斜杠菜单**：`/notice`、`/info`、`/success`、`/warning`、`/tip`（也支持 `tsk`、`cg`、`jg`、`jq` 拼音首字母），每种类型一项：“信息提示块”“成功提示块”……与其他编辑器的 “+” 菜单一致。
- **气泡菜单**：`RichTextBubbleNotice` 出现在光标所在提示块的上方，可切换四种类型或移除。
- **键盘**：在最后一个空行按 Enter 即跳出提示块，与列表结束的方式相同。

## 保存格式

```html
<div class="notice" data-type="warning">
  <p>发布会覆盖线上页面。</p>
  <ul><li><p>先检查表格。</p></li></ul>
</div>
```

`data-type` 为 `info`、`success`、`warning`、`tip` 之一，其他值读回时按 `info` 处理。颜色和图标由样式表提供（`.notice[data-type='…']`），只读页面只需引入 `ai-sparkwrite-editor/style.css`。按类型覆盖 `--notice-color`、`--notice-background`、`--notice-icon` 即可改样式。

Markdown 导出为 GitHub 风格的 alert：`> [!NOTE]`、`> [!TIP]`、`> [!WARNING]`，以及 `> [!SUCCESS]`（其他渲染器会显示为普通引用）。

## 命令

```ts
editor.chain().focus().setNotice('tip').run(); // 包裹选区
editor.chain().focus().toggleNotice('warning').run(); // 包裹、切换类型或移除
editor.chain().focus().updateNotice('success').run(); // 切换类型
editor.chain().focus().unsetNotice().run(); // 把里面的块提出来
```

`NOTICE_TYPES` 列出类型与颜色；`getNoticeType()` 把未知值归一化。
