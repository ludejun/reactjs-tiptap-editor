---
description: 气泡菜单

next:
  text: 国际化
  link: /zh/guide/internationalization.md
---

# 气泡菜单

气泡菜单在选中文本或选中某个节点附近提供操作入口。它们是独立的组件——React 版本如下，Vue 版本则使用来自 `ai-sparkwrite-editor/vue` 的同名组件：先注册对应的扩展，再把菜单挂载到与文档相同的那个 `RichTextProvider` 内部。

引入某个菜单并不会挂载它，挂载某个菜单也不会注册它的扩展。

## 添加文本选区菜单

本示例使用 [快速开始](/zh/guide/getting-started) 中的那些包。在编辑器中选中一个词即可显示菜单：

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Bold,
  RichTextBold,
  Italic,
  RichTextItalic,
  RichTextBubbleText,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold, Italic];

export default function BubbleMenuExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Select a few words to format them.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBubbleText
        buttonBubble={
          <>
            <RichTextBold />
            <RichTextItalic />
          </>
        }
      />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

`buttonBubble` 会用你自己的 React 内容替换默认的文本控件。每个控件仍然需要注册它对应的扩展。省略该属性即可使用库自带的默认文本菜单；届时请注册你打算提供的格式化和分块功能。

常规工具栏和气泡菜单可以共存，二者作用于同一个编辑器实例。

## 添加节点菜单

以图片为例，在现有扩展数组中注册 `Image`，并在 provider 下挂载 `RichTextBubbleImage`。选中一张已插入的图片即可显示其控件。其他受支持的节点也遵循同样的模式：

| 菜单组件                   | 所需功能                                 | 用途                       |
| -------------------------- | ---------------------------------------- | -------------------------- |
| `RichTextBubbleText`       | Text 以及其控件所用到的格式化扩展        | 格式化选中的文本。         |
| `RichTextBubbleLink`       | [Link](/zh/extensions/Link/)             | 编辑一个悬停中的链接。     |
| `RichTextBubbleImage`      | [Image](/zh/extensions/Image/)           | 编辑一张选中的图片。       |
| `RichTextBubbleVideo`      | [Video](/zh/extensions/Video/)           | 编辑一段选中的视频。       |
| `RichTextBubbleTable`      | [Table](/zh/extensions/Table/)           | 表格操作，右键触发。       |
| `RichTextBubbleIframe`     | [Iframe](/zh/extensions/Iframe/)         | 编辑一个内嵌 frame。       |
| `RichTextBubbleImageGif`   | [ImageGif](/zh/extensions/ImageGif/)     | 编辑一个选中的 GIF。       |
| `RichTextBubbleDrawer`     | [Drawer](/zh/extensions/Drawer/)         | 编辑一个绘图节点。         |
| `RichTextBubbleExcalidraw` | [Excalidraw](/zh/extensions/Excalidraw/) | 编辑一个 Excalidraw 节点。 |
| `RichTextBubbleMermaid`    | [Mermaid](/zh/extensions/Mermaid/)       | 编辑一个图表节点。         |
| `RichTextBubbleTwitter`    | [Twitter](/zh/extensions/Twitter/)       | 管理一个推文嵌入。         |
| `RichTextBubbleCallout`    | [Callout](/zh/extensions/Callout/)       | 编辑一个标注框。           |
| `RichTextBubbleKatex`      | [Katex](/zh/extensions/Katex/)           | 编辑一个数学表达式。       |

本表中所有菜单组件都从 `ai-sparkwrite-editor/bubble` 导出。每个编辑器实例只需挂载一次每个菜单，且只挂载你的编辑器实际需要的菜单。

`RichTextBubbleTable` 是个例外：虽然名字里带“bubble”，但它挂载的其实是一个上下文菜单而非气泡菜单，因此表格操作会出现在你在表格内部右键点击的位置，而不是在光标位于单元格内、鼠标悬停在文档上时出现。

有两类块特意没有气泡菜单：

- **代码块** 会在块的右上角渲染自己的工具栏（语言、复制、删除），悬停时显示。它随 `CodeBlock` 扩展一起提供，不需要额外挂载任何东西。
- **分栏** 通过 `RichTextBubbleMenuDragHandle` 暴露其操作，位于分栏内任意块的块菜单之下。挂载拖动手柄即可获得这些操作。

## 单独引入

使用下面这些公开的子路径，可以让功能依赖更加明确。现有的 `/bubble` 入口仍然受支持。只引入你要挂载的组件。

| 组件                           | `ai-sparkwrite-editor` 之后的子路径 |
| ------------------------------ | ----------------------------------- |
| `RichTextBubbleText`           | `/bubble/text`                      |
| `RichTextBubbleMenuDragHandle` | `/bubble/drag-handle`               |
| `RichTextAIImprove`            | `/bubble/ai`                        |
| `RichTextBubbleCallout`        | `/bubble/callout`                   |
| `RichTextBubbleDrawer`         | `/bubble/drawer`                    |
| `RichTextBubbleExcalidraw`     | `/bubble/excalidraw`                |
| `RichTextBubbleIframe`         | `/bubble/iframe`                    |
| `RichTextBubbleKatex`          | `/bubble/katex`                     |
| `RichTextBubbleLink`           | `/bubble/link`                      |
| `RichTextBubbleMermaid`        | `/bubble/mermaid`                   |
| `RichTextBubbleTable`          | `/bubble/table`                     |
| `RichTextBubbleTwitter`        | `/bubble/twitter`                   |
| `RichTextBubbleImage`          | `/bubble/media`                     |
| `RichTextBubbleVideo`          | `/bubble/media`                     |
| `RichTextBubbleImageGif`       | `/bubble/media`                     |

`/bubble/media` 会把 Image、Video 和 ImageGif 菜单一起导出。`RichTextAIImprove` 是一个 AI 控件；参见 [AI](/zh/extensions/AI/)。文本气泡菜单不需要 KaTeX 或 Yjs。即使编辑器本身没有协作功能，拖动手柄仍然会通过 Tiptap 引入与协作相关的依赖。

## 块拖动手柄

`RichTextBubbleMenuDragHandle` 提供了一个用于移动文档块的手柄和一个块操作菜单。它不会移动气泡菜单本身。

```tsx
import { RichTextBubbleMenuDragHandle } from 'ai-sparkwrite-editor';

// Mount inside your existing RichTextProvider.
<RichTextBubbleMenuDragHandle />;
```

## 斜杠命令

`SlashCommandList` 提供斜杠命令列表，它不是一个文本选区气泡菜单。请在 provider 内部挂载它，并注册 `SlashCommand` 来启用 `/` 命令。参见 [Slash Command](/zh/extensions/SlashCommand/)。

## 排查问题

如果某个菜单没有出现，请确认编辑器处于可编辑状态、其对应的扩展已经注册，并且已选中相应的内容。折叠的文本光标不会显示文本选区菜单。如果菜单出现在其他元素的后面，请检查你所在宿主布局中的裁剪或层叠样式。
