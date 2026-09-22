<p align="center">
  <img src="https://api.iconify.design/ic:round-wysiwyg.svg?color=%237c3aed" alt="RichKit" width="88" />
</p>

<h1 align="center">RichKit</h1>

<p align="center">
  A composable rich-text editor SDK for React, built on Tiptap.<br/>
  Toolbar, bubble menus, slash commands, AI, tables, code, images, 16 languages, session replay.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/richkit"><img src="https://img.shields.io/npm/v/richkit.svg" alt="npm" /></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT" /></a>
  <a href="./README.zh-CN.md">中文文档</a>
</p>

![Screenshot](./screenshot/screenshot.png)

## Why RichKit

- **Composable.** You create the Tiptap editor, pick the extensions, and place the React controls where you want them. Nothing is hidden behind a monolithic component.
- **Complete.** 50+ extensions: headings, lists, tables with rounded corners and caret exit, code blocks with language detection, images with cropping, captions and upload tracking, dividers with editable captions, columns, callouts, details, Katex, Mermaid, Excalidraw, video, iframe, attachments, emoji, mentions, table of contents, search & replace, import/export to Word, PDF and Markdown.
- **AI built in.** Streaming answers rendered through the editor schema — tables, code blocks and lists appear as real nodes — plus "describe it" generation for LaTeX and Mermaid. Bring your own model, proxy or transport.
- **Pastes right.** Web pages, Excel, Google Docs and Word keep their formatting; Word's fake lists become lists and code from VS Code becomes a code block.
- **16 languages** ordered by speaker population, loadable on demand. Chinese, Japanese, Korean, Devanagari and Bengali font stacks appear when the UI or the document needs them.
- **Record and replay** any writing session as timestamped steps.
- **Styled, not styled-in.** Tailwind classes are prefixed (`richtext-`) and theming is a handful of CSS variables, so the editor drops into any design system.

## Install

```bash
pnpm add richkit @tiptap/react @tiptap/pm @tiptap/extension-document @tiptap/extension-paragraph @tiptap/extension-text
```

Keep every `@tiptap/*` package on one version (this repository uses `^3.29`).

## Quick start

```tsx
import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider, RichTextToolbar, RichTextToolbarDivider } from 'richkit';
import { Bold, RichTextBold } from 'richkit/bold';
import { Heading, RichTextHeading } from 'richkit/heading';
import { Table, RichTextTable } from 'richkit/table';
import { RichTextBubbleText } from 'richkit/bubble/text';
import 'richkit/style.css';

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

Every feature is one import: the extension and its control come from the same subpath (`richkit/<feature>`), bubble menus from `richkit/bubble/<name>`, languages from `richkit/locales/<code>`.

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

RichKit started as a fork of [reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor) by hunghg255 and its contributors, and has since been reworked extensively. Thank you to them and to the [Tiptap](https://tiptap.dev) and [shadcn/ui](https://ui.shadcn.com/) projects.

## License

[MIT](./LICENSE)
