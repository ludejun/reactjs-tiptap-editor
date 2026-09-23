# 框架支持

这个编辑器底层是 Tiptap，而 Tiptap 是框架无关的：同一套扩展可以通过各自的绑定运行在 React、Vue、Svelte 或纯页面中。此处 React 专属的部分是**UI**——工具栏控件、气泡菜单、对话框，以及让分割线或代码块这类块在文档中具备交互能力的节点视图。

因此这个包被拆分为两层：

| 层级  | 引入                                                                                      | 依赖 React | 内容                                                                                                                                                                                                                                                                                                                                          |
| ----- | ----------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 核心  | `ai-sparkwrite-editor/core`                                                               | 否         | 除节点视图外的每个扩展（标记、标题、列表、表格、链接、对齐、缩进、字体、颜色、分割线、代码块、标注框、可折叠块、视频、iframe、图片与 GIF、Katex、Mermaid、附件、目录……；分栏、Excalidraw、手绘、Twitter 以及建议弹层——提及、短消息、emoji、斜杠命令——仍留在 React 层）、粘贴规则、搜索替换、录制器、AI 传输层与 markdown 渲染、图片管理、翻译 |
| React | `ai-sparkwrite-editor`、`ai-sparkwrite-editor/<feature>`、`ai-sparkwrite-editor/bubble/*` | 是         | 以上全部内容，再加上控件、气泡菜单、对话框和节点视图                                                                                                                                                                                                                                                                                          |

一项构建检查（`tests/core-headless.test.mjs`）会遍历核心构建包的依赖图，只要有任何可达模块引入了 `react`、`@tiptap/react`、Radix 或 lucide，检查就会失败。

## Vue

两次引入：`ai-sparkwrite-editor/core` 提供扩展，`ai-sparkwrite-editor/vue` 提供 UI。Vue 层提供 provider、组合式函数、工具栏原语、核心扩展的现成控件，以及各个块的 Vue 节点视图（分割线、代码块、标注框、图片、GIF、iframe、Katex、Mermaid、附件、目录）。它只依赖 `vue`、`@tiptap/vue-3` 和 `lucide-vue-next`，并与 React 控件共享同一份样式表，因此两边的工具栏外观一致。

```bash
pnpm add ai-sparkwrite-editor @tiptap/vue-3 @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text lucide-vue-next
```

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold,
  Heading,
  BulletList,
  ListItem,
  Table,
  TextAlign,
  RichPaste,
  localeActions,
} from 'ai-sparkwrite-editor/core';
import {
  Divider, // core divider + Vue node view
  CodeBlock, // core code block + Vue node view; same for Image, Callout, Katex…
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextHeading,
  RichTextBold,
  RichTextBulletList,
  RichTextTable,
  RichTextTextAlign,
  RichTextDivider,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

import zhCN from 'ai-sparkwrite-editor/locales/zh-cn';

localeActions.setMessage('zh_CN', zhCN); // only English is bundled
localeActions.setLang('zh_CN');

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Heading,
    BulletList,
    ListItem,
    Table,
    TextAlign,
    Divider,
    CodeBlock,
    RichPaste,
  ],
  content: '<p>你好</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextHeading />
      <RichTextToolbarDivider />
      <RichTextBold /><RichTextBulletList /><RichTextTextAlign />
      <RichTextToolbarDivider />
      <RichTextTable /><RichTextDivider />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

`RichTextProvider` 渲染带有 `ai-sparkwrite-editor` 类名的根元素，并把编辑器交给它下面的每个控件。仓库中 `examples/vue` 下的示例就是本页的内容，带上了所有控件（`pnpm --dir examples/vue dev`）。

### Vue 层包含什么

