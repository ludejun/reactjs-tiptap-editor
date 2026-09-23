---
description: 从 reactjs-tiptap-editor 迁移

next:
  text: Attachment
  link: /zh/extensions/Attachment/index.md
---

# 从 reactjs-tiptap-editor 迁移

`ai-sparkwrite-editor` 脱胎于 [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor)。当你要把某个应用从该包，或从它遗留的 `RichTextEditor` / `BaseKit` API 迁移到本项目使用的可组合 API 时，请参考本指南。如果是新项目，请阅读 [快速开始](/zh/guide/getting-started)。

首先有两处机械式的改动：所有引入路径都从 `reactjs-tiptap-editor/<x>` 改为 `ai-sparkwrite-editor/<x>`（子路径名称保持不变），根 CSS 类改为 `.sparkwrite`。之后再应用下面列出的 API 差异。

在切换用户之前，请保留一份现有已保存内容的样本，并在新的扩展配置下进行测试。

## 有哪些变化

| 旧版 API                         | 可组合 API                                                          |
| -------------------------------- | ------------------------------------------------------------------- |
| 默认导出的 `RichTextEditor` 组件 | 具名导出的 `RichTextProvider`，配合 Tiptap 的 `EditorContent`。     |
| 组件上的 `extensions`            | `useEditor` 中的 `extensions`。                                     |
| `content` 与 `output` 属性       | `useEditor` 中的 `content`；通过 `getHTML()` 或 `getJSON()` 读取。  |
| `onChangeContent`                | `useEditor` 中的 `onUpdate: ({ editor }) => ...`。                  |
| `BaseKit.configure(...)`         | 单独注册各个基础扩展并直接配置它们。                                |
| 自动组装的工具栏                 | 在 provider 内部显式渲染 `RichText*` 控件。                         |
| 气泡菜单渲染配置                 | 挂载各个 `RichTextBubble*` 组件。                                   |
| `disabled`                       | `useEditor` 中的 `editable`，或 `editor.setEditable(...)`。         |
| `dark`                           | `themeActions.setTheme('light' or 'dark')`。                        |
| 旧版语言包 API                   | 来自 `/locale` 的 `localeActions` 和 `useLocale`；按需注册语言包。  |
| `/multicolumn` 相关引入          | 改用 `/column`，配合 `Column`、`ColumnNode`、`MultipleColumnNode`。 |

## 替换编辑器组件

安装“快速开始”中列出的这些包。下面这个组件接收初始 HTML，并把编辑结果上报给你原有的保存处理函数：

```tsx
'use client';

import { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Bold,
  RichTextBold,
  Italic,
  RichTextItalic,
  History,
  RichTextUndo,
  RichTextRedo,
  RichTextBubbleText,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Bold, Italic, History];

type MigratedEditorProps = {
  initialContent: string;
  onChangeContent: (html: string) => void;
  disabled?: boolean;
};

export default function MigratedEditor({
  initialContent,
  onChangeContent,
  disabled = false,
}: MigratedEditorProps) {
  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChangeContent(editor.getHTML()),
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <div
        role='toolbar'
        aria-label='Text formatting'
        style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}
      >
        <RichTextUndo />
        <RichTextRedo />
        <RichTextBold />
        <RichTextItalic />
      </div>
      <RichTextBubbleText
        buttonBubble={
          <>
            <RichTextBold />
            <RichTextItalic />
          </>
        }
      />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

`initialContent` 用于初始化文档。打开另一份文档时，要么使用带文档专属 React `key` 的方式重新挂载组件，要么在加载完成后调用 `setContent`。不要在保存处理函数每次更新父组件状态时重置文档。参见 [加载内容](/zh/guide/getting-started#_5-load-or-replace-content)。

如果要保存 JSON，把回调改为 `editor.getJSON()`，并将你的值类型标注为从 `@tiptap/core` 引入的 Tiptap `JSONContent`。

## 有针对性地替换 BaseKit

最小的 schema 需要 `Document`、`Paragraph` 和 `Text`。根据你原有的功能，添加其余部分：

| 需求             | 要添加的扩展                                                                   |
| ---------------- | ------------------------------------------------------------------------------ |
| 换行             | 来自 `@tiptap/extension-hard-break` 的 `HardBreak`。                           |
| 占位提示文字     | 来自 `@tiptap/extensions` 的 `Placeholder`。                                   |
| 拖放光标         | 来自 `@tiptap/extensions` 的 `Dropcursor`。                                    |
| 块之间的光标     | 来自 `@tiptap/extensions` 的 `Gapcursor`。                                     |
| 末尾的尾随段落   | 来自 `@tiptap/extensions` 的 `TrailingNode`。                                  |
| 字数限制         | 来自 `@tiptap/extensions` 的 `CharacterCount`。                                |
| 无序/有序列表项  | 来自 `@tiptap/extension-list` 的 `ListItem`，与对应的列表扩展搭配使用。        |
| 颜色、字体、行高 | 来自 `@tiptap/extension-text-style` 的 `TextStyle`，与对应的功能扩展搭配使用。 |
| 撤销/重做        | 库自带的 `History` 扩展。                                                      |

例如，通过在数组中加入以下已配置好的扩展，来保留占位提示文字和字数限制：

```ts
import { CharacterCount, Placeholder } from '@tiptap/extensions';

