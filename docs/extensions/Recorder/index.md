---
description: Recorder

next:
  text: RichPaste
  link: /extensions/RichPaste/index.md
---

# Recorder

Records every edit as timestamped ProseMirror steps, so a writing session can be saved and played back like a screen recording of the document. Use it for audit trails, "show me how this was written", collaborative review, or reproducing a bug report exactly.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The extension has no toolbar control; you decide when to record and when to replay.

::: code-group

```tsx
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
``` [React]

```vue
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
``` [Vue]

:::


## How it works

`startRecording()` snapshots the document as JSON. From then on every transaction that changes the document (or, with `recordSelection`, moves the caret) is appended as `{ t, steps, selection }`, where `t` is milliseconds since the start and `steps` are the ProseMirror steps as JSON. `stopRecording()` closes it. The result lives in `editor.storage.recorder.recording` and `getRecording(editor)` returns it — plain JSON you can `JSON.stringify` and store.

`replayRecording(editor, recording, options)` resets the editor to the snapshot and applies the entries with the original pauses, scaled by `speed` and capped by `maxDelay`. Replayed transactions are neither recorded again nor added to the undo history. Make the editor read-only during playback if the viewer should only watch; pass an `AbortSignal` to stop early.

A recording is tied to the schema it was made with. Replaying it in an editor with different extensions can fail, in which case the promise rejects with the failing entry index.

## Saving as you go

`onEntry` fires for each entry, so you can stream a session to a server or persist incrementally:

```ts
Recorder.configure({
  autoStart: true,
  onEntry: (entry, recording) => {
    // POST entry, or debounce and save `recording` whole.
  },
});
```

## Commands

- `editor.commands.startRecording()` — starts a new recording from the current document.
- `editor.commands.stopRecording()` — stops it; returns `false` when nothing was recording.

## Options

### autoStart

Type: `boolean`\
Default: `false`

Start recording when the editor is created.

### recordSelection

Type: `boolean`\
Default: `true`

Also record caret and selection changes, so a replay shows where the author was looking. Turn it off for smaller recordings.

### onEntry

Type: `(entry: RecordingEntry, recording: Recording) => void`\
Default: none

Called for every recorded entry.

### maxEntries

Type: `number`\
Default: `0` (unlimited)

When the recording grows past this many entries it restarts from the current document, so memory stays bounded for very long sessions. Pair it with `onEntry` if you need the full history.

## Replay options

`replayRecording(editor, recording, { speed, maxDelay, onProgress, signal })`

- `speed` — `1` is real time, `4` is four times faster.
- `maxDelay` — the longest pause kept, in real-time milliseconds (default `2000`).
- `onProgress(index, total)` — after each entry.
- `signal` — an `AbortSignal` to stop.
