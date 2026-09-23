# 包体积

每个功能都是自己的一个分块，主入口 `ai-sparkwrite-editor` 只是把它们转出，因此在会 tree-shake ES 模块的打包器（Vite、Rollup、webpack、esbuild）里，从主入口引入 `Bold` 和从 `ai-sparkwrite-editor/bold` 引入得到的产物字节数完全相同（我们用 Vite 打包对比过，二者一致）。功能子路径（`/bold`、`/table`、`/image`、`/bubble/table`……）仍然保留，供不做 tree-shake 的工具使用。宿主应用只需为自己引用的功能付出体积代价；用 `RichTextKit` 全量注册时，库自身代码约 280 KB（gzip 后），Excalidraw、Mermaid、Katex、Word 导入导出等重型依赖在首次使用时才加载。本页列出每个入口的体积开销、所有入口共享的部分，以及维持这一点的两条规则。

## 一个功能要花多少体积

从某个入口可达的、库自身 JavaScript 的字节数（压缩后、gzip 前），通过 `pnpm measure:entries` 在 `lib/` 目录下的 chunk 依赖图上测得。React、Tiptap、Radix 和 `lucide-react` 是 peer/运行时依赖，不计入其中；语言包表（`en`，14 KB）则计入，因为每个控件都会从中读取自己的提示文字。

| 入口                        | 优化前              | 优化后                   | Lucide 图标数（优化前 → 优化后） |
| --------------------------- | ------------------- | ------------------------ | -------------------------------- |
| `ai-sparkwrite-editor/bold` | 88 KB，16 个 chunk  | **30 KB**，17 个 chunk   | 87 → 1                           |
| `/heading`                  | 98 KB，18 个 chunk  | **39 KB**，19 个 chunk   | 90 → 3                           |
| `/table`                    | 97 KB，18 个 chunk  | **39 KB**，19 个 chunk   | 87 → 1                           |
| `/image`                    | 135 KB，27 个 chunk | **77 KB**，29 个 chunk   | 88 → 6                           |
| `/ai`                       | 227 KB，28 个 chunk | **169 KB**，29 个 chunk  | 95 → 15                          |
| root（provider + 工具栏）   | 175 KB，33 个 chunk | **124 KB**，36 个 chunk  | 88 → 6                           |
| `/bubble`（全部气泡菜单）   | 512 KB，95 个 chunk | **465 KB**，106 个 chunk | 109 → 92                         |

`core`/`vue` 未列在表中：它们的体积主要取决于框架无关层上的并行开发进度，而不是本页讨论的内容。

`lucide` 这一列统计的是某个构建包所引入的、各不相同的 Lucide 图标数量。优化前，每个入口都会引入全部约 90 个图标；打包工具无法剔除某个在运行时通过名称、从一张包含所有图标的映射表中查找出来的图标。

## 所有入口共享的部分

单个控件的体积底线大约是 30 KB：

- `en` 语言包（14 KB）——默认的提示文字，始终存在，使一个控件无需任何配置即可渲染；
- 带有 tooltip/toggle 基础功能的 `ActionButton`（约 5 KB）；
- 语言和可编辑状态的 store（约 4 KB，纯粹基于 `useSyncExternalStore`）；
- 图标注册表本身，只保存共享的下拉箭头图标（约 1 KB）。

以下这些曾经位于这个体积底线之内，现在已不再是：

- `cn` 包（31 KB）：一个编译后的 clsx + tailwind-merge。本库的类名带有 `richtext-` 前缀，tailwind-merge 从未识别过这种前缀，因此它其实只是在拼接字符串。一个 20 行、具有 clsx 语义的本地 `cn` 实现就能做到同样的事。
- 图标映射表（我们自己代码的 24 KB，加上每一个 Lucide 图标）：已被一个由各功能在加载时自行填充的注册表取代——见下文。
- `reactjs-signal` / `alien-signals`（7 KB）：可编辑状态和斜杠命令的 store 现在直接使用 `useSyncExternalStore`。

## 图标是如何做到可 tree-shake 的

图标通过名称寻址（`button()` 配置中的 `icon: 'Table'`、斜杠命令中的 `iconName`、`<RichTextToolbarButton icon='Save'>`），并从一个注册表中解析出来。这个注册表起初几乎是空的；每个 React 控件会在其模块加载时，注册它自己绘制所用到的图标：

```ts
// src/extensions/Table/components/RichTextTable.tsx
import { TableIcon } from 'lucide-react';
import { registerIcons } from '@/components/icons/icons';

registerIcons({ Table: TableIcon });
```

因此，引入 `ai-sparkwrite-editor/table` 只会带来 Table 图标，别无其他。编辑器自身的 SVG 图标（Mermaid、Excalidraw、导出/导入图标……）也是同样的道理：它们由各自的功能负责注册，而不是发送给每一个人。

这对宿主应用有两点影响：

- 自定义的名称必须在渲染之前完成注册——在模块作用域下调用 `registerIcons({ Save })`。参见 [自定义 → 图标](/zh/guide/customization#icons)。
- 一个按名称渲染另一个功能按钮的组件，必须引入该功能的控件，或者自行注册对应的名称。气泡菜单正是这样做的：`RichTextBubbleTable` 会注册它所列出的行/列图标，因此仅靠 Table _扩展_ 本身它就能正常工作。

`tests/icon-registry.test.mjs` 会从每一个公开入口出发，遍历源码模块依赖图，一旦某个图标名称在从未注册它的依赖图中被使用，就会报错。

## Tree-shaking 相关说明

- `package.json` 只为 CSS 和语言包合集声明了 `sideEffects`。其余部分作为*模块*都是无副作用的，因此打包工具可以跳过那些你没有使用其导出内容的入口文件。`registerIcons` 调用存在于你所渲染的那些导出所在的组件模块中，因此只要该控件存在，这些调用就会一并保留下来。
- 较重的运行时依赖（`katex`、`mermaid`、`@excalidraw/excalidraw`、`docx`、`mammoth`、`react-image-crop`……）都是外部依赖：它们通过你的打包工具加载一次，并且只在用到它们的入口中加载。
- `react-tweet` 是有意打包进来的：它的 ESM 引入了 CSS 模块，而这只有打包工具才能解析。如果把它作为外部依赖，会导致 `twitter` 相关入口在没有打包工具的环境（SSR、测试）中失败。它位于 Twitter 节点视图自己的 chunk 中；rolldown 也把它的模块互操作辅助代码放在了那里，因此任何需要用到该辅助代码的入口（截至目前是 `ai`、`core`）都会引入这个 chunk，却并不会用到推文嵌入本身——这是一种打包产物，而不是真正的依赖关系。
- 根入口（`ai-sparkwrite-editor`）只导出 provider 和工具栏的构建块；各项功能都来自它们自己的入口，因此引入根入口并不会拉入每一个功能。

## 测量

```sh
pnpm build:lib
pnpm measure:entries            # the default set of entries
pnpm measure:entries Bold.js    # one entry, with its largest chunks
```

该脚本会汇总某个入口可达的 `lib/` chunk 体积，并列出它引入的外部包；它不包含这些外部依赖自身的体积。
