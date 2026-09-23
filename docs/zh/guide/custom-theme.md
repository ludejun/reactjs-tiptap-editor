---
description: 自定义主题

next:
  text: 迁移指南
  link: /zh/guide/how-to-migrate.md
---

# 自定义主题

使用 theme action 来控制编辑器的浅色/深色外观、强调色以及圆角。在应用你自己的布局样式之前，先引入一次编辑器样式表。

## 设置初始主题

在客户端初始化时，或者在你应用的主题切换处理函数中运行这些 action：

```ts
import { themeActions } from 'ai-sparkwrite-editor/theme';

// These settings apply to the library's editor UI and dialogs.
themeActions.setTheme('dark');
themeActions.setColor('blue');
themeActions.setBorderRadius('0.5rem');
```

| 设置 | 支持的取值                                                                              | 默认值      |
| ---- | --------------------------------------------------------------------------------------- | ----------- |
| 主题 | `'light'`、`'dark'`                                                                     | `'light'`   |
| 颜色 | `'default'`、`'red'`、`'blue'`、`'green'`、`'orange'`、`'rose'`、`'violet'`、`'yellow'` | `'default'` |
| 圆角 | CSS 长度值，例如 `'0px'` 或 `'0.5rem'`                                                  | `'0.65rem'` |

这些设置由所有编辑器实例及其通过 portal 挂载的对话框共享。它们不是逐个编辑器的属性，本库也不会在页面刷新后持久化这些设置。如有需要，请通过你自己的应用状态来恢复偏好设置。

## 添加主题切换按钮

```tsx
import { themeActions, useTheme } from 'ai-sparkwrite-editor/theme';

export function EditorThemeToggle() {
  const { theme } = useTheme();

  return (
    <button
      type='button'
      onClick={() => themeActions.setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      Switch to {theme === 'dark' ? 'light' : 'dark'} mode
    </button>
  );
}
```

`useTheme()` 还会返回 `color` 和 `borderRadius`。请在 React 组件内部调用它。在 Vue 中，把 `dark` 传给 `RichTextProvider`；调色板变量位于 `.sparkwrite` 之上，可以在 CSS 中覆盖。要让编辑器跟随你宿主应用的外观变化，请在该应用主题变化时调用 `setTheme`。

::: tip 从旧版编辑器迁移
当前 provider 的类型仍然接受 `dark`，但其实现并不会应用它。请使用 `themeActions.setTheme`，而不是 `<RichTextProvider dark={...}>`。
:::

## 为文档区域设置样式

在你现有编辑器中，给 `EditorContent` 加一个 class：

```tsx
<EditorContent editor={editor} className='article-editor' />
```

然后在应用 CSS 中定义你的布局：

```css
.article-editor .tiptap {
  min-height: 240px;
  padding: 1rem;
}
```

请使用限定在编辑器范围内的选择器，以免这些规则影响到页面其他无关内容。主题颜色作用于界面；通过 Color 扩展应用的行内文字颜色仍然是文档内容的一部分。

图表和绘图工具可能需要额外的样式表。启用这些功能时，请遵循 [KaTeX](/zh/extensions/Katex/)、[Drawer](/zh/extensions/Drawer/) 和 [Excalidraw](/zh/extensions/Excalidraw/) 的设置说明。
