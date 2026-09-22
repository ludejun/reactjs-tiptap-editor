<p align="center">
  <img src="https://api.iconify.design/ic:round-wysiwyg.svg?color=%237c3aed" alt="RichKit" width="88" />
</p>

<h1 align="center">RichKit</h1>

<p align="center">
  基于 Tiptap 的 React 富文本编辑器 SDK，按需组合。<br/>
  工具栏、气泡菜单、斜杠命令、AI、表格、代码、图片、16 种语言、会话回放。
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/richkit"><img src="https://img.shields.io/npm/v/richkit.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="./README.md">English</a>
</p>

![截图](./screenshot/screenshot.png)

## 为什么选 RichKit

- **可组合。** 你自己创建 Tiptap 编辑器实例、挑选扩展、把 React 控件放到想放的位置，没有黑盒式的大组件。
- **功能齐全。** 50+ 扩展：标题、列表、带圆角和「点击表格外侧退出」的表格、带语言识别的代码块、支持裁剪/题注/上传追踪的图片、带可编辑文字和编号的分割线、分栏、提示块、折叠块、Katex、Mermaid、Excalidraw、视频、iframe、附件、表情、提及、目录、查找替换，以及 Word / PDF / Markdown 的导入导出。
- **内置 AI。** 流式输出，答案经编辑器 schema 渲染——表格、代码块、列表都是真正的节点；Katex 和 Mermaid 对话框支持「描述一下，AI 来写」。模型、代理、传输层都可以自定义。
- **粘贴正确。** 网页、Excel、Google Docs、Word 保留格式；Word 的假列表变成真列表，VS Code 复制的代码变成代码块。
- **16 种语言**，按使用人数排序，可按需加载。中文、日文、韩文、天城文、孟加拉文字体栈在界面语言或文档需要时出现。
- **录制与回放**：把一次书写过程保存为带时间戳的步骤并回放。
- **样式可控。** Tailwind 类名带 `richtext-` 前缀，主题只是一组 CSS 变量，可以放进任何设计体系。

## 安装

```bash
pnpm add richkit @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

所有 `@tiptap/*` 包请保持同一版本（本仓库使用 `^3.29`）。

## 快速开始

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'richkit';
import { Bold, RichTextBold } from 'richkit/bold';
import { Heading, RichTextHeading } from 'richkit/heading';
import { Table, RichTextTable } from 'richkit/table';
import { RichTextBubbleText } from 'richkit/bubble/text';
import 'richkit/style.css';

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

每个功能只需一个导入：扩展和它的控件来自同一个子路径（`richkit/<feature>`），气泡菜单来自 `richkit/bubble/<name>`，语言包来自 `richkit/locales/<code>`。

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

RichKit 起源于 hunghg255 及贡献者们的 [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor)，此后经过了大幅重构。感谢他们，也感谢 [Tiptap](https://tiptap.dev) 与 [shadcn/ui](https://ui.shadcn.com/)。

## 许可

[MIT](./LICENSE)
