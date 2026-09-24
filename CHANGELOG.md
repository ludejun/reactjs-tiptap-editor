# Changelog

All notable changes to ai-sparkwrite-editor are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## Unreleased

### Added

- `Notice`: info, success, warning and tip boxes holding ordinary editable blocks, saved as `<div class="notice" data-type="…">`. Toolbar dropdown and bubble menu in React and Vue, one slash-menu row with the four types inline, Markdown export as GitHub-style alerts, part of `RichTextKit`.

### Fixed

- `RichTextKit` registers `TextStyle`, so picking a font family, font size, colour or line height works in the kit (it threw "There is no mark type named 'textStyle'" and the menu appeared stuck).
- The link edit card no longer shares the screen with the text bubble, stays anchored to its link instead of following the caret, sits above the block drag handle, and closes on a click elsewhere.
- Links keep the surrounding text's weight; only the colour marks them.
- The heading and font pickers keep a fixed width, so changing a block's level no longer shifts the toolbar.
- Code View toggles inside one transaction instead of throwing "Applying a mismatched transaction".

### Changed

- Font family menu: the fonts of the interface language's script (微软雅黑, 宋体… under a Chinese UI) come right after Default, before the Latin fonts, each group separated by a hairline.
- Kit toolbar: tighter spacing so the default row fits a 1024px column on one line (the "⋯" trigger keeps its place at the right end of the last row when it does wrap); pinned controls show a small remove badge on hover and are listed in an "On the Toolbar" group at the bottom of the panel with a remove button; the drag hint moved below the groups. Code block line numbers are smaller (0.75em) and lighter, still on the code's line grid.

## 1.0.1 — 2026-09-23

### Fixed

- The docs site's favicon and touch icons resolve under the GitHub Pages base path.

- The link bubble no longer disappears when the pointer moves from the link onto its buttons (the editor's `mouseleave` fired after the menu's `mouseenter` and restarted the hide timer).
- Code block line numbers share the code's font and size, so every number sits on its line; the language picker, copy and delete controls are smaller and quieter.
- The table context menu is wider so "Paragraph After Table ⌘Enter" stays on one line; the kit's "More tools" panel shows one control per row (indent and outdent were overlapping their label).

### Added

- **Cell background colour** in the table context menu (React and Vue): a palette, "No Fill" and a free colour input.
- The kit toolbar's panel is three columns with related controls side by side, and its rows can be **dragged onto the toolbar to pin them** (drag back to unpin); pins persist in `localStorage` (`pinnable`, `defaultPins`, `storageKey`). Blockquote moved to the main row; `RichTextIndent` takes `only='indent' | 'outdent'`.
- Links use `#2f54eb` (`#597ef7` in dark mode), overridable with `--richtext-link` / `--richtext-link-dark`.

## 1.0.0 — 2026-09-23

First release of `ai-sparkwrite-editor`. The code base descends from reactjs-tiptap-editor 1.0.46 and was reworked extensively before this release; the history before this point lives in the `archive/reactjs-tiptap-editor` branch.

### Editing

- **Tables** follow the editor radius, shrink to their columns, and let the caret out: click beside or below a table, press ⌘/Ctrl+Enter, or use the context menu entry. Cells draw one edge each so the grid stays 1px with `border-collapse: separate`.
- **Dividers** replace the horizontal rule: line, dashed, dotted, double, short, three dots, stars, a rule with editable text, and a numbered rule that renumbers itself. Saved HTML keeps an `<hr>` inside for exports and unstyled contexts.
- **Headings** have smaller top margins and a click in the gap above a block goes to that block instead of the previous paragraph.
- **Slash menu** lists Insert (table, code block, image, divider) before Format; rarely used blocks appear only when searched, with a hint saying so. Opening the menu no longer scrolls the page.
- **Rich paste** rebuilds Word's list paragraphs as real nested lists and inserts code copied from VS Code, Sublime, Xcode or JetBrains as a code block with a guessed language.
- **Code blocks** get a React node view with a language picker and a signature-based detector that recognises JavaScript, TypeScript, Python, CSS and Rust; syntax colours follow a GitHub light/dark palette.
- **Images** share one source picker between toolbar and slash command, gain numbered captions and a rotate control, accept every browser image format, and report removed and orphaned uploads at save time (`getImageChanges`, `markImagesSaved`).
- **Links** open their bubble on hover. The code block and column bubbles are removed in favour of node views.
- **Drag handle** no longer refocuses and scrolls the page when the pointer returns to a blurred editor.

