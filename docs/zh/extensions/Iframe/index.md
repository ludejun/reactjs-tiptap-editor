---
description: 嵌入

next:
  text: Image
  link: /zh/extensions/Image/index.md
---

# Embed 嵌入

即 `Iframe` 扩展（`ai-sparkwrite-editor/iframe`），这里按工具栏上的名字“嵌入”列出。嵌入 YouTube 视频、Figma 文件、Google 表格、地图、CodePen——从分享链接识别 35 个服务——或任意网页。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。下面的完整示例注册该功能并渲染其界面，选择 React 或 Vue 标签页。在已有的编辑器中，将其中的 import 和扩展项合并进你的配置，并将控件放入你已有的 `RichTextProvider` 中。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Iframe,
  RichTextIframe,
  RichTextBubbleIframe,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

export default function IframeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIframe />
      <RichTextBubbleIframe />
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
import { Iframe, RichTextProvider, RichTextIframe } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIframe />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
尚未加入 Vue 层：`RichTextBubbleIframe`——请用你自己的控件调用对应的命令，或参阅 [框架集成](/zh/guide/frameworks)。
:::

## 使用方式

点工具栏的 **嵌入**（或输入 `/embed`、`/youtube`、`/figma`……），粘贴一个 **分享链接**——就是从地址栏复制的那种——或者服务“嵌入”对话框里的整段 `<iframe>` 代码。编辑器会识别出是哪个服务，把链接转换成可嵌入地址，按服务设定合适的高度（视频 16:9、表单更高），并提示识别到的服务名。挂载 `RichTextBubbleIframe` 可获得上下文控件（缩放、打开、删除）。

| 服务                                                                                | 类别       | 效果                                                                           |
| ----------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| YouTube、Vimeo、B 站、优酷、腾讯视频、Loom、Descript                                | 视频       | 16:9 播放器                                                                    |
| Spotify、SoundCloud                                                                 | 音频       | 紧凑播放器                                                                     |
| Google 地图、高德地图、百度地图                                                     | 地图       | 地点或搜索链接直接变成内嵌地图；Google 短链请用 _分享 → 嵌入地图_ 复制代码粘贴 |
| Figma、Canva、Miro、Whimsical、Excalidraw、dbdiagram、ProcessOn、墨刀、蓝湖、Framer | 设计与白板 | 可平移的实时文件                                                               |
| CodePen、CodeSandbox、StackBlitz、JSFiddle、GitHub Gist                             | 代码       | 结果或代码视图                                                                 |
| Google 文档、Google 表格、Google 幻灯片、Airtable、Trello、ClickUp                  | 文档与数据 | 只读预览                                                                       |
| Google 表单、Typeform、金数据                                                       | 表单       | 表单本身                                                                       |
| 其他任意 `https://` 页面                                                            | 网页       | 原样展示；能否被嵌入由对方站点决定                                             |

有些站点拒绝被嵌入（Notion 页面、多数需要登录的页面），此时框内会是空白——这是对方站点的限制，不是编辑器的问题。请确保你应用的内容安全策略（CSP）允许这些来源。

## 代码调用

```ts
import { resolveEmbed, EMBED_SERVICES } from 'ai-sparkwrite-editor';

const embed = resolveEmbed('https://youtu.be/I4sMhHbHYXM');
// { service: { key: 'youtube', name: 'YouTube', … }, src: 'https://www.youtube.com/embed/I4sMhHbHYXM', height: 338, url }

editor
  .chain()
  .focus()
  .setIframe({ src: embed.src, service: embed.service.key, height: embed.height })
  .run();
```

`EMBED_SERVICES` 是全部已识别服务的列表（key、名称、类别、链接规则、示例、提示）；`resolveEmbed()` 对非链接返回 `null`。保存的 HTML 会在 `<iframe>` 上带 `data-service`，只读页面可以按服务加样式或标签。
