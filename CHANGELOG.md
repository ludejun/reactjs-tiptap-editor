# Changelog

All notable changes to SparkWrite are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [semantic versioning](https://semver.org/).

## 0.1.0 — 2026-09-22

First release under the SparkWrite name. The code base descends from reactjs-tiptap-editor 1.0.46 and was reworked extensively before this release; the history before this point lives in the `archive/reactjs-tiptap-editor` branch.

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

- **Composer dock** (`RichTextAIComposer` + the `RichTextAI` toolbar button, `⌘/Ctrl+J`, `/ai`): a prompt bar under the editor whose answers stream straight into the document as real blocks. Presets for the whole document — continue writing, summarize, outline, suggest a title, extract action items, fix grammar everywhere, translate — plus a target selector (selection, caret, top, end, whole document). Keep, undo, retry or refine in place; the answer is one undo step.
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

- `ai-sparkwrite-editor/core`: the framework-agnostic layer (extensions without node views, paste rules, recorder, AI transport and markdown rendering, image bookkeeping, translations). A build check fails if React becomes reachable from it.
- `ai-sparkwrite-editor/vue`: Vue 3 provider, composables, toolbar primitives, controls for the core extensions, and a Vue node view for the divider, on the same stylesheet as the React controls. `examples/vue` shows every control.
- Translations moved to a dependency-free store; `useLocale` (React) subscribes with `useSyncExternalStore`.
- The AI panel's tone selector was removed.

### Build

- Named imports from `@tiptap/*` packages so the CommonJS bundles load.
- Package renamed to `ai-sparkwrite-editor`; subpaths keep their shape (`ai-sparkwrite-editor/table`, `ai-sparkwrite-editor/bubble/text`, `ai-sparkwrite-editor/locales/es`, plus `ai-sparkwrite-editor/core` and `ai-sparkwrite-editor/vue`). The root CSS class is `.sparkwrite`.