const extraExtensions = [
  Placeholder.configure({ placeholder: 'Start writing…', showOnlyCurrent: true }),
  CharacterCount.configure({ limit: 50_000 }),
];
```

将 `extraExtensions` 展开合并进你现有的 `extensions` 数组。提示文字中出现 `/` 并不会启用斜杠命令；斜杠命令需要它自己的扩展和列表组件。

如果你已经在使用 `StarterKit`，请先禁用其中重叠的扩展，再注册本库的对应版本。请保持 Tiptap 各个包版本兼容；当前源码使用的是 Tiptap 3。

## 恢复工具栏与气泡菜单功能

针对每一个原先启用的功能：

1. 从对应的文档子路径引入它的扩展。
2. 将它及其配套扩展加入 `useEditor({ extensions })`。
3. 引入并挂载它的 `RichText*` 工具栏控件。
4. 如果需要上下文编辑，再挂载对应的气泡组件。
5. 恢复功能相关的配置，例如上传回调和 CSS 引入。

组件对应关系及自定义控件请参见 [工具栏](/zh/guide/toolbar) 和 [气泡菜单](/zh/guide/bubble-menu)。

## 恢复主题与语言

在客户端初始化时或在偏好设置变更的处理函数中调用这些 action：

```ts
import { themeActions } from 'ai-sparkwrite-editor/theme';
import { localeActions } from 'ai-sparkwrite-editor/locale';
import vi from 'ai-sparkwrite-editor/locales/vi';

themeActions.setTheme('dark');
localeActions.setMessage('vi', vi);
localeActions.setLang('vi');
```

这些设置在各个编辑器实例间共享。provider 当前的 `dark` 属性不会被其实现所应用。参见 [自定义主题](/zh/guide/custom-theme) 和 [国际化](/zh/guide/internationalization)。

## 恢复分栏与斜杠命令

分栏布局需要 `/column` 的全部三个导出，以及 [Column 页面](/zh/extensions/Column/) 中所展示的文档结构设置。不要同时注册原始的 Document 和扩展后的 Document。

如需斜杠命令，请注册 `SlashCommand` 并在 `RichTextProvider` 下挂载 `<SlashCommandList />`。如需自定义菜单，使用它的 `commandList` 属性；参见 [Slash Command](/zh/extensions/SlashCommand/)。

## 验证迁移结果

- 加载具有代表性的已保存 HTML/JSON，确认格式、列表、表格、链接和自定义节点在保存/重新加载后依然完好。
- 测试撤销/重做、选区控件、键盘快捷键，以及只读状态的切换。
- 验证上传处理函数返回的是持久化 URL，并且上传失败对用户可见。
- 检查你所用框架中的主题、翻译、功能样式表以及客户端初始化。
- 用你应用中实际使用的节点类型测试 Word/PDF 导出；这些格式并不保证保留编辑器的每一项功能。