### AI

- **Composer dock** (`RichTextAIComposer` + the `RichTextAI` toolbar button, `⌘/Ctrl+J`, `/ai`): a prompt bar under the editor whose answers stream straight into the document as real blocks. Presets for the whole document — continue writing, summarize, outline, suggest a title, extract action items, fix grammar everywhere, translate — plus a target selector (selection, caret, top, end, whole document). Keep, undo, retry or refine in place; the answer is one undo step. Images and text files can be attached to a prompt (paperclip, drop or paste), as in the panel.
- Multi-block selections and the whole document reach the model as **Markdown** (the editor's own export), so "fix grammar everywhere" or "translate document" keep every heading, table and code block. `serializeDocument` overrides the serializer.
- The playground's stand-in model transforms the real text — fixes the page's typos, tabulates the selection, outlines the headings — so every AI entry can be tried without a key.
- `composer: false` on the AI extension removes the dock together with its toolbar button, shortcut, slash entry and menu item; the dock takes `actions`, `showTarget`, `hint`, `placeholder`, `rows`, `gradient`, `accent` props. Chips sit on one line with a `+N` menu for the rest; hovering shows the prompt.
- English tooltip and menu labels use Title Case throughout ("AI Composer", "Fix Grammar Everywhere").
- **`endpoint`** — the frontend configures one URL on your backend and nothing else. The editor POSTs `{ messages, systemPrompt, stream, maxTokens }` as JSON and reads `{ text }` or a `text/event-stream` of `{ text }` deltas; OpenAI/Anthropic responses piped through unchanged are understood too. `protocol` / `model` / `apiKey` stay for direct provider calls, `generate` for custom transports.
- **`writeWithAI(editor, { prompt, target })`**, the framework-free engine behind the dock: streams Markdown into a tracked span that follows other edits, and returns `keep()`/`discard()` and the conversation for follow-ups.
- **Ghost-text autocomplete** (`AIAutocomplete`): after a pause at the end of a block the next words appear in grey; Tab accepts.
- **Space on an empty line** opens Ask AI (`spaceTrigger`).
- The Improve menu gains **Turn into table**, **Turn into list** and **Open AI composer**, and works after Select All.
- The extension is split into a framework-free `AICore` (commands, state, decorations, `mountPanel` hook) and thin React/Vue layers; `ai-sparkwrite-editor/core` exports the headless `AI`.
- Answers stream (OpenAI and Anthropic server-sent events, or a custom `generate` with `onChunk`).
- Answers are markdown, rendered through the editor schema: the preview is the exact HTML the editor would save, and Apply inserts real nodes. Single paragraphs merge into the current paragraph.
- Translate targets the browser language by default.
- `renderResult` customises the answer view; `components.Panel` replaces the whole dialog.
- Katex and Mermaid dialogs can generate their source from a one-line description.

### Toolbar and UI

- Exported toolbar primitives: `RichTextToolbar`, `RichTextToolbarDivider`, `RichTextToolbarMore` (a labelled overflow panel), `RichTextToolbarMoreGroup`, `RichTextToolbarMoreRow`, `RichTextToolbarButton`.
- `RichTextFontSize` has a compact icon variant; `ActionMenuButton` is narrower and no longer draws a second tooltip.
- Font family lists Chinese, Japanese, Korean, Devanagari and Bengali stacks when the UI language or the document uses that script. Long menus scroll instead of clipping.
- Colour picker rows, a fixed checkbox radius, and no browser focus ring around the editor.

### Internationalization

- 16 bundled languages ordered by speaker population: zh-CN, hi, es, fr, bn, pt-BR, ru, id, de, ja, tr, vi, ko, it, hu, fi, plus English. Load them on demand from `ai-sparkwrite-editor/locales/<code>`.

### Recording

- `Recorder` records every edit as timestamped ProseMirror steps; `replayRecording` plays a session back at any speed.

### Frameworks

- **One import per framework.** `ai-sparkwrite-editor` exports every extension, control, bubble menu and the AI layer for React; `ai-sparkwrite-editor/vue` does the same for Vue, framework-free extensions included. Each feature keeps its own chunk, so tree-shaking bundlers ship only what is referenced; the per-feature subpaths stay for the rest.
- **`RichTextKit`** — the whole editor as one extension (like StarterKit): `false` drops a feature, an object configures it, opt-in features (GIPHY, mentions, Excalidraw, drawer, Twitter, emoji, recorder…) switch on when given one. `RichTextKitToolbar` and `RichTextKitMenus` render a full toolbar, the AI composer dock, every bubble menu, the drag handle and the slash menu for whatever is registered — in React and in Vue. The playground runs on the kit by default, with a "Setup" switch to the assembled toolbar, for both UI layers.

- `ai-sparkwrite-editor/core`: the framework-agnostic layer (extensions without node views, paste rules, recorder, AI transport and markdown rendering, image bookkeeping, translations). A build check fails if React becomes reachable from it.
- `ai-sparkwrite-editor/vue`: Vue 3 provider, composables, toolbar primitives and controls on the same stylesheet as the React ones — now including the AI layer (`AI` with the Vue panel, `RichTextAI`, `RichTextAIComposer`, `RichTextAIImprove`), bubble menus (text, table, link, image), dialogs (link, image, video, attachment, Katex and Mermaid with AI generation, iframe) and Vue node views for divider, code block, callout, iframe, image, GIF, Katex, Mermaid, attachment and table of contents. `examples/vue` shows everything; the playground switches between the React and Vue layers.
- Every block extension is split into a framework-free `<Name>Core` and a thin React `<Name>` that only adds the node view; `ai-sparkwrite-editor/core` exports the cores. Excalidraw, Drawer and Twitter stay React-only (they wrap React libraries).
- Translations moved to a dependency-free store; `useLocale` (React) subscribes with `useSyncExternalStore`.
- The AI panel's tone selector was removed.

### Bundle size

- Icons are a registry: each control registers the Lucide icons it uses, so a host that imports one feature no longer pays for ~90 icons. `registerIcons` is exported for custom icon names.
- The `cn` class merger is a 25-line local helper; the shared stores use `useSyncExternalStore` instead of `reactjs-signal`.
- Importing `ai-sparkwrite-editor/bold` now reaches 30 KB of library code (was 88 KB) and one icon (was 87). `pnpm measure:entries` prints the per-entry figures; see the Bundle size guide.

### Documentation

- A RichTextKit guide page (every option, the toolbar and the menus) in both languages; `pnpm check:docs` type-checks every import the docs show against the built entries.
- The docs site has an English and a Simplified Chinese locale (language menu in the header), a new theme, React and Vue tabs on every extension page, and the favicon, logo and social image of the new brand.

### Build

- GitHub Pages workflow (`pages.yml`) publishes the docs at `/ai-sparkwrite-editor/` and the live playground at `/ai-sparkwrite-editor/playground/` on every push to `main`; the upstream surge preview workflows are gone.

- Named imports from `@tiptap/*` packages so the CommonJS bundles load.
- Package renamed to `ai-sparkwrite-editor`; subpaths keep their shape (`ai-sparkwrite-editor/table`, `ai-sparkwrite-editor/bubble/text`, `ai-sparkwrite-editor/locales/es`, plus `ai-sparkwrite-editor/core` and `ai-sparkwrite-editor/vue`). The root CSS class is `.sparkwrite`.
