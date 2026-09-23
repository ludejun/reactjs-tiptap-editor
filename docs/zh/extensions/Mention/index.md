---
description: Mention

next:
  text: Mermaid
  link: /zh/extensions/Mermaid/index.md
---

# Mention

使用触发字符（例如 `@`）插入结构化的 mention。

## 安装与注册

先按照[快速开始](/zh/guide/getting-started)安装相关包。下面的完整示例注册了该功能并渲染了其界面 —— 请选择 React 或 Vue 标签页。若是在已有编辑器中使用，请将导入语句和扩展条目合并到你的配置中，并将控件放入你已有的 `RichTextProvider` 内。

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { Mention } from 'ai-sparkwrite-editor/mention';
import 'ai-sparkwrite-editor/style.css';

const users = [
  { id: '1', label: 'Alex' },
  { id: '2', label: 'Sam' },
];

const extensions = [
  Document,
  Paragraph,
  Text,
  Mention.configure({
    suggestion: {
      char: '@',
      items: ({ query }) =>
        users.filter((user) => user.label.toLowerCase().startsWith(query.toLowerCase())),
    },
  }),
];

export default function MentionExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
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

输入 `@` 加上名字即可过滤建议列表。`items` 需要返回带有稳定的 `id` 和用于显示的 `label` 字段的对象；`avatar` 为可选字段。当你配置了 `suggestion` 或 `suggestions` 时，库会提供对应的建议渲染器。没有单独的 mention 工具栏按钮。若要实现远程搜索，只需将过滤逻辑替换为返回相同结构的异步请求。

## 多个触发字符

使用 `suggestions` 可以为人员和标签分别提供不同的数据源。用下面的配置替换单一的 `suggestion` 配置：

```ts
import { Mention } from 'ai-sparkwrite-editor/mention';

const people = [{ id: 'user-1', label: 'Alex' }];
const tags = [{ id: 'tag-1', label: 'Documentation' }];

Mention.configure({
  suggestions: [
    {
      char: '@',
      items: ({ query }) =>
        people.filter((item) => item.label.toLowerCase().startsWith(query.toLowerCase())),
    },
    {
      char: '#',
      items: ({ query }) =>
        tags.filter((item) => item.label.toLowerCase().startsWith(query.toLowerCase())),
    },
  ],
});
```

使用方向键在建议列表中移动，按 Enter 插入选中项。mention 只会保存所选的标识符和显示名称，不会自动发送通知或更新用户记录。