| 类别                  | 导出内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider 与组合式函数 | `RichTextProvider`、`useEditorInstance()`、`useEditorState(selector, fallback)`、`useLocale()`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 工具栏原语            | `RichTextToolbar`、`RichTextToolbarDivider`、`RichTextToolbarButton`、`RichTextDropdown`、`RichTextToolbarMore`、`RichTextToolbarMoreGroup`、`RichTextToolbarMoreRow`                                                                                                                                                                                                                                                                                                                                                                              |
| 控件                  | 撤销/重做、加粗、斜体、下划线、删除线、代码、清除格式、标题、无序/有序/任务列表、引用、文本对齐、链接（弹层）、表格、分割线、颜色、高亮、字号、行高、缩进/减少缩进、代码块、标注框、可折叠块、目录、图片（上传或 URL）、视频、附件、iframe、Katex 与 Mermaid（带实时预览与一键 AI 生成的对话框）——与 React 控件同名                                                                                                                                                                                                                                |
| 节点视图              | `Divider`（样式选择器、可编辑说明文字）、`CodeBlock`（语言选择器、复制、删除）、`Callout`、`Image` + `ImageBlock`（缩放手柄、图注、翻转与旋转）、`ImageGif`、`Iframe`（URL 输入、缩放、编辑链接）、`Katex`（通过扩展的 `loadKatex` 或 `import('katex')` 渲染）、`Mermaid`、`Attachment`（文件选择器、上传状态、文件卡片）、`TableOfContents` + `TableOfContentsNode`（实时标题列表）。每一个都是 `<Name>Core.extend({ addNodeView })`，DOM 和 CSS 与 React 版本相同；组件以 `<Name>NodeView` 导出，`useImageResize` 是共享的角部拖拽手柄组合式函数 |

你自己的控件是一个带 `onClick`（用于执行命令）的 `RichTextToolbarButton`，或一个带条目的 `RichTextDropdown`；`useEditorState` 为它提供响应式的 `isActive`/`can()` 状态。

### Vue 中尚未支持

Excalidraw 与手绘（它们封装了仅限 React 的库）、Twitter 嵌入（`react-tweet`）、分栏、搜索替换面板，以及建议弹层——emoji、提及、短消息和 `/` 斜杠菜单——仍然通过 React 渲染。它们的扩展本身在任何地方都是框架无关的，只是这些交互表现在 Vue 中还缺失。Details 和 Video 在两层中都没有节点视图：它们通过 `renderHTML` 渲染，存在于 `ai-sparkwrite-editor/core` 中。

## 纯 JavaScript

```ts
import { Editor } from '@tiptap/core';
import { Bold, Heading, Table, RichPaste } from 'ai-sparkwrite-editor/core';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [/* Document, Paragraph, Text, */ Bold, Heading, Table, RichPaste],
});
```

## 目前仍只有 React 支持的部分

- 封装了 React 库的节点视图：Excalidraw、手绘、Twitter。
- 建议弹层（emoji、提及、短消息、斜杠菜单）、分栏，以及搜索替换面板。

它们各自只是核心已经暴露的某个命令或属性之上的一层薄封装，所以移植到 Vue 属于 UI 工作，而非编辑器本身的工作；斜杠菜单是最值得优先做的一个。

## 添加框架无关的扩展

保持扩展模块（`src/extensions/<Name>/<Name>.ts`）不引入任何组件，只在该文件夹的 `index.ts` 中重新导出组件；构建时 React 入口由 `index.ts` 生成，核心入口由扩展模块生成，这样两者永远不会共享带 React 的代码块。然后从 `src/core.ts` 导出它，并运行无头（headless）检查。

带节点视图的扩展会拆成三份：`<Name>.ts` 导出不含节点视图的 `<Name>Core`；`<Name>React.ts` 导出 `<Name>` = `<Name>Core.extend({ addNodeView: ReactNodeViewRenderer(...) })`，供 `index.ts` 重新导出；`src/vue/nodeviews/<Name>.ts` 导出 `<Name>` = `<Name>Core.extend({ addNodeView: VueNodeViewRenderer(...) })`。两个节点视图都需要的辅助函数（图注检测、语言列表、文件图标、标题列表）放在扩展旁边的框架无关文件中，绝不放进 `.tsx` 文件。

## Vue 中的 AI、气泡菜单与对话框

以下内容全部来自 `ai-sparkwrite-editor/vue`，并与 React 层共享样式表、类名和提示词。

**AI。** 注册 `AI`（通过 `VueRenderer` 挂载 Vue 面板的核心扩展），以及可选的 `AIAutocomplete`（灰色续写建议）。它的选项是核心 `AIOptions` 加上用于自行绘制答案的 `renderResult(context)`，以及用于替换整个对话框的 `components.Panel`。然后放置组件：

