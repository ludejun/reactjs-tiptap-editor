---
description: Video
---

# Video

在文档中插入链接视频或上传的视频。

## 安装与注册

从[快速开始](/zh/guide/getting-started)中的包开始。下面的完整示例注册该功能并渲染其 UI——选择 React 或 Vue 标签页。在现有编辑器中，把导入和扩展项合并到你的配置中，并将控件放进你现有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, Video, RichTextVideo, RichTextBubbleVideo } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

function uploadVideo(
  file: File,
  onProgress?: (progress: { loaded: number; total: number }) => void
) {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', '/api/videos');
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.({ loaded: event.loaded, total: event.total });
      }
    });
    request.addEventListener('load', () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('Video upload failed'));
        return;
      }

      try {
        const data = JSON.parse(request.responseText);
        if (typeof data.url !== 'string' || !data.url) {
          throw new Error('Upload response must contain a video URL');
        }
        resolve(data.url);
      } catch (error) {
        reject(error);
      }
    });
    request.addEventListener('error', () => reject(new Error('Video upload failed')));
    request.send(formData);
  });
}

const extensions = [
  Document,
  Paragraph,
  Text,
  Video.configure({
    resourceVideo: 'both',
    acceptMimes: ['video/mp4', 'video/webm'],
    maxSize: 100 * 1024 * 1024,
    multiple: true,
    uploadConcurrency: 3,
    showUploadProgress: true,
    upload: (file, { onProgress } = {}) => uploadVideo(file, onProgress),
    onError: ({ message, file }) => {
      console.error(message, file?.name);
    },
  }),
];

export default function VideoExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextVideo />
      <RichTextBubbleVideo />
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
import { Video, RichTextProvider, RichTextVideo } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

function uploadVideo(
  file: File,
  onProgress?: (progress: { loaded: number; total: number }) => void
) {
  return new Promise<string>((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const request = new XMLHttpRequest();
    request.open('POST', '/api/videos');
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress?.({ loaded: event.loaded, total: event.total });
      }
    });
    request.addEventListener('load', () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error('Video upload failed'));
        return;
      }

      try {
        const data = JSON.parse(request.responseText);
        if (typeof data.url !== 'string' || !data.url) {
          throw new Error('Upload response must contain a video URL');
        }
        resolve(data.url);
      } catch (error) {
        reject(error);
      }
    });
    request.addEventListener('error', () => reject(new Error('Video upload failed')));
    request.send(formData);
  });
}

const extensions = [
  Document,
  Paragraph,
  Text,
  Video.configure({
    resourceVideo: 'both',
    acceptMimes: ['video/mp4', 'video/webm'],
    maxSize: 100 * 1024 * 1024,
    multiple: true,
    uploadConcurrency: 3,
    showUploadProgress: true,
    upload: (file, { onProgress } = {}) => uploadVideo(file, onProgress),
    onError: ({ message, file }) => {
      console.error(message, file?.name);
    },
  }),
];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextVideo />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Vue 层暂未提供：`RichTextBubbleVideo`——可以从你自己的控件中调用对应命令，或参阅[框架支持](/zh/guide/frameworks)。
:::

## 使用方式

上传示例调用了你的应用的 `/api/videos` 接口，该接口必须返回包含 `url` 字符串的 JSON。如果只需要基于 URL 的使用方式、不依赖后端，把配置替换为 `Video.configure({ resourceVideo: "link" })`。挂载 `RichTextBubbleVideo` 以获得上下文相关的控件。托管服务商必须允许嵌入，其播放器才能正常工作。

## Props

```ts
interface VideoUploadProgress {
  loaded: number;
  total: number;
}

interface VideoUploadContext {
  onProgress?: (progress: VideoUploadProgress) => void;
}

interface VideoOptions extends GeneralOptions<VideoOptions> {
  /**
   * Indicates whether fullscreen play is allowed
   *
   * @default true
   */
  allowFullscreen: boolean;
  /**
   * Indicates whether to display the frameborder
   *
   * @default false
   */
  frameborder: boolean;
  /**
   * Width of the video, can be a number or string
   *
   * @default VIDEO_SIZE['size-medium']
   */
  width: number | string;
  /** HTML attributes object for passing additional attributes */
  HTMLAttributes: {
    [key: string]: any;
  };
  /** Function for uploading files */
  upload?: (file: File, context?: VideoUploadContext) => Promise<string>;

  /** Whether multiple videos can be selected and uploaded at once */
  multiple?: boolean;

  /** Maximum number of videos uploaded concurrently */
  uploadConcurrency?: number;

  /**
   * Whether to display overall and per-file upload progress
   *
   * @default true
   */
  showUploadProgress?: boolean;

  /** Accepted video MIME types or file extensions */
  acceptMimes?: string[];

  /** Maximum size of a single video in bytes. No limit is applied when omitted. */
  maxSize?: number;

  /** Callback invoked when video validation or upload fails */
  onError?: (error: { type: 'size' | 'type' | 'upload'; message: string; file?: File }) => void;

  /** The source URL of the video */
  resourceVideo: 'upload' | 'link' | 'both';

  /**
   * List of allowed video hosting providers.
   * Use ['.'] to allow any URL.
   *
   * @default ['.']
   */
  videoProviders?: string[];
}
```

