---
description: ShortMessage

next:
  text: SlashCommand
  link: /zh/extensions/SlashCommand/index.md
---

# Short Message

通过键盘快捷键（默认 `Ctrl+Space` / `Cmd+Space`）打开列表，插入预定义的短语片段。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, ShortMessage } from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  Document,
  Paragraph,
  Text,
  ShortMessage.configure({
    messages: [
      { short: 'nsfw', long_content: 'Not safe forward' },
      { short: 'brb', long_content: 'Be right back' },
      { short: 'sig', long_content: '<p>Best regards,<br><strong>Alex</strong></p>' },
    ],
  }),
];

export default function ShortMessageExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Press Ctrl+Space here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

:::

::: warning 仅 React
该功能的交互界面依赖 React 相关库，Vue 层暂未包含该功能。参见[框架集成](/zh/guide/frameworks)了解 Vue 版本已覆盖的内容。
:::

## 使用方式

将光标置于段落内并按下快捷键。此时会在光标位置弹出所有已配置消息的列表。继续输入即可过滤列表；过滤规则会优先匹配 `short` 的开头，其次匹配 `short` 或 `long_content` 中包含该文本的项。使用方向键在列表中移动，按 Enter（或点击）插入。弹出列表期间输入的文本会被 `long_content` 替换。按 Escape 会关闭列表并保留已输入的文本。将光标移出当前块或点击编辑器外部也会关闭列表。该功能没有工具栏按钮。

`long_content` 是通过 `insertContent` 插入的，因此可以包含简单的 HTML，例如 `<strong>` 或 `<br>`。纯字符串会作为文本插入。

## 选项

| 选项       | 类型                                                                       | 默认值        | 说明                                                             |
| ---------- | -------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| `messages` | `{ short: string; long_content: string }[]`                                | `[]`          | 列表中显示的消息。`short` 用于显示并参与过滤。                   |
| `shortcut` | `string`                                                                   | `'Mod-Space'` | 打开列表的 Tiptap 键盘快捷键。                                   |
| `items`    | `({ query, editor }) => ShortMessageItem[] \| Promise<ShortMessageItem[]>` | —             | 替代内置的过滤逻辑。接收快捷键触发后输入的文本，可以是异步函数。 |

### 自定义快捷键

`shortcut` 使用 Tiptap / ProseMirror 的键位映射语法：修饰键与按键之间用 `-`（而非 `+`）连接，例如 `Mod-Space`、`Shift-Space`、`Ctrl-Alt-m`。可用的修饰键有 `Mod`（Windows/Linux 上为 Ctrl，macOS 上为 Cmd）、`Ctrl`、`Alt`、`Shift` 以及 `Cmd`/`Meta`。按键名称区分大小写，遵循 `KeyboardEvent.key` 的规则（`Space`、`Enter`、`ArrowUp`、`F2`、`a`、`/`）。类似 `shift+space` 这样的写法会被当作一个未知的按键名称，永远不会触发。完整列表参见 [Tiptap 键盘快捷键指南](https://tiptap.dev/docs/editor/core-concepts/keyboard-shortcuts)。

`Ctrl+Space` 在部分输入法中已被占用（例如 Windows 上的输入法切换，或 macOS 上的输入源切换）。如果担心冲突，可以选择其他组合：

```ts
ShortMessage.configure({
  shortcut: 'Mod-Shift-Space',
  messages: [{ short: 'ty', long_content: 'Thank you!' }],
});
```

### 远程消息

使用 `items` 可以从 API 获取消息，而不是使用静态列表：

```ts
ShortMessage.configure({
  items: async ({ query }) => {
    const res = await fetch(`/api/snippets?q=${encodeURIComponent(query)}`);
    return res.json(); // [{ short, long_content }]
  },
});
```
