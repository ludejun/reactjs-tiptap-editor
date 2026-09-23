# 自定义

几乎每个接入方最终都会想要这四样东西：自己的工具栏菜单、自己的块类型、对文档何时以及如何保存的控制权，还有一种能把某次编辑过程回放出来的方式。这些在库里都各有归宿。

## 自定义菜单

工具栏由组件组合而成——React 版本如下，Vue 版本则使用 `ai-sparkwrite-editor/vue` 中相同的构建块——因此自定义菜单只是这一排组件中的另一个组件而已。本库导出的正是 playground 所使用的同一套构建块：

```tsx
import {
  RichTextToolbar,
  RichTextToolbarButton,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
  registerIcons,
} from 'ai-sparkwrite-editor';
import { RichTextBold } from 'ai-sparkwrite-editor/bold';
import { RichTextTable } from 'ai-sparkwrite-editor/table';
import { Pencil, Save } from 'lucide-react';

// Icons are looked up by name; the built-in controls register theirs, you register yours.
registerIcons({ Pencil, Save });

<RichTextToolbar>
  <RichTextBold />
  <RichTextToolbarDivider />
  <RichTextTable />

  {/* Your own action, styled like the built-in controls */}
  <RichTextToolbarButton
    icon='Save'
    tooltip='Save'
    shortcutKeys={['mod', 'S']}
    onClick={() => save(editor)}
  />

  {/* Everything else, with labels instead of tooltips */}
  <RichTextToolbarMore label={t('editor.more')}>
    <RichTextToolbarMoreGroup label={t('editor.slash.insert')}>
      <RichTextToolbarMoreRow label={t('editor.divider.tooltip')}>
        <RichTextDivider />
      </RichTextToolbarMoreRow>
      <RichTextToolbarMoreRow label='Insert signature'>
        <RichTextToolbarButton icon='Pencil' onClick={insertSignature} />
      </RichTextToolbarMoreRow>
    </RichTextToolbarMoreGroup>
  </RichTextToolbarMore>
</RichTextToolbar>;
```

`RichTextToolbarMore` 会让面板展开期间、从它内部打开的下拉菜单（字号、行高……）保持存活，点击某一行的标签即可触发对应控件。任何来自某个扩展的 `RichText*` 控件都可以放进某一行里，你自己的组件也一样。关于顶部这一行应该放什么的约定，参见 [工具栏](/zh/guide/toolbar)。

### 图标

