<p align="center">
  <img src="./docs/public/logo.svg" alt="SparkWrite" width="96" />
</p>

<h1 align="center">SparkWrite</h1>

<p align="center">
  <b>会和你一起写的富文本编辑器。</b><br/>
  AI 优先的编辑器 SDK，基于 Tiptap：流式回答直接变成真正的标题、表格和代码块；一句话生成公式和图表。<br/>
  工具栏、气泡菜单、斜杠命令、16 种语言、会话回放。React UI，框架无关的内核。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-sparkwrite-editor"><img src="https://img.shields.io/npm/v/ai-sparkwrite-editor.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="./README.md">English</a>
</p>

![截图](./screenshot/screenshot.png)

## 为什么选它

**AI 是一等功能，不是外挂插件。**

- **直接流进文档。** 选中文字或输入 `/ai`，回答一边流式到达一边按编辑器自己的 schema 渲染：Markdown 表格就是编辑器的表格，围栏代码就是真正的代码块，`- [ ]` 就是任务列表。应用时插入的是节点，不是粘贴的文本。
- **生成你打不出来的东西。** Katex 和 Mermaid 对话框接受一句描述（「一元二次方程求根公式」「登录流程」），实时写出源码。
- **模型你定。** OpenAI 或 Anthropic 协议、任意 baseURL / 代理，或自己的 `generate(request, onChunk)` 传输层。翻译到浏览器语言、追问细化、附带图片和文件。
- **渲染也归你。** `renderResult` 改答案样式，`components.Panel` 整个面板换掉。

**以及文档需要的一切**

- **可组合。** 自己创建 Tiptap 实例、挑扩展、把 React 控件放到想放的位置，每个功能一个导入。
- **齐全。** 50+ 扩展：标题、列表、带圆角和「点击外侧退出」的表格、带语言识别的代码块、支持裁剪/题注/上传追踪的图片、带可编辑文字和编号的分割线、分栏、提示块、折叠块、Katex、Mermaid、Excalidraw、视频、iframe、附件、表情、提及、目录、查找替换、Word/PDF/Markdown 导入导出。
- **粘贴正确。** 网页、Excel、Google Docs、Word 保留格式；Word 假列表变真列表，VS Code 代码变代码块。
- **16 种语言**，按使用人数排序，按需加载，配套 CJK、天城文、孟加拉文字体。
- **录制与回放**任意一次书写过程。
- **React 和 Vue。** 文档逻辑以不含 React 的 `ai-sparkwrite-editor/core` 发布；`ai-sparkwrite-editor/vue` 提供 Vue 3 的 Provider、工具栏、控件和节点视图，共用同一套样式。见 [多框架](./docs/guide/frameworks.md)。
- **融入你的设计体系。** 带前缀的 Tailwind 类名和几个 CSS 变量。

## 安装

```bash
pnpm add ai-sparkwrite-editor @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

所有 `@tiptap/*` 包请保持同一版本（本仓库使用 `^3.29`）。

## 快速开始

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { Heading, RichTextHeading } from 'ai-sparkwrite-editor/heading';
import { Table, RichTextTable } from 'ai-sparkwrite-editor/table';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

export function Editor() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold, Heading, Table],
    content: '<p>你好</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextHeading />
        <RichTextToolbarDivider />
        <RichTextBold />
        <RichTextTable />
      </RichTextToolbar>
      <RichTextBubbleText />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

每个功能只需一个导入：扩展和它的控件来自同一个子路径（`ai-sparkwrite-editor/<feature>`），气泡菜单来自 `ai-sparkwrite-editor/bubble/<name>`，语言包来自 `ai-sparkwrite-editor/locales/<code>`。

## 文档

`docs/` 是一个 VitePress 站点（`pnpm docs:dev`）。建议从这里开始：

- [快速开始](./docs/guide/getting-started.md) —— 安装、最小编辑器、组合界面
- [功能总览](./docs/guide/features.md) —— 每个扩展、导入路径和主要选项
- [工具栏](./docs/guide/toolbar.md) 与 [自定义](./docs/guide/customization.md) —— 自定义菜单、自定义节点、保存、回放
- [气泡菜单](./docs/guide/bubble-menu.md) · [国际化](./docs/guide/internationalization.md)
- [AI](./docs/extensions/AI/index.md) —— 模型接入、流式输出、Markdown 渲染、自定义面板

## Playground

```bash
pnpm install
pnpm build:lib
pnpm playground
```

Playground 引用的是构建产物 `lib/`，改了 `src/` 后需要重新 build。没有配置 API key 时，AI 菜单会用演示回答，方便体验完整流程。

## 开发

```bash
pnpm type-check   # 库类型检查
pnpm lint         # oxlint
pnpm build:lib    # 构建库
pnpm docs:build   # 构建文档站
pnpm exec esno --test tests/ai-client.test.ts tests/locale-loading.test.ts tests/word-export.test.ts
```

提交规范和如何同步原项目的修复见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 来源

SparkWrite 起源于 hunghg255 及贡献者们的 [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor)，此后经过了大幅重构。感谢他们，也感谢 [Tiptap](https://tiptap.dev) 与 [shadcn/ui](https://ui.shadcn.com/)。

## 许可

[MIT](./LICENSE)
