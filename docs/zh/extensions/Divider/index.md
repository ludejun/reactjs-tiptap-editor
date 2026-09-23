---
description: 分隔线

next:
  text: Drawer
  link: /zh/extensions/Drawer/index.md
---

# Divider

一个模块，多种样式：普通直线、虚线、点线、双线、居中短线、三个点、星号、中间带文字的分隔线，或带编号的分隔线。用于替代 `HorizontalRule`，两者只注册一个，不要同时注册。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Divider, RichTextDivider } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Divider];

export default function DividerExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextDivider />
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
import { Divider, RichTextProvider, RichTextDivider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Divider];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextDivider />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

工具栏按钮会打开一个样式菜单，每种样式都有预览图。`/divider`（也可用 `/hr`）以及 <kbd>⌘</kbd>/<kbd>Ctrl</kbd> <kbd>⌥</kbd>/<kbd>Alt</kbd> <kbd>S</kbd> 会插入 `defaultVariant`。点击某条分隔线可以选中它：上方会出现一个小选择器，用于就地切换样式。

有两种变体可编辑：

- **Text** 会在分隔线中间显示一个输入框。输入标题（如 "Chapter 2"、"Part II"）；按 <kbd>Enter</kbd> 离开输入框并继续在下方编辑。
- **Numbered** 显示它在文档中所有编号分隔线中的序号。移动或删除某一条会重新为其余的编号，该数字保存在 `label` 中，因此保存的 HTML 与导出结果都会带上它。

命令：

```ts
editor.chain().focus().setDivider({ variant: 'dashed' }).run();
editor.chain().focus().setDivider({ variant: 'text', label: 'Chapter 2' }).run();
editor.commands.updateDivider({ variant: 'stars' }); // acts on the selected divider
```

## 保存的 HTML

```html
<div
  data-type="divider"
  data-variant="text"
  data-label="Chapter 2"
  class="divider divider--text"
  role="separator"
>
  <hr />
  <span class="divider__label">Chapter 2</span>
  <hr />
</div>
```

`<hr>` 保留在内部，因此即便未加载样式表，这条线在 Word 导出结果和会剥离 class 的信息流中依然可见。Markdown 导出会写出 `---`；标题文字没有对应的 Markdown 形式。`<hr>` 以及旧版的 `<div data-type="horizontalRule">` 标记会被读取为 `line` 分隔线，因此已有文档打开后不受影响。

## 选项

### variants

类型：`{ value: string; label?: string; editable?: boolean }[]`\
默认值：内置的九种变体，其中 `text` 可编辑

菜单中提供的样式，按菜单顺序排列。删除条目即可减少可选样式；添加自己的 `value` 并在 CSS 中定义 `.divider--<value>` 即可扩展。`editable` 用于显示标题输入框。`label` 会覆盖菜单文字（内置的值已本地化）。

```ts
Divider.configure({
  variants: [
    { value: 'line' },
    { value: 'text', editable: true },
    { value: 'wave', label: 'Wave' }, // styled by your CSS
  ],
});
```

### defaultVariant

类型：`string`\
默认值：`'line'`

由工具栏按钮、斜杠命令和快捷键插入。

### renderDivider

类型：`(attrs: { variant: string; label: string | null }) => DOMOutputSpec`\
默认值：上方所示的标记

替换保存的 HTML。将其与 `parseRules` 搭配使用，使同一份标记能被正确读回：

```ts
Divider.configure({
  renderDivider: ({ variant, label }) => [
    'hr',
    { class: `sep sep-${variant}`, 'data-label': label ?? '' },
  ],
  parseRules: [
    {
      tag: 'hr.sep',
      getAttrs: (el) => ({
        variant: (el as HTMLElement).className.replace(/.*sep-(\S+).*/, '$1'),
        label: (el as HTMLElement).getAttribute('data-label') || null,
      }),
    },
  ],
});
```

### parseRules

类型：`ParseRule[]`\
默认值：`[]`

在内置规则之前尝试的额外解析规则。

### shortcutKeys

类型：`string[]`\
默认值：`['mod', 'alt', 'S']`

控件上显示的快捷键标签。要修改实际的按键绑定，请参阅 [快捷键配置](/zh/guide/toolbar#keyboard-shortcuts)。