库中的每一个 `icon` 都是一个名称——扩展 `button()` 选项中的 `icon: 'Table'`、斜杠命令中的 `iconName`、`<RichTextToolbarButton icon='Save'>` 中的 `icon`。名称是通过一个初始几乎为空的注册表来解析的；每个内置控件在其模块加载时，会注册自己用到的图标——来自 [Lucide](https://lucide.dev) 或编辑器自身的 SVG——因此一个构建包只会携带它所引入的那些功能所用的图标（参见 [包体积](/zh/guide/bundle-size)）。

自定义的名称必须在渲染之前完成注册——在模块作用域下、紧挨着使用该图标的组件：

```ts
import { registerIcons } from 'ai-sparkwrite-editor';
import { Save } from 'lucide-react';

registerIcons({ Save });
```

`registerIcons` 接受任意支持 `className` 属性的组件（一个 Lucide 图标、你自己的 SVG 组件），并以你在配置中使用的名称作为键。用同一个名称再次注册会替换掉之前的图标，这也是替换某个内置图标的方式：在引入 `ai-sparkwrite-editor/bold` 之后调用 `registerIcons({ Bold: MyBoldIcon })`，就会改变各处的 Bold 按钮。要按名称读取图标，使用 `icons[name]`（`import { icons } from 'ai-sparkwrite-editor'`）。

自定义菜单项通常会调用某个命令。如果需要一个内置扩展没有提供的动作，就编写一个小型扩展：

```ts
import { Extension } from '@tiptap/core';

export const Signature = Extension.create({
  name: 'signature',
  addCommands() {
    return {
      insertSignature:
        () =>
        ({ chain }) =>
          chain()
            .insertContent('<p>— Ada, ' + new Date().toLocaleDateString() + '</p>')
            .run(),
    };
  },
});
```

## 自定义渲染

有两个层级，取决于你需要走多远。

**改变某个内置节点的外观。** 大多数节点都带有可用于自定义样式的 `class` 或 `data-*` 挂钩，也有一些提供渲染选项：`Divider.configure({ renderDivider })` 决定保存的 HTML，`Image.configure({ HTMLAttributes })` 添加属性，代码块则遵循 `CODE_THEME` 调色板。样式都位于同一个根类 `.sparkwrite` 之下，因此覆盖它们只需要比库本身多用一层选择器。

**添加你自己的块。** 任何 Tiptap 节点都可以使用，而节点视图能让它拥有可交互的编辑状态（下面是 React 版本；在 Vue 中，是在同一个节点上使用 `VueNodeViewRenderer`——参见 [框架支持](/zh/guide/frameworks)）。`Divider` 扩展是这整套模式的一个精简示例——属性、用于保存形式的 `parseHTML`/`renderHTML`、带输入框的节点视图、用于保持派生属性同步的插件——而 `Callout` 则是一个更简单的例子：

```tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

const RatingView = ({ node, updateAttributes }) => (
  <NodeViewWrapper className='rating'>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => updateAttributes({ value: n })}
        aria-pressed={n <= node.attrs.value}
      >
        ★
      </button>
    ))}
  </NodeViewWrapper>
);

export const Rating = Node.create({
  name: 'rating',
  group: 'block',
  atom: true,
  addAttributes: () => ({ value: { default: 0 } }),
  parseHTML: () => [{ tag: 'div[data-type="rating"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'div',
    mergeAttributes(HTMLAttributes, { 'data-type': 'rating' }),
  ],
  addNodeView: () => ReactNodeViewRenderer(RatingView),
});
```

把它和其他扩展一起注册，添加一个运行 `editor.commands.insertContent({ type: 'rating' })` 的 `RichTextToolbarButton`，如果需要的话再加一个斜杠命令条目（参见 [SlashCommand](/zh/extensions/SlashCommand/)）。`renderHTML` 就是 `getHTML()` 所保存的内容，因此保存下来的形式完全由你决定。

## 保存

文档可以以 HTML（`editor.getHTML()`）、JSON（`editor.getJSON()`）、纯文本、Markdown（[ExportMarkdown](/zh/extensions/ExportMarkdown/)）或 Word（[ExportWord](/zh/extensions/ExportWord/)）的形式获取。JSON 可以精确地往返转换；HTML 是大多数后端存储的形式。自动保存就是带防抖的 `onUpdate`：

```ts
const editor = useEditor({
  extensions,
  content,
  onUpdate: debounce(({ editor }) => {
    void api.save({ html: editor.getHTML(), json: editor.getJSON() });
  }, 800),
});
```

有两件事值得在保存时特别处理：

- **图片。** 上传发生在保存之前，因此被删除的图片会留下文件残留。`getImageChanges(editor)` 列出需要删除的内容，`markImagesSaved(editor)` 记录基准状态——参见 [Image › 上传与已删除图片](/zh/extensions/Image/#uploads-and-deleted-images)。
- **只读。** 在长时间保存或回放过程中，`editor.setEditable(false)` 可以防止文档在此期间被改动。

## 回放

[Recorder](/zh/extensions/Recorder/) 会把每一次编辑记录为带时间戳的 ProseMirror 步骤。将录制结果与文档一起保存，`replayRecording(editor, recording, { speed: 4 })` 就能把这次编辑过程回放出来——无论是想看一段文字是如何形成的、审阅时谁改了什么，还是触发某个 bug 的确切操作顺序。
