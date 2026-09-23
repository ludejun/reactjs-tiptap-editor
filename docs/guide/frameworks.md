# Frameworks

The editor is Tiptap underneath, and Tiptap is framework-agnostic: the same extensions run in React, Vue, Svelte or a plain page through their respective bindings. What is React-specific here is the **UI** — toolbar controls, bubble menus, dialogs, and the node views that make blocks like the divider or the code block interactive inside the document.

The package is therefore split in two layers:

| Layer | Import                                                                                    | Depends on React | Contents                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----- | ----------------------------------------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Core  | `ai-sparkwrite-editor/core`                                                               | No               | Every extension without its node view (marks, headings, lists, tables, links, alignment, indent, font, colour, divider, code block, callout, details, video, iframe, images and GIFs, Katex, Mermaid, attachment, table of contents…; columns, Excalidraw, drawer, Twitter and the suggestion popups — mention, short message, emoji, slash commands — stay in the React layer), paste rules, search & replace, recorder, the AI transport and markdown rendering, image bookkeeping, translations |
| React | `ai-sparkwrite-editor`, `ai-sparkwrite-editor/<feature>`, `ai-sparkwrite-editor/bubble/*` | Yes              | Everything above plus controls, bubble menus, dialogs and node views                                                                                                                                                                                                                                                                                                                                                                                                                               |

A build check (`tests/core-headless.test.mjs`) walks the chunk graph of the core bundle and fails if anything reachable from it imports `react`, `@tiptap/react`, Radix or lucide.

## Vue

Two imports: `ai-sparkwrite-editor/core` for the extensions and `ai-sparkwrite-editor/vue` for the UI. The Vue layer ships a provider, composables, toolbar primitives, ready-made controls for the core extensions, and Vue node views for the blocks (divider, code block, callout, image, GIF, iframe, Katex, Mermaid, attachment, table of contents). It depends only on `vue`, `@tiptap/vue-3` and `lucide-vue-next`, and shares the stylesheet with the React controls, so both toolbars look the same.

```bash
pnpm add ai-sparkwrite-editor @tiptap/vue-3 @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text lucide-vue-next
```

