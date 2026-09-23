---
description: 安装 ai-sparkwrite-editor，在 React 或 Vue 中渲染出一个可用的编辑器

next:
  text: 工具栏
  link: /zh/guide/toolbar.md
---

# 快速开始

`ai-sparkwrite-editor` 是 Tiptap 扩展加上现成的控件。你创建编辑器实例、选择功能，再组合出界面。同一套扩展服务于两个框架：React 从 `ai-sparkwrite-editor/<feature>` 引入每个功能，Vue 从 `ai-sparkwrite-editor/core` 引入扩展、从 `ai-sparkwrite-editor/vue` 引入 UI。

请将所有 `@tiptap/*` 包保持在同一个兼容版本上。本仓库使用 `^3.29.2`；`@tiptap/vue-3` 必须与 `@tiptap/core` 版本完全一致。

## React

### 1. 安装

::: code-group

```sh [pnpm]
pnpm add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [npm]
npm install ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [bun]
bun add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

```sh [yarn]
yarn add ai-sparkwrite-editor @tiptap/react@^3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2
```

:::

像 `ai-sparkwrite-editor/bold` 这样的功能子路径属于同一个包的一部分，不需要单独安装。当示例引入了另一个 `@tiptap/*` 包时，也要一并安装它。

### 2. 渲染一个可用的编辑器

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { Italic, RichTextItalic } from 'ai-sparkwrite-editor/italic';
import { History, RichTextUndo, RichTextRedo } from 'ai-sparkwrite-editor/history';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  History,
  Bold,
  Italic,
  // 你后端的一个接口地址；由哪个提供方、哪个模型来回答由它决定。
  AI.configure({ endpoint: '/api/ai' }),
  AIAutocomplete,
];

export default function TextEditor() {
  const editor = useEditor({
    extensions,
    content: '<p>Select some text, or press the AI button.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextAI />
        <RichTextToolbarDivider />
        <RichTextUndo />
        <RichTextRedo />
        <RichTextBold />
        <RichTextItalic />
      </RichTextToolbar>
      <EditorContent editor={editor} />
      <RichTextAIComposer />
      <RichTextBubbleText />
    </RichTextProvider>
  );
}
```

样式表提供了控件样式和内容样式；消费方应用不需要 Tailwind。如果不需要 AI 相关部分，去掉即可——每个功能都是可选的。

### Next.js 与服务端渲染

将编辑器放在客户端组件（`'use client'`）中，并设置 `immediatelyRender: false`；在渲染 provider 之前先处理好初始的 `null` editor；在框架允许全局 CSS 的位置引入样式表。参见 [Tiptap 的 React 集成](https://tiptap.dev/docs/editor/getting-started/install/react)。

## Vue

### 1. 安装

::: code-group

```sh [pnpm]
pnpm add ai-sparkwrite-editor @tiptap/vue-3@3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2 lucide-vue-next
```

```sh [npm]
npm install ai-sparkwrite-editor @tiptap/vue-3@3.29.2 @tiptap/pm@^3.29.2 @tiptap/extension-document@^3.29.2 @tiptap/extension-paragraph@^3.29.2 @tiptap/extension-text@^3.29.2 lucide-vue-next
```

:::

`ai-sparkwrite-editor/vue` 只依赖 `vue`、`@tiptap/vue-3` 和 `lucide-vue-next`；不会加载任何 React 相关内容。

### 2. 渲染一个可用的编辑器

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Bold, History, Italic } from 'ai-sparkwrite-editor/core';
import {
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  RichTextBold,
  RichTextBubbleText,
  RichTextItalic,
  RichTextProvider,
  RichTextRedo,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextUndo,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    History,
    Bold,
    Italic,
    AI.configure({ endpoint: '/api/ai' }), // 你后端的一个接口地址
    AIAutocomplete,
  ],
  content: '<p>Select some text, or press the AI button.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextAI />
      <RichTextToolbarDivider />
      <RichTextUndo /><RichTextRedo /><RichTextBold /><RichTextItalic />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
    <RichTextBubbleText />
  </RichTextProvider>
</template>
```

带交互节点视图的块扩展（`CodeBlock`、`Image`、`Katex`、`Divider` 等）也来自 `ai-sparkwrite-editor/vue`，这样才能挂上 Vue 的节点视图；其余都来自 `core`。完整列表见[框架支持](/zh/guide/frameworks)。默认只内置英文，使用 `localeActions.setMessage` 注册其他语言（见[国际化](/zh/guide/internationalization)）。

## 各组成部分

| 组成部分                                   | 职责                                                      |
| ------------------------------------------ | --------------------------------------------------------- |
| `useEditor`                                | 创建 Tiptap 实例，配置内容、扩展和回调。                  |
| `Document`、`Paragraph`、`Text`            | 定义最小文档结构。各自只需注册一次。                      |
| `Bold`、`Image`、`AI` 等                   | 向 `extensions` 添加节点、标记、命令或行为。              |
| `RichTextProvider`                         | 让编辑器可供控件使用，并承载样式表所依赖的根类名。        |
| `RichTextBold`、`RichTextAI` 等            | 对应已注册扩展的控件。需要按钮时自行放入工具栏。          |
| `RichTextAIComposer`、`RichTextBubbleText` | 编辑器下方的写作台和选区菜单。放在 `EditorContent` 之后。 |
| `EditorContent`                            | 渲染可编辑的文档，不附带工具栏。                          |

每个功能都要同时注册扩展**并**渲染其控件（如果你想要一个按钮的话）。只引入控件而不注册扩展不会启用该功能；扩展也可以在没有按钮的情况下通过命令驱动。避免同时注册一个库扩展和同名的 Tiptap 扩展——如果你使用了 `StarterKit`，请先在其中禁用重叠的功能。

## 保存、加载、只读

在 `onUpdate` 中读取文档内容，并对网络保存做防抖：

```ts
const editor = useEditor({
  extensions,
  onUpdate: ({ editor }) => {
    const nextDocument = editor.getJSON(); // or editor.getHTML()
    save(nextDocument);
  },
});
```

创建编辑器时，将保存的 HTML 或 Tiptap JSON 作为 `content` 传入。对于之后加载的文档，只需调用一次 `editor.commands.setContent(html, { emitUpdate: false })`，而不是在每次 `onUpdate` 时都调用。加载已存内容时，请保持存储该内容所需的扩展处于注册状态；schema 不认识的节点无法被表示。

只读：在 `useEditor` 中设置 `editable: false`，或之后调用 `editor.setEditable(false)`。当编辑器不可编辑时，AI 写作台、菜单以及空格/Tab 入口会自动隐藏。

## 排查问题

| 现象                         | 检查项                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| 某个控件不见了               | 注册对应扩展，并在 `RichTextProvider` 下渲染该控件。                                |
| 未知节点或缺少命令           | 查看该功能页面是否有配套扩展（列表需要 `ListItem`，颜色需要 `TextStyle`）。         |
| 重复扩展警告                 | 移除重叠的注册，包括 `StarterKit` 内部的。                                          |
| UI 没有样式                  | 引入 `ai-sparkwrite-editor/style.css` 以及任何功能专属的样式表。                    |
| 出现两份 `@tiptap/core`      | 将 `@tiptap/vue-3`（以及每个 `@tiptap/*`）固定为同一版本；版本不一致会破坏 schema。 |
| 获取数据后内容不变化         | 加载后使用 `setContent`；`content` 只在初始化时生效。                               |
| 出现斜杠占位符但没有菜单弹出 | 注册 `SlashCommand` 并挂载 `SlashCommandList`（React）；占位符本身只是文本。        |
| AI 按钮没有反应              | 注册带 `endpoint`（或模型 / `generate`）的 `AI` 扩展；否则面板会显示配置错误。      |
| 上传内容没有持久化           | 提供一个能解析为持久化 URL 的上传回调。                                             |

## 接下来看什么

[AI](/zh/extensions/AI/) 了解写作台、自动补全和提供方 · [工具栏](/zh/guide/toolbar) 和[气泡菜单](/zh/guide/bubble-menu)用于组合界面 · [功能一览](/zh/guide/features) 查看每个扩展及其引入路径 · [框架支持](/zh/guide/frameworks) 了解核心/React/Vue 的划分 · [国际化](/zh/guide/internationalization) · [自定义主题](/zh/guide/custom-theme) · [包体积](/zh/guide/bundle-size)。
