---
description: 工具栏

next:
  text: 气泡菜单
  link: /zh/guide/bubble-menu.md
---

# 工具栏

工具栏是你用 `RichText*` 控件组合出的一种布局。按钮顺序跟随你的 JSX 顺序。每个控件都从 `RichTextProvider` 读取编辑器，因此你不需要给单个按钮传 `editor` 属性。

从[快速开始](/zh/guide/getting-started)中那个可用的编辑器开始。要添加标题和列表，请安装与你其他 Tiptap 包相同版本的 `@tiptap/extension-list`，然后添加以下引入：

```tsx
import { ListItem } from '@tiptap/extension-list';
import { Heading, RichTextHeading } from 'ai-sparkwrite-editor/heading';
import { BulletList, RichTextBulletList } from 'ai-sparkwrite-editor/bulletlist';
```

在已有的 `extensions` 数组中追加 `Heading.configure({ levels: [1, 2, 3] })`、`ListItem` 和 `BulletList`。每个扩展只注册一次。然后把工具栏 JSX 替换为：

```tsx
<div
  role='toolbar'
  aria-label='Text formatting'
  style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}
>
  <RichTextUndo />
  <RichTextRedo />
  <RichTextHeading />
  <RichTextBold />
  <RichTextItalic />
  <RichTextBulletList />
</div>
```

这个示例中的其他控件来自"快速开始"。选中文本以应用行内格式；将光标放在段落中即可将其变为标题或列表。

## 让主行保持精简

每个控件都是独立组件，所以没有什么能阻止你把它们全部渲染出来——也没有什么能阻止这一行折成四行一模一样的灰色图标。成熟的编辑器都用同一种方式解决这个问题：一行放常用控件，其余放进一个溢出按钮。Google Docs 有"更多"，Word 有功能区溢出，TinyMCE 有一个 chevron 箭头。

一种可行的划分方式是：撤销/重做、块类型、字体、行内标记、列表与对齐放在主行，大约十八个控件；链接、图片、表格和代码块也在其中。其余的都放到一个按钮后面，按小标签分组：文本选项、块、嵌入内容、导入导出、工具。用一条细分隔线把主行中的分组隔开，方便一眼找到。

在你搭建那个按钮后面的面板之前，有两件事值得了解。

给控件命名，而不是依赖 tooltip——这个面板存在的意义正是因为这些东西没人能靠图标认出来。并且在名称前给控件留一个固定宽度的槽位：这些控件宽度并不一致（`RichTextFontSize` 是一个文本触发器，`RichTextIndent` 是一对按钮，还有几个带 chevron），所以一个简单的"图标 + 文字"行会让名称那一列明显参差不齐。把放不进槽位的控件单独放在一整行，控件放在这一行的最右端，名称保持相同缩进。

同时避免在主行中把两个文本触发器并排放置：字体和字号在未使用时都显示"默认"，挨在一起会难以区分。

playground 中的 `RichTextToolbar` 实现了以上全部内容，是一个不错的起点，可以直接参考照搬。

## 扩展选项与按钮布局

在扩展数组中配置行为，例如 `Heading.configure({ levels: [1, 2, 3] })`。在 provider 内以 `<RichTextHeading />` 渲染其控件。移除该控件只会移除工具栏中的入口；已注册的扩展仍会解析内容并暴露命令。

有些控件需要配套扩展：

| 控件                                                                            | 需要注册                                                                                                      |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `RichTextBulletList`、`RichTextOrderedList`                                     | 对应的列表扩展加上 `ListItem`。                                                                               |
| `RichTextColor`、`RichTextFontFamily`、`RichTextFontSize`、`RichTextLineHeight` | 对应的扩展加上 `TextStyle`。                                                                                  |
| `RichTextTaskList`                                                              | `TaskList`；它内含 `TaskItem`。                                                                               |
| `RichTextTable`                                                                 | `Table`；它内含行、单元格和表头扩展。                                                                         |
| `RichTextColumn`                                                                | `Column`、`ColumnNode`、`MultipleColumnNode`，以及 [Column 页面](/zh/extensions/Column/)中描述的文档 schema。 |

## 构建自定义控件

你可以从一个普通的 React 按钮调用编辑器命令。下面的示例读取 provider 的上下文，并订阅它所展示的状态（在 Vue 中，来自 `ai-sparkwrite-editor/vue` 的 `RichTextToolbarButton`、`useEditorInstance` 和 `useEditorState` 效果相同）：

```tsx
import { useCurrentEditor, useEditorState } from '@tiptap/react';

export function CustomBoldButton() {
  const { editor } = useCurrentEditor();
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      active: editor?.isActive('bold') ?? false,
      enabled: Boolean(editor?.isEditable && editor.can().toggleBold()),
    }),
  });

  return (
    <button
      type='button'
      aria-pressed={state?.active ?? false}
      disabled={!state?.enabled}
      onClick={() => editor?.chain().focus().toggleBold().run()}
    >
      Bold
    </button>
  );
}
```

注册 `Bold` 并在 `RichTextProvider` 内渲染 `<CustomBoldButton />`。`focus()` 会在格式化之前把焦点带回文档。`type="button"` 可以防止意外触发表单提交。

## 快捷键

一个文档化的 `shortcutKeys` 选项为控件提供快捷键标签。更改这些标签通常不会注册新的按键绑定。要更改实际行为，请扩展该扩展的 `addKeyboardShortcuts` 方法：

```tsx
import { Bold } from 'ai-sparkwrite-editor/bold';

const CustomBold = Bold.extend({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      'Mod-Shift-b': () => this.editor.commands.toggleBold(),
    };
  },
}).configure({ shortcutKeys: ['mod', 'shift', 'B'] });
```

用 `CustomBold` 替代 `Bold`。这个示例保留了继承来的快捷键，并新增了一个。`Mod` 在 macOS 上代表 Command，在 Windows/Linux 上代表 Control。

关于只在选区周围出现的控件，参见[气泡菜单](/zh/guide/bubble-menu)。