```vue
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  Bold,
  Heading,
  BulletList,
  ListItem,
  Table,
  TextAlign,
  RichPaste,
  localeActions,
} from 'ai-sparkwrite-editor/core';
import {
  Divider, // core divider + Vue node view
  CodeBlock, // core code block + Vue node view; same for Image, Callout, Katex…
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextHeading,
  RichTextBold,
  RichTextBulletList,
  RichTextTable,
  RichTextTextAlign,
  RichTextDivider,
} from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

import zhCN from 'ai-sparkwrite-editor/locales/zh-cn';

localeActions.setMessage('zh_CN', zhCN); // only English is bundled
localeActions.setLang('zh_CN');

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Heading,
    BulletList,
    ListItem,
    Table,
    TextAlign,
    Divider,
    CodeBlock,
    RichPaste,
  ],
  content: '<p>你好</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar>
      <RichTextHeading />
      <RichTextToolbarDivider />
      <RichTextBold /><RichTextBulletList /><RichTextTextAlign />
      <RichTextToolbarDivider />
      <RichTextTable /><RichTextDivider />
    </RichTextToolbar>
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

`RichTextProvider` renders the root element with the `ai-sparkwrite-editor` class and hands the editor to every control below it. The example under `examples/vue` in the repository is this page with every control on it (`pnpm --dir examples/vue dev`).

### What the Vue layer contains

| Kind                     | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Provider and composables | `RichTextProvider`, `useEditorInstance()`, `useEditorState(selector, fallback)`, `useLocale()`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Toolbar primitives       | `RichTextToolbar`, `RichTextToolbarDivider`, `RichTextToolbarButton`, `RichTextDropdown`, `RichTextToolbarMore`, `RichTextToolbarMoreGroup`, `RichTextToolbarMoreRow`                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Controls                 | Undo/redo, bold, italic, underline, strike, code, clear, heading, bullet/ordered/task list, blockquote, text align, link (popover), table, divider, color, highlight, font size, line height, indent/outdent, code block, callout, details, table of contents, image (upload or URL), video, attachment, iframe, Katex and Mermaid (dialogs with live preview and one-line AI generation) — the same names as the React controls                                                                                                                                                                                                             |
| Node views               | `Divider` (style picker, editable caption), `CodeBlock` (language picker, copy, delete), `Callout`, `Image` + `ImageBlock` (resize handles, caption, flip and rotation), `ImageGif`, `Iframe` (URL prompt, resize, edit link), `Katex` (renders with the extension's `loadKatex` or `import('katex')`), `Mermaid`, `Attachment` (file picker, upload state, file card), `TableOfContents` + `TableOfContentsNode` (live heading list). Each is `<Name>Core.extend({ addNodeView })` with the same DOM and CSS as the React one; the components are exported as `<Name>NodeView`, and `useImageResize` is the shared corner-handle composable |

Your own control is a `RichTextToolbarButton` with an `onClick` that runs a command, or a `RichTextDropdown` with items; `useEditorState` gives it reactive `isActive`/`can()` state.

### Not in Vue yet

Excalidraw and the drawer (they wrap React-only libraries), the Twitter embed (`react-tweet`), columns, the search-and-replace panel, and the suggestion popups — emoji, mention, short message and the `/` slash menu — still render with React. Their extensions work wherever they are framework-free; only those affordances are missing in Vue. Details and video have no node view in either layer: they render through `renderHTML` and live in `ai-sparkwrite-editor/core`.

## Plain JavaScript

```ts
import { Editor } from '@tiptap/core';
import { Bold, Heading, Table, RichPaste } from 'ai-sparkwrite-editor/core';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [/* Document, Paragraph, Text, */ Bold, Heading, Table, RichPaste],
});
```

## What stays React-only today

- Node views that wrap React libraries: Excalidraw, drawer, Twitter.
- The suggestion popups (emoji, mention, short message, slash menu), columns, and the search-and-replace panel.

Each is a thin layer over a command or an attribute the core already exposes, so a Vue port is UI work, not editor work; the slash menu is the one most worth doing next.

## Adding a framework-free extension

Keep the extension module (`src/extensions/<Name>/<Name>.ts`) free of component imports and re-export components from the folder's `index.ts` only; the build makes the React entry from `index.ts` and the core entry from the extension module, so the two never share a React-bearing chunk. Then export it from `src/core.ts` and run the headless check.

An extension with a node view is split in three: `<Name>.ts` exports `<Name>Core` (no node view), `<Name>React.ts` exports `<Name>` = `<Name>Core.extend({ addNodeView: ReactNodeViewRenderer(...) })` and is what `index.ts` re-exports, and `src/vue/nodeviews/<Name>.ts` exports `<Name>` = `<Name>Core.extend({ addNodeView: VueNodeViewRenderer(...) })`. Helpers both node views need (caption detection, language lists, file icons, the heading list) live in framework-free files next to the extension, never in a `.tsx`.

## AI, bubble menus and dialogs in Vue

Everything below comes from `ai-sparkwrite-editor/vue` and shares its stylesheet, class names and prompts with the React layer.

**AI.** Register `AI` (the core extension with the Vue panel mounted through `VueRenderer`) and, optionally, `AIAutocomplete` for ghost-text suggestions. Its options are the core `AIOptions` plus `renderResult(context)` to draw the answer yourself and `components.Panel` to replace the whole dialog. Then place the components:

- `RichTextAI` — the toolbar button (Sparkles + "AI", `aria-pressed` while the dock is open); toggles the composer, as `Mod-J` does.
- `RichTextAIComposer` — the dock under `EditorContent`: quick-action chips from `AI_COMPOSER_ACTIONS`, a prompt with a target select (selection, cursor, top, end, whole document), streaming straight into the document through `writeWithAI`, then Keep / Undo / Retry and refinement with the conversation history. Props: `actions`, `defaultOpen`.
- `RichTextAIImprove` — the selection menu of the text bubble: edit (improve, grammar, shorter, longer, simplify), change tone, generate (summarize, explain, table, list), translate to the browser language (or the configured `translateLanguages`), ask anything, open the composer. Each entry opens the AI panel on the selection captured when the menu opened.
- `AIPanel` — the panel component itself, for a custom `mountPanel`.

The framework-free pieces are re-exported so one import covers a Vue app: `AICore`, `AIAutocomplete`, `aiPluginKey`, `aiAutocompleteKey`, `writeWithAI`, `aiOptionsOf`, `resolveWriteTarget`, `documentContext`, `generateAIText`, `AI_COMPOSER_ACTIONS`, `composerPrompt`, `browserLanguage`, `markdownToHTML`, `markdownToFragment`, `markdownToSlice`, `markdownToPreviewHTML`, `DEFAULT_AI_SYSTEM_PROMPT`, and the `AI*` types.

```vue
<script setup lang="ts">
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/vue';

