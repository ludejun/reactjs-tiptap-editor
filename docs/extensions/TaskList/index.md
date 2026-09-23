---
description: TaskList

next:
  text: TextAlign
  link: /extensions/TextAlign/index.md
---

# Task List

Create a checklist with interactive checkboxes.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, TaskList, RichTextTaskList } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TaskList];

export default function TaskListExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextTaskList />
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
import { TaskList, RichTextProvider, RichTextTaskList } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TaskList];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextTaskList />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::


## How to use

The library’s `TaskList` includes `TaskItem`; do not register another task-item extension. Click the toolbar button to create a checklist and click a checkbox to change its checked state. Use `TaskList.configure({ taskItem: { nested: true } })` to allow nested tasks.

## Options

### shortcutKeys

Type: `string[]`\
Default: `['shift', 'mod', '9']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
