<p align="center">
  <img src="./docs/public/logo.svg" alt="SparkWrite" width="88" />
</p>

<h1 align="center">ai-sparkwrite-editor</h1>

<p align="center">
  <b>告诉编辑器你要什么，它直接写在页面里。</b><br/>
  基于 Tiptap 的 AI 优先富文本编辑器 SDK，支持 React 与 Vue：正文、表格、代码、任务列表、公式、图表都由模型产出，并以真正可编辑的块落进文档。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-sparkwrite-editor"><img alt="npm" src="https://img.shields.io/npm/v/ai-sparkwrite-editor.svg?label=npm&color=804dff" /></a>
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/badge/license-MIT-blue.svg" /></a>
</p>

<p align="center">
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/"><b>📘 文档网站</b></a>
  &nbsp;·&nbsp;
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/playground/"><b>🎮 在线 Playground</b></a>
  &nbsp;·&nbsp;
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/guide/getting-started"><b>🚀 快速开始</b></a>
  &nbsp;·&nbsp;
  <a href="./README.md"><b>🇬🇧 English</b></a>
</p>

![打开 AI 写作台的编辑器](./screenshot/screenshot.png)

## 特性

**AI 在文档里**

- **写作台**——在编辑器底部输入需求，回答流式写进页面，落地成标题、列表、表格、代码块。可保留、撤销、重试或就地追问；整段只占一步撤销。工具栏 ✨、`⌘J` 或 `/ai` 呼出。
- **整篇文档操作**——续写、总结、生成大纲、拟标题、提取待办、全文纠错、翻译全文，各一键；文档以 Markdown 发给模型，结构不丢。
- **选区菜单**——润色、缩写、扩写、简化、换语气、解释、翻译、转表格、转列表。全选后同样可用。
- **灰色续写**——打字停顿后出现下一句的建议，Tab 接受；空行按空格呼出 AI。
- **一句话出公式和图表**——Katex 与 Mermaid 对话框写出源码并实时渲染。
- **模型你定**——OpenAI 或 Anthropic 协议、任意代理，或自定义 `generate(request, onChunk)`。回答经编辑器 schema 解析：不是粘贴，也不会带进未知内容。

**文档需要的其他一切**

- 50+ 扩展：标题、列表、表格、带语言识别的代码块、可裁剪加题注的图片、分割线、分栏、提示块、折叠块、Katex、Mermaid、Excalidraw、视频、iframe、附件、emoji、提及、目录、搜索替换、Word/PDF/Markdown 导入导出。
- 从 Word、Google Docs、Excel、代码编辑器粘贴保持格式。
- 16 种语言按需加载，配套中日韩、天城文、孟加拉文字体。
- 录制并回放一次书写过程。
- 每个功能一个导入，扩展和控件来自同一子路径；体积克制，引入 `bold` 约 30 KB 库代码和一个图标。
- 带前缀的 Tailwind 类和少量 CSS 变量，融入你的设计系统。

## 快速接入

所有 `@tiptap/*` 包保持同一版本（`^3.29`）。

### React

```bash
pnpm add ai-sparkwrite-editor @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { Heading, RichTextHeading } from 'ai-sparkwrite-editor/heading';
import { Table, RichTextTable } from 'ai-sparkwrite-editor/table';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

export function Editor() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Heading,
      Table,
      AI.configure({ protocol: 'openai', model: 'gpt-4o-mini', baseURL: '/api/ai' }), // 密钥留在你的服务端
      AIAutocomplete,
    ],
    content: '<p>你好</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextAI />
        <RichTextToolbarDivider />
        <RichTextHeading />
        <RichTextBold />
        <RichTextTable />
      </RichTextToolbar>
      <EditorContent editor={editor} />
      <RichTextAIComposer />
      <RichTextBubbleText />
    </RichTextProvider>
  );
}
```

### Vue

```bash
pnpm add ai-sparkwrite-editor @tiptap/vue-3 @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text lucide-vue-next
```

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Bold, Heading, Table } from 'ai-sparkwrite-editor/core';
import {
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  RichTextBubbleText,
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextHeading,
  RichTextBold,
  RichTextTable,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Heading,
    Table,
    AI.configure({ protocol: 'openai', model: 'gpt-4o-mini', baseURL: '/api/ai' }),
    AIAutocomplete,
  ],
  content: '<p>你好</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextAI />
      <RichTextToolbarDivider />
      <RichTextHeading /><RichTextBold /><RichTextTable />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
    <RichTextBubbleText />
  </RichTextProvider>
</template>
```

扩展来自不含框架的 `ai-sparkwrite-editor/core`，Vue UI 来自 `ai-sparkwrite-editor/vue`，与 React 控件共用同一份样式。

## 文档

全部在文档站：**[ludejun.github.io/ai-sparkwrite-editor](https://ludejun.github.io/ai-sparkwrite-editor/)**——[快速开始](https://ludejun.github.io/ai-sparkwrite-editor/guide/getting-started)、[AI](https://ludejun.github.io/ai-sparkwrite-editor/extensions/AI/)、[全部功能与导入路径](https://ludejun.github.io/ai-sparkwrite-editor/guide/features)、[多框架](https://ludejun.github.io/ai-sparkwrite-editor/guide/frameworks)、[自定义](https://ludejun.github.io/ai-sparkwrite-editor/guide/customization)、[体积](https://ludejun.github.io/ai-sparkwrite-editor/guide/bundle-size)。先去 **[在线 Playground](https://ludejun.github.io/ai-sparkwrite-editor/playground/)** 试：内置演示模型，不配密钥也能走完所有 AI 流程。

## 开发

```bash
pnpm install
pnpm build:lib      # playground 引用构建产物 lib/
pnpm playground     # http://localhost:8000，顶部可切换 React ⇄ Vue
pnpm type-check && pnpm lint
pnpm docs:dev
```

提交规范与如何引入上游修复见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 来源

代码源自 hunghg255 及贡献者的 [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor)，此后经过大幅重构。感谢他们以及 [Tiptap](https://tiptap.dev) 与 [shadcn/ui](https://ui.shadcn.com/)。MIT 许可。
