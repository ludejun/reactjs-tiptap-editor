---
description: Image

next:
  text: ImageGif
  link: /zh/extensions/ImageGif/index.md
---

# Image

从 URL 或应用自带的上传服务插入图片。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Image, RichTextImage } from 'ai-sparkwrite-editor/image';
import { RichTextBubbleImage } from 'ai-sparkwrite-editor/bubble/media';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Image.configure({ resourceImage: 'link' })];

export default function ImageExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextImage />
      <RichTextBubbleImage />
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
import {
  Image,
  RichTextProvider,
  RichTextImage,
  RichTextBubbleImage,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Image.configure({ resourceImage: 'link' })];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextImage />
    <RichTextBubbleImage />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 使用方式

示例默认以仅 URL 模式启动，因此无需后端即可运行。要启用本地文件，配置 `resourceImage: "both"` 或 `"upload"`，并提供 `upload: (file: File) => Promise<string>`。返回一个持久的图片 URL；临时的 `blob:` URL 无法在刷新后保留。挂载 `RichTextBubbleImage` 以获得图片编辑控件。

## 行内图片与块级图片

`Image.configure()` 现在会注册编辑器使用的两种图片节点类型：

- `image`：旧版的行内节点，为了兼容既有的 ProseMirror JSON 而保留。
- `imageBlock`：当 `defaultInline` 为 `false`，或 `setImageInline({ inline: false })` / `setImageBlock()` 插入图片时使用的块级节点。

现有的 HTML 依然可以被解析：

- `<div class="image"><img ... /></div>` 会被解析为 `imageBlock`。
- 1.0.26 之前版本生成的 `<p><div class="image"><img inline="false" ... /></div></p>` 会被解析为 `imageBlock`，且不含浏览器在其周围添加的空段落，因此文档不会在每次保存/加载时增大。
- `<span class="image"><img inline="true" ... /></span>` 会被解析为行内的 `image` 节点。
- `type: "image"` 的旧版 JSON 依然可以正常加载。如果你想迁移已存储的 JSON，可以在保存迁移后的文档前使用 `migrateImageJSONToImageBlock(json)`。

## Image Gif

要搜索 GIF 服务商并插入结果，请使用单独的 [ImageGif 扩展](/zh/extensions/ImageGif/index.md)。

## Props

```ts
interface IImageOptions extends GeneralOptions<IImageOptions> {
  /** Function for uploading files */
  upload?: (file: File) => Promise<string>;

  HTMLAttributes?: any;

  multiple?: boolean;
  acceptMimes?: string[];
  maxSize?: number;

  /** The source URL of the image */
  resourceImage: 'upload' | 'link' | 'both';
  defaultInline?: boolean;

  enableAlt?: boolean;

  onError?: (error: { type: 'size' | 'type' | 'upload'; message: string; file?: File }) => void;
}
```

| Property         | Type                                                                                    | Description                                                                                                                                                        | Required | Default                                                              |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------- |
| `upload`         | `(file: File) => Promise<string>`                                                       | 自定义图片上传函数，接收一个 `File` 并返回携带图片 URL 的 Promise，适用于上传到云端或本地服务器。                                                                  | 否       | 无                                                                   |
| `HTMLAttributes` | `any`                                                                                   | 传递给 `<img>` 标签的 HTML 属性，例如 `className`、`style`、`alt` 等。                                                                                             | 否       | 无                                                                   |
| `multiple`       | `boolean`                                                                               | 是否允许同时选择并上传多张图片。                                                                                                                                   | 否       | `true`                                                               |
| `acceptMimes`    | `string[]`                                                                              | 允许的图片 MIME 类型或文件扩展名限制列表，例如 `['image/jpeg', 'image/png']`、`['image/*']` 或 `['.png', '.jpg']` 等。支持 MIME 类型通配符和精确的文件扩展名限制。 | 否       | 常见图片类型 `['image/jpeg', 'image/gif', 'image/png', 'image/jpg']` |
| `maxSize`        | `number`                                                                                | 单张图片的最大大小限制（字节），超出时触发 `onError`。                                                                                                             | 否       | `5MB`                                                                |
| `resourceImage`  | `'upload' \| 'link' \| 'both'`                                                          | 图片来源方式：- `'upload'`：仅上传 - `'link'`：仅链接 - `'both'`：两者均支持                                                                                       | 否       | `both`                                                               |
| `defaultInline`  | `boolean`                                                                               | 是否默认以行内元素插入图片。                                                                                                                                       | 否       | `false`                                                              |
| `enableAlt`      | `boolean`                                                                               | 是否启用图片的 alt 文本编辑。                                                                                                                                      | 否       | `true`                                                               |
| `onError`        | `(error: { type: 'size' \| 'type' \| 'upload'; message: string; file?: File }) => void` | 上传或校验失败的回调函数。包含错误类型（size、type、upload）、错误信息和对应的文件。                                                                               | 否       | 无                                                                   |

### resourceImage 类型说明

- `'upload'`：用户只能选择本地文件上传
- `'link'`：用户只能输入图片 URL
- `'both'`：同时支持上传和 URL 两种方式

### acceptMimes 使用说明

支持三种格式类型：

1. **MIME 类型**：例如 `['image/jpeg', 'image/png']`
2. **通配符类型**：例如 `['image/*']`，匹配所有图片 MIME 类型
3. **扩展名类型**：例如：

