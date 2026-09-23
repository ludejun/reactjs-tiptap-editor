---
description: Highlight

next:
  text: History
  link: /zh/extensions/History/index.md
---

# Highlight

为选中的文本添加背景高亮。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Highlight, RichTextHighlight } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Highlight];

export default function HighlightExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextHighlight />
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
import { Highlight, RichTextProvider, RichTextHighlight } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Highlight];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextHighlight />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

选择一个颜色，然后选中要高亮的文本。该扩展默认支持多种高亮颜色。设置 `Highlight.configure({ defaultColor: "#fef08a" })` 可以为高亮快捷键指定初始颜色。对应命令为 `setHighlight({ color: "#fef08a" })` 和 `unsetHighlight()`。

## 功能特性

- 🎨 **多种颜色**：支持多种高亮颜色
- ⌨️ **键盘快捷键**：使用 `Mod-Shift-H` 快速高亮
- 🔄 **智能切换**：智能的高亮切换与替换
- 🎯 **同步选中状态**：工具栏与气泡菜单之间的颜色选择器保持同步
- 🎨 **自定义颜色**：通过颜色选择器添加自定义高亮颜色
- 💾 **最近使用的颜色**：自动记录最近使用过的颜色
- ❌ **无填充选项**：可选择移除高亮

## 选项

### defaultColor

类型：`string`\
默认值：`undefined`

扩展初始化时使用的默认高亮颜色。首次通过键盘快捷键应用高亮时会使用这个颜色。

```js
Highlight.configure({
  defaultColor: '#ffff00', // 黄色
  // 或
  defaultColor: '#ffc078', // 橙色
});
```

### shortcutKeys

类型：`string[]`\
默认值：`['⇧', 'mod', 'H']`

控件显示的快捷键标签。实际绑定的是 `Mod-Shift-H`（Windows/Linux 上为 Ctrl-Shift-H，macOS 上为 Cmd-Shift-H）。修改这个选项不会重新绑定快捷键，参见[键盘快捷键](/zh/guide/toolbar#keyboard-shortcuts)。

```js
Highlight.configure({
  shortcutKeys: ['⇧', 'mod', 'H'],
});
```

## 键盘快捷键行为

`Mod-Shift-H` 键盘快捷键具有智能切换行为：

1. **尚未应用高亮**：应用当前选中的高亮颜色
2. **已应用相同颜色**：移除高亮（切换为关闭）
3. **已应用不同颜色**：替换为当前选中的高亮颜色
4. **已选择“无填充”**：不执行任何操作（防止应用未定义的高亮）

## 颜色选择同步

该扩展在所有实例之间维护一份共享的高亮颜色状态：

- 在工具栏中选择颜色会更新气泡菜单
- 在气泡菜单中选择颜色会更新工具栏
- 键盘快捷键使用最后一次选中的颜色
- 所有颜色选择器都显示同一个选中的颜色
- 选择“无填充”会清除已保存的颜色

## 示例

### 基本用法

```tsx
import { Highlight } from 'ai-sparkwrite-editor';

const extensions = [Highlight];
```

### 指定默认颜色

```tsx
import { Highlight } from 'ai-sparkwrite-editor';

const extensions = [
  Highlight.configure({
    defaultColor: '#ffc078', // 橙色高亮
  }),
];
```

### 编程方式调用

```tsx
// 应用带颜色的高亮
editor.chain().focus().setHighlight({ color: '#ffff00' }).run();

// 移除高亮
editor.chain().focus().unsetHighlight().run();

// 切换高亮（相同颜色则移除，不同颜色或无高亮则应用）
editor.chain().focus().toggleHighlight({ color: '#ffff00' }).run();

// 检查高亮是否处于激活状态
const isHighlightActive = editor.isActive('highlight');

// 检查特定颜色是否处于激活状态
const isYellowActive = editor.isActive('highlight', { color: '#ffff00' });

// 获取当前高亮颜色
const { color } = editor.getAttributes('highlight');
```

## 颜色选择器

高亮颜色选择器包括：

- **无填充**：从文本中移除高亮
- **调色板**：预设颜色，方便快速选择
- **最近使用的颜色**：最近使用过的 10 种颜色
- **自定义颜色**：通过颜色选择器挑选任意颜色

## 与 Color 扩展的区别

| 特性       | Highlight     | Color         |
| ---------- | ------------- | ------------- |
| 用途       | 背景高亮      | 文字颜色      |
| 默认快捷键 | `Mod-Shift-H` | `Alt-Shift-C` |
| 无填充行为 | 移除高亮      | 移除文字颜色  |
| 视觉效果   | 背景颜色      | 前景颜色      |
