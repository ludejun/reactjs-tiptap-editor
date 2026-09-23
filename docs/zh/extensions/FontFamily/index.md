---
description: 字体

next:
  text: FontSize
  link: /zh/extensions/FontSize/index.md
---

# Font Family

为选中的文本选择字体。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。安装与你的其他 Tiptap 包版本一致的 `@tiptap/extension-text-style`。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { FontFamily, RichTextFontFamily } from 'ai-sparkwrite-editor/fontfamily';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontFamily];

export default function FontFamilyExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextFontFamily />
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
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontFamily];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
尚未加入 Vue 层：`RichTextFontFamily`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

注册 `TextStyle`。`fontFamilyList` 控制下拉菜单中的选项，但不会下载字体。请在你应用的 CSS 中加载网络字体，或选择读者设备上已有的字体。

一个普通字符串会同时用作标签和 CSS 值。`{ name, value }` 这种形式则将两者分开，这正是跨平台方案所需要的：菜单文字可以保持易读，同时每个平台在 `value` 中使用各自的字体。

## 非拉丁文字

Arial、Georgia、Times 等其他拉丁文默认字体都不带汉字、天城文或孟加拉文的字形，因此将它们应用到中文或印地文文本上不会产生任何可见变化——浏览器会自行替换为默认字体。因此默认列表的末尾追加了 `SCRIPT_FONT_FAMILY_LIST` 中的条目：

| 文字     | 条目                             |
| -------- | -------------------------------- |
| 中文     | 微软雅黑, 苹方, 黑体, 宋体, 楷体 |
| 日文     | ゴシック体, 明朝体               |
| 韩文     | 맑은 고딕                        |
| 天城文   | देवनागरी                         |
| 孟加拉文 | বাংলা                            |

每个条目都以读者熟悉的字体名命名，并解析为一个字体栈，因此选择会落在该字体存在的地方，在其他地方则落在最接近的等价字体上——微软雅黑在 Windows 上对应 Microsoft YaHei，在 macOS 上对应 PingFang SC，这是每个文字处理软件一直以来的替换方式。

它们都被设计为系统字体：即便经过子集化，一款覆盖汉字的网络字体也会有数兆大小。如果仍想提供网络字体，请在你的 CSS 中加载它并自行添加到 `fontFamilyList` 中。

### 何时出现

如果始终列出所有文字的条目，对不会用到它们的读者来说反而会淹没拉丁文字体。选择器只在**以下任一条件成立**时显示某种文字的条目：界面语言使用该文字，或者文档中已经包含该文字——文档会在菜单打开时被采样，因此把中文粘贴进英文界面的编辑器会立即让中文字体重新出现。通过 `fontFamilyList` 自行添加的条目永远不会被过滤。

编辑器自身的正文文字不受此列表影响——它继承自所嵌入页面的字体。`system-ui` 在每个平台上都已经能回退到合理的 CJK 字体，因此只有明确选择字体时才需要用到这些条目。

## 配置

```ts
import { FontFamily } from 'ai-sparkwrite-editor/fontfamily';

FontFamily.configure({
  fontFamilyList: ['Arial', 'Georgia', { name: 'Monospace', value: 'monospace' }],
});
```

在 `extensions` 中使用这个已配置的扩展，替代未配置的版本。