```ts
[
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.svgz',
  '.xbm',
  '.tiff',
  '.ico',
  '.jfif',
  '.heic',
  '.heif',
  '.avif',
  '.bmp',
  '.apng',
  '.pjpeg',
];
```

### onError 示例

- 自定义错误处理逻辑，统一系统提示。
- 建议使用 message 字段，它内置了动态提示和 i18n 国际化支持。

```ts
onError: ({ type, message, file }) => {
  switch (type) {
    case 'size':
      console.warn(`File size exceeds limit: ${file?.name}`);
      break;
    case 'type':
      console.warn(`Unsupported file type: ${file?.type}`);
      break;
    case 'upload':
      console.error(`Upload failed: ${message}`);
      break;
  }
};
```

## 上传本地图片

将安装与注册示例中仅支持 URL 的配置替换为下面这个。在你的应用中实现 `/api/images`，使其接受 multipart 的 `file` 并返回包含 `url` 字符串的 JSON 对象：

```ts
Image.configure({
  resourceImage: 'both',
  upload: async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/images', { method: 'POST', body });
    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    if (typeof data.url !== 'string' || !data.url) {
      throw new Error('Upload response must contain an image URL');
    }
    return data.url;
  },
});
```

该库负责编辑器 UI，你的应用负责存储和上传接口。请同时在该接口和客户端配置中强制执行可接受的文件类型和大小限制。

## 选项

关于插入对话框的一切都在扩展上配置：

```tsx
Image.configure({
  // Required to store files anywhere other than a blob: URL.
  upload: async (file) => (await uploadToYourApi(file)).url,

  // Accepted types, as an `accept` list. The dialog shows the first few of
  // these plus the size limit under the drop zone.
  acceptMimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // Per-file limit in bytes. Default: 5 MB.
  maxSize: 10 * 1024 * 1024,

  // Whether more than one file can be picked or dropped at a time. Default: true.
  multiple: true,

  // 'upload' | 'link' | 'both'. Controls which tabs the dialog shows.
  resourceImage: 'both',

  // Insert images inline with text rather than as their own block. Default: false.
  defaultInline: false,

  // Ask for alt text while inserting. Default: false — most editors let you
  // set it afterwards rather than interrupting the insert.
  enableAlt: false,

  // Called instead of the built-in toast when a file is rejected or fails.
  onError: ({ type, message, file }) => reportToYourApp(type, message, file),
});
```

默认的 `acceptMimes` 涵盖 JPEG、PNG、GIF、WebP、AVIF、BMP、TIFF、HEIC、
HEIF 和 SVG。关于 SVG 的说明：它在 `<img>` 内是惰性的，但可能携带
脚本，因此如果宿主以自己的源直接把上传文件作为顶层文档提供访问，
应对其进行清洗或从独立的源提供服务。如果你完全不想接受 SVG，可以从
`acceptMimes` 中去掉 `'image/svg+xml'`。

## 图注与旋转

挂载 `RichTextBubbleImage` 即可获得图片控件。其中两个值得特别说明：

- **旋转**每次点击将图片旋转 90 度，并把角度存储在
  节点的 `rotate` 属性中，在 `<img>` 上序列化为 `data-rotate`。
  旧版的 `flipx` / `flipy` 属性依然会被解析，因此早期版本写入的
  文档仍保留其翻转状态。
- **图注**在块级图片下方添加一条图注，存储在 `caption`
  属性中，并在图片包装元素内序列化为 `<div class="image-caption">`。它
  会跟随图片的对齐方式。清空文本会移除图注，
  此后该按钮会用于添加一条新的图注。行内图片没有图注，
  因此该按钮对它们是禁用的。

## 上传与被删除的图片

`upload` 会在文件被选中后立即执行，因此图片会先到达你的服务器，
再等文档保存。如果用户随后删除了这张图片，或者从未保存，
服务器上就会留下一个不再被引用的文件。该扩展会追踪足够的信息，
以便在保存时清理这些文件：

```ts
import { getImageChanges, markImagesSaved } from 'ai-sparkwrite-editor/image';

async function save(editor: Editor) {
  const { current, removed, orphaned } = getImageChanges(editor);

  await api.saveDocument({ html: editor.getHTML(), images: current });
  // `removed`: in the last saved version, gone now.
  // `orphaned`: uploaded in this session, not in the document — inserted and
  // deleted again, or cropped and replaced.
  await api.deleteImages([...removed, ...orphaned]);

  markImagesSaved(editor);
}
```

- `getImageChanges(editor, previous?)` 将文档与图片来源的快照进行比较：
  可以是 `markImagesSaved` 记录的那份，也可以是你传入的一份（例如
  服务器上随文档存储的列表，这样在刷新后的首次保存也能发现删除项）。
  它返回 `current`、`added`、`removed` 和 `orphaned`。
- `markImagesSaved(editor)` 会把当前的来源记录为新的基线，
  并不再将它们计为孤立项。
- `collectImageSources(doc)` 列出任意文档中的来源，供比较的
  服务端一侧使用。

撤销操作可能会让已删除的图片重新出现，因此应在保存时而不是每次编辑时
删除服务器上的文件。只有 `upload` 返回的来源才会被上报为
孤立项；粘贴或链接的 URL 不会。
