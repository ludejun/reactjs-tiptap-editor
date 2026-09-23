---
description: 安装 ai-sparkwrite-editor，在 React 或 Vue 中渲染出一个可用的编辑器

next:
  text: 工具栏
  link: /zh/guide/toolbar.md
---

# 快速开始

`ai-sparkwrite-editor` 是 Tiptap 扩展加上现成的控件，**每个框架只有一个入口**：React 用 `ai-sparkwrite-editor`，Vue 用 `ai-sparkwrite-editor/vue`。最快的起步方式是 Kit——`RichTextKit` 注册全部功能，`RichTextKitToolbar` 和 `RichTextKitMenus` 渲染界面——也可以从同一个入口逐个挑选功能。会 tree-shake ES 模块的打包器只会打进你引用到的东西，所以单一入口不多花一个字节（见[包体积](/zh/guide/bundle-size)）。

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

只有自己组装扩展时（见第 3 节）才需要 `@tiptap/extension-*` 这些包；Kit 自带。

### 2. 十行代码，完整编辑器

`RichTextKit` 把所有功能装进一个扩展，类似 Tiptap 的 StarterKit；`RichTextKitToolbar` 和 `RichTextKitMenus` 会按已注册的功能渲染工具栏、AI 写作台、气泡菜单、拖拽手柄和斜杠菜单。

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import {
  RichTextKit,
  RichTextKitMenus,
  RichTextKitToolbar,
  RichTextProvider,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

export default function Editor() {
  const editor = useEditor({
    extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })],
    content: '<p>Hello</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextKitToolbar />
      <EditorContent editor={editor} />
      <RichTextKitMenus />
    </RichTextProvider>
  );
}
```

`RichTextKit.configure({ … })` 的每个键对应一个功能：`false` 去掉它（按钮和菜单一并消失），传对象则配置它——`image: { upload }`、`codeBlock: { defaultLanguage: 'ts' }`、`ai: { endpoint }`。需要密钥或回调的功能默认不启用，传入对象后才出现：`imageGif: { GIPHY_API_KEY }`、`mention: { suggestion }`、`emoji: {}`、`excalidraw: {}`、`drawer: {}`、`twitter: {}`、`shortMessage: { messages }`、`recorder: {}`、`placeholder: { placeholder: '开始写…' }`、`horizontalRule: {}`。`<RichTextKitToolbar more={false}>` 去掉“更多工具”面板，其子元素会作为额外控件放入工具栏；`<RichTextKitMenus composer={false} dragHandle={false} />` 可精简浮动界面。

### 3. 或者自己挑选功能

同一个入口导出全部扩展和控件；注册你想要的扩展，再摆放对应的控件：

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  Bold,
  RichTextBold,
  Italic,
  RichTextItalic,
  History,
  RichTextUndo,
  RichTextRedo,
  RichTextBubbleText,
} from 'ai-sparkwrite-editor';
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

样式表提供了控件样式和内容样式；消费方应用不需要 Tailwind。如果不需要 AI 相关部分，去掉即可——每个功能都是可选的。功能子路径（`ai-sparkwrite-editor/bold`、`/ai`、`/bubble/text`……）依然保留，供不做 tree-shake 的打包器使用。

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

`ai-sparkwrite-editor/vue` 只依赖 `vue`、`@tiptap/vue-3` 和 `lucide-vue-next`；不会加载任何 React 相关内容。它同时导出扩展（框架无关的扩展加上带 Vue 节点视图的块），所以 Vue 应用只需这一个入口。

### 2. 十行代码，完整编辑器

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import {
  RichTextKit,
  RichTextKitMenus,
  RichTextKitToolbar,
  RichTextProvider,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [RichTextKit.configure({ ai: { endpoint: '/api/ai' } })],
  content: '<p>Hello</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextKitToolbar />
    <EditorContent :editor="editor" />
    <RichTextKitMenus />
  </RichTextProvider>
</template>
```

Vue 版 Kit 的选项与 React 版相同，只是不含仅 React 可用的功能（Excalidraw、手绘、emoji、提及、Twitter 嵌入、斜杠菜单）；`column` 和 `imageGif` 需要显式开启。

### 3. 或者自己挑选功能

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold,
  History,
  Italic,
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

扩展、节点视图和控件全部来自 `ai-sparkwrite-editor/vue`；框架无关的 `ai-sparkwrite-editor/core` 入口保留给无头或非 Vue 的场景。完整列表见[框架支持](/zh/guide/frameworks)。默认只内置英文，使用 `localeActions.setMessage` 注册其他语言（见[国际化](/zh/guide/internationalization)）。

## 各组成部分

| 组成部分                                   | 职责                                                                              |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| `useEditor`                                | 创建 Tiptap 实例，配置内容、扩展和回调。                                          |
| `RichTextKit`                              | 所有功能合成的一个扩展；用 `.configure({ bold: false, ai: { endpoint } })` 取舍。 |
| `RichTextKitToolbar`、`RichTextKitMenus`   | 按已注册的功能渲染工具栏和浮动界面。                                              |
| `Document`、`Paragraph`、`Text`            | 定义最小文档结构。各自只需注册一次。                                              |
| `Bold`、`Image`、`AI` 等                   | 向 `extensions` 添加节点、标记、命令或行为。                                      |
| `RichTextProvider`                         | 让编辑器可供控件使用，并承载样式表所依赖的根类名。                                |
| `RichTextBold`、`RichTextAI` 等            | 对应已注册扩展的控件。需要按钮时自行放入工具栏。                                  |
| `RichTextAIComposer`、`RichTextBubbleText` | 编辑器下方的写作台和选区菜单。放在 `EditorContent` 之后。                         |
| `EditorContent`                            | 渲染可编辑的文档，不附带工具栏。                                                  |

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

[AI](/zh/extensions/AI/) 了解写作台、自动补全和提供方 · [工具栏](/zh/guide/toolbar) 和[气泡菜单](/zh/guide/bubble-menu)用于组合界面 · [功能一览](/zh/guide/features) 查看每个扩展及其选项 · [框架支持](/zh/guide/frameworks) 了解核心/React/Vue 的划分 · [国际化](/zh/guide/internationalization) · [自定义主题](/zh/guide/custom-theme) · [包体积](/zh/guide/bundle-size)。