## 选项

| Option               | Type                                                                                    | Description                                                   | Required | Default                       |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------- | ----------------------------- |
| `allowFullscreen`    | `boolean`                                                                               | 允许嵌入的视频进入全屏模式。                                  | 否       | `true`                        |
| `frameborder`        | `boolean`                                                                               | 在嵌入的视频框架周围显示边框。                                | 否       | `false`                       |
| `width`              | `number \| string`                                                                      | 设置视频的默认宽度。                                          | 否       | `VIDEO_SIZE.size-medium`      |
| `HTMLAttributes`     | `Record<string, any>`                                                                   | 为视频包装元素添加 HTML 属性。                                | 否       | `{ class: 'iframe-wrapper' }` |
| `upload`             | `(file: File, context?: VideoUploadContext) => Promise<string>`                         | 上传本地视频，可选择上报字节进度，并以其 URL 完成 resolve。   | 否       | 无                            |
| `multiple`           | `boolean`                                                                               | 允许选择并上传多个视频。                                      | 否       | `true`                        |
| `uploadConcurrency`  | `number`                                                                                | 限制同时上传的视频数量。小于 `1` 的值会被视为 `1`。           | 否       | `3`                           |
| `showUploadProgress` | `boolean`                                                                               | 在上报字节进度时显示整体及每个文件的进度。                    | 否       | `true`                        |
| `acceptMimes`        | `string[]`                                                                              | 按 MIME 类型或扩展名限制本地文件；支持通配符，如 `video/*`。  | 否       | `['video/*']`                 |
| `maxSize`            | `number`                                                                                | 每个本地视频的最大字节数。省略时不限制大小。                  | 否       | 无                            |
| `onError`            | `(error: { type: 'size' \| 'type' \| 'upload'; message: string; file?: File }) => void` | 处理校验和上传失败。省略时编辑器显示默认的错误提示。          | 否       | 无                            |
| `resourceVideo`      | `'upload' \| 'link' \| 'both'`                                                          | 控制用户能否通过本地上传、URL 或两者添加视频。                | 否       | `'both'`                      |
| `videoProviders`     | `string[]`                                                                              | 限制链接视频只能来自匹配的服务商。使用 `['.']` 接受任意 URL。 | 否       | `['.']`                       |

## 上传行为

`XMLHttpRequest` 示例通过 `onProgress` 上报已上传的字节数。普通的 `fetch` 上传不提供这种字节级进度回调。

在 `upload` 这个 Promise 处于挂起状态期间，工具栏对话框和斜杠命令对话框都会保持
打开并禁用上传按钮。调用 `context.onProgress({ loaded, total })` 可显示真实的、
按字节计算的总体进度和每个文件的进度。如果已有的上传函数忽略了这个
可选的第二个参数，它依然保持兼容，编辑器会显示一个不确定的加载动画。
进度详情默认启用。将 `showUploadProgress` 设为 `false` 可以在保留禁用状态的上传按钮和不确定加载指示器的同时，
隐藏整体及每个文件的进度 UI。

当所有上传都完成后，它们的 URL 会按选择顺序插入，对话框随之关闭。已经
达到 100% 但其上传 Promise 尚未完成的文件会显示为处理中。

如果某个上传被拒绝（reject），其他成功的视频依然会被插入。失败的文件会在
打开的对话框中保持标记状态，供用户重新选择。可以配置 `onError` 来提供自定义的错误处理；
否则编辑器会显示默认的上传失败提示。

`acceptMimes` 和 `maxSize` 会在上传前校验每个选中的文件。当 `multiple: true` 时，所有
有效的文件都会被加入队列，最多同时上传 `uploadConcurrency` 个文件。
