---
description: SlashCommand

next:
  text: Strike
  link: /zh/extensions/Strike/index.md
---

# Slash Command

在文档中输入 `/` 以打开插入菜单。

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
import { SlashCommand, SlashCommandList } from 'ai-sparkwrite-editor/slashcommand';
import { Heading } from 'ai-sparkwrite-editor/heading';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Heading, SlashCommand];

export default function SlashCommandExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <SlashCommandList />
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

注册 `SlashCommand`，并在 provider 内挂载 `SlashCommandList`。该组件提供命令列表；扩展负责处理触发字符和弹出层。在空段落中输入 `/`，过滤列表并选择一项。请注册你所提供命令所需要的扩展。

## 提供自定义命令列表

在 `SlashCommandList` 上使用 `commandList` 可以替换默认的分组。每个分组都有 `name`、`title` 和 `commands` 数组。命令函数会接收 editor 以及包含斜杠查询内容的 range。

```tsx
import { SlashCommandList } from 'ai-sparkwrite-editor/slashcommand';

export function CustomSlashCommands() {
  return (
    <SlashCommandList
      commandList={[
        {
          name: 'insert',
          title: 'Insert',
          commands: [
            {
              name: 'greeting',
              label: 'Greeting',
              description: 'Insert a short greeting',
              aliases: ['hello'],
              action: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertContent('<p>Hello!</p>').run();
              },
            },
          ],
        },
      ]}
    />
  );
}
```

用 `CustomSlashCommands` 替换默认的 `SlashCommandList` 挂载。移除 `range` 会导致输入的斜杠查询内容残留在文档中。如果某个 action 调用了某个功能特定的命令，也需要注册该功能对应的扩展。使用 `shouldBeHidden: (editor) => boolean` 可以在某个命令的前置条件不满足时将其隐藏。

将 `hiddenUntilSearched` 设为 `true`，可以让某个命令在读者输入与其 label 或 aliases 匹配的内容之前，都不出现在菜单中。这适用于那些值得存在、但不值得常驻占用空间的条目 —— 默认列表中的四级到六级标题就使用了这个选项，这样 Table 和 Code block 就不会被挤到折叠区域以下。

## 默认列表

默认分组为 _Format_（段落、一级到三级标题、无序列表、有序列表、任务列表、引用）和 _Insert_（表格、代码块、图片、分割线、分栏、折叠列表、视频、目录），当注册了 AI 扩展时，顶部还会额外出现一个 _AI_ 条目。四级到六级标题只有在被搜索到时才会出现。

省略或传入空的 `commandList` 会使用默认列表。命令列表的存储目前是跨编辑器实例共享的，因此在多个编辑器中挂载不同的列表可能会互相覆盖。
