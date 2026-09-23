---
description: 录制器

next:
  text: RichPaste
  link: /zh/extensions/RichPaste/index.md
---

# Recorder

将每一次编辑记录为带时间戳的 ProseMirror 步骤，因此一次写作过程可以像屏幕录制一样被保存和回放。可用于审计追踪、"演示这段内容是怎么写出来的"、协作审阅，或精确复现一个 bug 报告。

## 安装与注册

先安装 [快速开始](/zh/guide/getting-started) 中列出的包。该扩展没有工具栏控件，何时录制、何时回放由你自行决定。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Recorder, getRecording, replayRecording } from 'ai-sparkwrite-editor/recorder';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Recorder.configure({ autoStart: true })];

export default function RecorderExample() {
  const editor = useEditor({ extensions, content: '<p>Type here.</p>', immediatelyRender: false });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <button onClick={() => editor.commands.stopRecording()}>Stop</button>
      <button
        onClick={() => {
          const recording = getRecording(editor);
          if (recording) void replayRecording(editor, recording, { speed: 4 });
        }}
      >
        Replay ×4
      </button>
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
import { Recorder, getRecording, replayRecording } from 'ai-sparkwrite-editor/core';
import { RichTextProvider } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Recorder.configure({ autoStart: true })];

const editor = useEditor({
  extensions,
  content: '<p>Type here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <button onClick={() => editor.commands.stopRecording()}>Stop</button>
    <button
    onClick={() => {
    const recording = getRecording(editor);
    if (recording) void replayRecording(editor, recording, { speed: 4 });
    }}
    >
    Replay ×4
    </button>
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

## 工作原理

`startRecording()` 会把文档快照为 JSON。从这一刻起，每一次改变文档的事务（若开启 `recordSelection`，还包括移动光标的事务）都会被追加为一条 `{ t, steps, selection }` 记录，其中 `t` 是自开始以来经过的毫秒数，`steps` 是以 JSON 表示的 ProseMirror 步骤。`stopRecording()` 会结束录制。结果保存在 `editor.storage.recorder.recording` 中，`getRecording(editor)` 会返回它——这是可以直接 `JSON.stringify` 并存储的纯 JSON。

`replayRecording(editor, recording, options)` 会把编辑器重置到快照状态，然后按照原始的停顿时间依次应用各条记录，停顿时间会按 `speed` 缩放，并受 `maxDelay` 限制。回放产生的事务既不会被再次录制，也不会加入撤销历史。如果只希望观看者观看，回放期间应将编辑器设为只读；传入 `AbortSignal` 可提前终止回放。

一份录制与制作它时使用的 schema 是绑定的。在扩展配置不同的编辑器中回放可能会失败，此时 Promise 会带着失败的记录索引一起被拒绝（reject）。

## 边录制边保存

`onEntry` 会在每条记录产生时触发，因此你可以将一次写作过程流式发送到服务器，或增量持久化：

```ts
Recorder.configure({
  autoStart: true,
  onEntry: (entry, recording) => {
    // POST entry, or debounce and save `recording` whole.
  },
});
```

## 命令

- `editor.commands.startRecording()`——从当前文档开始一次新的录制。
- `editor.commands.stopRecording()`——停止录制；如果当时并未在录制，则返回 `false`。

## 选项

### autoStart

类型：`boolean`\
默认值：`false`

在编辑器创建时开始录制。

### recordSelection

类型：`boolean`\
默认值：`true`

同时录制光标与选区的变化，使回放能展示作者当时在看哪里。关闭它可以让录制结果更小。

### onEntry

类型：`(entry: RecordingEntry, recording: Recording) => void`\
默认值：无

每产生一条记录时调用。

### maxEntries

类型：`number`\
默认值：`0`（不限制）

当录制的记录条数超过这个值时，会从当前文档重新开始，使非常长的写作过程也能保持内存占用有界。如果需要完整历史，请配合 `onEntry` 使用。

## 回放选项

`replayRecording(editor, recording, { speed, maxDelay, onProgress, signal })`

- `speed`——`1` 表示实时速度，`4` 表示四倍速。
- `maxDelay`——保留的最长停顿时间，以真实毫秒数计（默认 `2000`）。
- `onProgress(index, total)`——每条记录回放后调用。
- `signal`——用于终止回放的 `AbortSignal`。
