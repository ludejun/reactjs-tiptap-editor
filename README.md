<p align="center">
  <img src="./docs/public/logo.svg" alt="SparkWrite" width="96" />
</p>

<h1 align="center">SparkWrite</h1>

<p align="center">
  <b>Tell the editor what you want. It writes it, right there in the page.</b><br/>
  An AI-first rich-text editor SDK on Tiptap: prose, tables, code, task lists, formulas and diagrams are produced by the model and land in the document as real, editable blocks.<br/>
  Streaming, undoable, in 16 languages. React and Vue UIs on one framework-free core.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/ai-sparkwrite-editor"><img src="https://img.shields.io/npm/v/ai-sparkwrite-editor.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/">Docs</a> ·
  <a href="https://ludejun.github.io/ai-sparkwrite-editor/playground/">Live playground</a> ·
  <a href="./README.zh-CN.md">中文文档</a>
</p>

![Screenshot](./screenshot/screenshot.png)

## Why this editor

Most editors treat AI as a chat window next to the document. Here the model works _in_ the document: you describe, it writes; you select, it rewrites; you pause, it finishes the sentence. Formatting is never pasted — every answer is parsed through the editor's own schema, so a table is a table and a code block is a code block, ready to keep editing.

**What the AI does for you**

| You                                             | The editor                                                                                                                       |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Type a request in the composer under the editor | Streams the answer into the page as headings, lists, tables, code; Keep, Undo, Retry or refine in place                          |
| Click a chip                                    | Continues writing, summarizes, outlines, suggests a title, extracts action items, fixes grammar or translates the whole document |
| Select text → Improve                           | Rewrites, shortens, expands, simplifies, changes tone, explains, translates, turns it into a table or a list                     |
| Press Space on an empty line                    | Opens Ask AI at the caret                                                                                                        |
| Pause while typing                              | Proposes the next words in grey; Tab accepts                                                                                     |
| Describe a formula or a flow                    | Writes the LaTeX or Mermaid source and renders it live                                                                           |

**Under the hood**

- **Writes into the document, not a chat box.** A composer dock under the editor (toolbar ✨, `⌘J`, `/ai`) streams the answer straight into the page as real blocks — a markdown table becomes _the editor's_ table, a fenced block a code block, `- [ ]` a task list. Keep, undo, retry or refine in place; one undo step.
- **Knows the whole document.** Continue writing, summarize, outline, suggest a title, extract action items, fix grammar everywhere, translate — one click each, with the document as context.
- **Finishes your sentence.** Ghost-text autocomplete after a pause; Tab accepts. Space on an empty line asks AI. Select text for Improve: rewrite, shorten, translate, turn into a table or a list.
- **Generates what you cannot type.** Katex and Mermaid dialogs take a sentence ("the quadratic formula", "a login flow") and write the source, live.
- **Your model, your rules.** OpenAI or Anthropic protocol, any base URL or proxy, or your own `generate(request, onChunk)` transport. Translate to the browser language, refine with a follow-up, attach images and files.
- **Yours to render.** `renderResult` restyles the answer; `components.Panel` replaces the whole dialog.

**And everything else a document needs**

- **Composable.** You create the Tiptap editor, pick the extensions, and place the React controls where you want them — one import per feature.
- **Complete.** 50+ extensions: headings, lists, tables with rounded corners and caret exit, code blocks with language detection, images with cropping, captions and upload tracking, dividers with editable captions, columns, callouts, details, Katex, Mermaid, Excalidraw, video, iframe, attachments, emoji, mentions, table of contents, search & replace, Word/PDF/Markdown import and export.
- **Pastes right.** Web pages, Excel, Google Docs and Word keep their formatting; Word's fake lists become lists and code from VS Code becomes a code block.
- **16 languages** ordered by speaker population, loadable on demand, with matching CJK, Devanagari and Bengali fonts.
- **Record and replay** any writing session as timestamped steps.
- **React and Vue.** The document logic — AI engine included — ships React-free as `ai-sparkwrite-editor/core`; `ai-sparkwrite-editor/vue` adds a Vue 3 provider, toolbar, controls, bubble menus, dialogs, node views and the AI panel and composer on the same stylesheet. The playground switches between the two. See [Frameworks](./docs/guide/frameworks.md).
- **Fits your design system.** Prefixed Tailwind classes and a handful of CSS variables.

## Install

```bash
pnpm add ai-sparkwrite-editor @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

Keep every `@tiptap/*` package on one version (this repository uses `^3.29`).

## Quick start

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'ai-sparkwrite-editor';
import { Bold, RichTextBold } from 'ai-sparkwrite-editor/bold';
import { Heading, RichTextHeading } from 'ai-sparkwrite-editor/heading';
import { Table, RichTextTable } from 'ai-sparkwrite-editor/table';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

export function Editor() {
  const editor = useEditor({
    extensions: [Document, Paragraph, Text, Bold, Heading, Table],
    content: '<p>Hello</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextToolbar>
        <RichTextHeading />
        <RichTextToolbarDivider />
        <RichTextBold />
        <RichTextTable />
      </RichTextToolbar>
      <RichTextBubbleText />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

Every feature is one import: the extension and its control come from the same subpath (`ai-sparkwrite-editor/<feature>`), bubble menus from `ai-sparkwrite-editor/bubble/<name>`, languages from `ai-sparkwrite-editor/locales/<code>`.

## Documentation

The `docs/` folder is a VitePress site (`pnpm docs:dev`). Start with:

- [Getting started](./docs/guide/getting-started.md) — install, minimal editor, composing the UI
- [Features](./docs/guide/features.md) — every extension, its import path and main options
- [Toolbar](./docs/guide/toolbar.md) and [Customization](./docs/guide/customization.md) — custom menus, custom blocks, saving, replay
- [Bubble menus](./docs/guide/bubble-menu.md) · [Internationalization](./docs/guide/internationalization.md)
- [AI](./docs/extensions/AI/index.md) — providers, streaming, markdown rendering, custom panels

## Playground

```bash
pnpm install
pnpm build:lib
pnpm playground
```

The playground imports the built `lib/`; rebuild after changing `src/`. Without an API key the AI menu answers with a demo so the whole flow can be tried.

## Development

```bash
pnpm type-check   # library types
pnpm lint         # oxlint
pnpm build:lib    # library
pnpm docs:build   # documentation site
pnpm exec esno --test tests/ai-client.test.ts tests/locale-loading.test.ts tests/word-export.test.ts
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the commit convention and how fixes from the original project are brought in.

## Origin

SparkWrite started as a fork of [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor) by hunghg255 and its contributors, and has since been reworked extensively. Thank you to them and to the [Tiptap](https://tiptap.dev) and [shadcn/ui](https://ui.shadcn.com/) projects.

## License

[MIT](./LICENSE)