const editor = useEditor({
  extensions: [
    ,
    /* … */ AI.configure({ model: 'gpt-4o-mini', apiKey: () => fetchKey() }),
    AIAutocomplete,
  ],
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextToolbar><!-- … --><RichTextAI /></RichTextToolbar>
    <EditorContent :editor="editor" />
    <RichTextAIComposer />
  </RichTextProvider>
</template>
```

**Bubble menus.** Built on `BubbleMenu` from `@tiptap/vue-3/menus`; place them anywhere inside `RichTextProvider`.

- `RichTextBubbleText` — over a text selection (not in code blocks, hidden while an AI panel is open): `RichTextAIImprove`, the paragraph/heading dropdown, bold, italic, underline, strike, code, link, colour, highlight, alignment. Put your own buttons in the default slot to replace them.
- `RichTextBubbleTable` — a right click inside a table opens a context menu: insert/delete rows and columns, merge/split cells, "Paragraph after table" with its shortcut, delete table. `hiddenActions` leaves entries out.
- `RichTextBubbleLink` — while the caret is in a link: the address, open, edit (text, address, new tab), unlink.
- `RichTextBubbleImage` — when an image is selected: align left/centre/right, S/M/L sizes, remove.

`BUBBLE_CLASS`, `BUBBLE_OPTIONS` and `useBubbleEditor()` are exported for a bubble menu of your own.

**Dialogs and controls.** `RichTextLink` opens a popover (text, address, open in new tab; unlink when in a link) and `RichTextLinkForm` is that form on its own. `RichTextImage` and `RichTextVideo` open a dialog with a drop zone (the extension's `upload`, `acceptMimes`, `maxSize`, `multiple`, `onError` are honoured; uploads are remembered for `getImageChanges`) and an address field; `RichTextKatex` and `RichTextMermaid` open a dialog with the source, a live preview and — when the AI extension is registered — a one-line "describe it" prompt (`RichTextAIGenerateField`). `RichTextIframe` and `RichTextCallout` are popovers; `RichTextAttachment` picks a file and uploads it through the extension's `upload`; `RichTextCodeBlock`, `RichTextDetails`, `RichTextTableOfContents`, `RichTextIndent` and `RichTextOutdent` run their command; `RichTextColor` and `RichTextHighlight` open a palette (the extension's `colors`, else the default list, plus a native picker); `RichTextFontSize` and `RichTextLineHeight` are dropdowns over the configured lists.

The primitives behind them are exported too: `RichTextPopover` (a toolbar button with a panel; the slot receives `{ close }`), `RichTextDialog` (`open` / `update:open`, `title`, `footer` slot) and `useDismiss(open, root, close)` for outside-click and Escape handling. Search and replace has no Vue control yet.
