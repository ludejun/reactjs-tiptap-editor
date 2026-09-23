---
description: Katex

next:
  text: LineHeight
  link: /zh/extensions/LineHeight/index.md
---

# Katex

插入以 TeX 语法编写的数学公式。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的依赖包入手。下面的完整示例注册了该功能并渲染其界面——请选择 React 或 Vue 标签页。如果是在已有的编辑器中使用，把这些导入和扩展项合并进你自己的配置，并把控件放进你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Katex, RichTextKatex } from 'ai-sparkwrite-editor/katex';
import { RichTextBubbleKatex } from 'ai-sparkwrite-editor/bubble/katex';
import 'ai-sparkwrite-editor/style.css';
import 'katex/dist/katex.min.css';

const extensions = [Document, Paragraph, Text, Katex];

export default function KatexExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextKatex />
      <RichTextBubbleKatex />
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
import { Katex, RichTextProvider, RichTextKatex } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';
import 'katex/dist/katex.min.css';

const extensions = [Document, Paragraph, Text, Katex];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextKatex />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Vue 层暂未提供：`RichTextBubbleKatex`——请在你自己的控件中调用对应命令，或参见[框架集成](/zh/guide/frameworks)。
:::

## 使用方式

与编辑器样式表一起加载 `katex/dist/katex.min.css`。打开工具栏对话框，输入类似 `E = mc^2` 的表达式并应用。挂载 `RichTextBubbleKatex` 以获得上下文操作。如果你的包管理器无法解析该 CSS 导入，请在你的应用中直接安装 `katex`。

## 渲染器加载与化学公式

渲染器会在公式节点视图挂载或公式对话框打开时加载。在其就绪之前，预览会以文本形式显示表达式。因此，已有的公式可能会在编辑器首次渲染时触发加载。加载失败会提供重试按钮；无效的公式则保持为文本。渲染发生在客户端，因此服务端输出不包含渲染后的公式 HTML。

使用可选的 `loadKatex` 配置项，在渲染前初始化插件。对于 `\ce{H2O}` 等化学命令，请直接安装 `katex`，并在扩展数组中将 `Katex` 替换为：

```ts
import { Katex } from 'ai-sparkwrite-editor/katex';
import 'katex/dist/katex.min.css';

Katex.configure({
  loadKatex: async () => {
    const [{ default: katex }] = await Promise.all([
      import('katex'),
      import('katex/contrib/mhchem'),
    ]);
    return katex;
  },
});
```

如果 TypeScript 找不到 mhchem 的类型定义，请在某个 ambient `.d.ts` 文件中添加以下声明：

```ts
declare module 'katex/contrib/mhchem';
```

加载器必须解析为 KaTeX 渲染器本身，而不是模块命名空间。使用同一加载函数的节点视图与对话框会共享其 promise；加载失败可以重试。请保持加载函数的引用稳定。CSS 仍需保留为显式的静态导入。如果希望渲染器保持在异步分包中，请避免在其他地方对 KaTeX 或 mhchem 进行静态 JavaScript 导入。