- `RichTextAI` — 工具栏按钮（Sparkles 图标 + "AI"，写作台打开时 `aria-pressed`）；切换写作台，`Mod-J` 效果相同。
- `RichTextAIComposer` — `EditorContent` 下方的写作台：来自 `AI_COMPOSER_ACTIONS` 的快捷操作、带目标选择（选区、光标处、开头、结尾、整篇文档）的提示词输入框，通过 `writeWithAI` 直接流式写入文档，然后是保留 / 撤销 / 重试，以及带对话历史的继续打磨。属性：`actions`、`defaultOpen`。
- `RichTextAIImprove` — 文本气泡菜单中的选区菜单：编辑（改进、语法、缩短、加长、简化）、更改语气、生成（总结、解释、表格、列表）、翻译为浏览器语言（或配置的 `translateLanguages`）、随便问点什么、打开写作台。每个条目都会在打开菜单时捕获的选区上打开 AI 面板。
- `AIPanel` — 面板组件本身，用于自定义 `mountPanel`。

框架无关的部分也一并重新导出，因此一次引入即可覆盖整个 Vue 应用：`AICore`、`AIAutocomplete`、`aiPluginKey`、`aiAutocompleteKey`、`writeWithAI`、`aiOptionsOf`、`resolveWriteTarget`、`documentContext`、`generateAIText`、`AI_COMPOSER_ACTIONS`、`composerPrompt`、`browserLanguage`、`markdownToHTML`、`markdownToFragment`、`markdownToSlice`、`markdownToPreviewHTML`、`DEFAULT_AI_SYSTEM_PROMPT`，以及 `AI*` 类型。

```vue
<script setup lang="ts">
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/vue';

const editor = useEditor({
  extensions: [, /* … */ AI.configure({ endpoint: '/api/ai' }), AIAutocomplete],
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar><!-- … --><RichTextAI /></RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
  </RichTextProvider>
</template>
```

**气泡菜单。** 基于 `@tiptap/vue-3/menus` 中的 `BubbleMenu` 构建；可以放在 `RichTextProvider` 内的任意位置。

- `RichTextBubbleText` — 出现在文本选区上方（代码块中不出现，AI 面板打开时隐藏）：`RichTextAIImprove`、段落/标题下拉菜单、加粗、斜体、下划线、删除线、代码、链接、颜色、高亮、对齐。在默认插槽中放入你自己的按钮即可替换它们。
- `RichTextBubbleTable` — 在表格内右键会打开一个上下文菜单：插入/删除行和列、合并/拆分单元格、"表格后插入段落"（附带其快捷键）、删除表格。`hiddenActions` 可以隐藏某些条目。
- `RichTextBubbleLink` — 光标位于链接中时出现：地址、打开、编辑（文字、地址、新标签页打开）、取消链接。
- `RichTextBubbleImage` — 图片被选中时出现：左/中/右对齐、S/M/L 尺寸、移除。

`BUBBLE_CLASS`、`BUBBLE_OPTIONS` 和 `useBubbleEditor()` 均已导出，供你构建自己的气泡菜单。

**对话框与控件。** `RichTextLink` 打开一个弹层（文字、地址、新标签页打开；位于链接中时可取消链接），`RichTextLinkForm` 是这个表单本身。`RichTextImage` 和 `RichTextVideo` 打开一个带拖放区域的对话框（会遵循扩展的 `upload`、`acceptMimes`、`maxSize`、`multiple`、`onError`；上传记录会被保留供 `getImageChanges` 使用）以及一个地址输入框；`RichTextKatex` 和 `RichTextMermaid` 打开一个带源码、实时预览的对话框——当注册了 AI 扩展时，还会有一行"描述它"的提示词输入（`RichTextAIGenerateField`）。`RichTextIframe` 和 `RichTextCallout` 是弹层；`RichTextAttachment` 选择文件并通过扩展的 `upload` 上传；`RichTextCodeBlock`、`RichTextDetails`、`RichTextTableOfContents`、`RichTextIndent` 和 `RichTextOutdent` 直接执行各自的命令；`RichTextColor` 和 `RichTextHighlight` 打开一个调色板（使用扩展的 `colors`，否则用默认列表，外加一个原生取色器）；`RichTextFontSize` 和 `RichTextLineHeight` 是基于配置列表的下拉菜单。

它们背后的基础组件也已导出：`RichTextPopover`（带面板的工具栏按钮；插槽接收 `{ close }`）、`RichTextDialog`（`open` / `update:open`、`title`、`footer` 插槽）以及用于处理外部点击和 Escape 的 `useDismiss(open, root, close)`。搜索替换目前还没有 Vue 控件。
