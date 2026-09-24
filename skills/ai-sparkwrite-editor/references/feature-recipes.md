# Feature Recipes

Each recipe extends the quickstart. With the kit, pass the options under the feature key (`image: { upload }`); when assembling, call `.configure()` and add the result to `extensions` (configuring alone registers nothing). Controls render inside `RichTextProvider`. App-owned code is marked as such.

## Image upload

Contract: `upload: (file: File) => Promise<string>` resolving to a **durable URL** (the saved document reopens it later), rejecting on failure. The extension validates `acceptMimes`/`maxSize` first and reports problems through `onError({ type: 'size' | 'type' | 'upload', message, file })` (default: a toast with a translated message).

```ts
// upload-image.ts — app-owned adapter; adapt auth and response mapping to the real service
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/images', { method: 'POST', body, credentials: 'include' });
  if (!response.ok) throw new Error(`Image upload failed: ${response.status}`);
  const data = await response.json();
  if (typeof data.url !== 'string' || !data.url.trim())
    throw new Error('Upload response must contain a URL');
  return data.url; // absolute or relative, as the app's existing contract allows
}
```

```ts
// kit
RichTextKit.configure({
  image: { upload: uploadImage, resourceImage: 'both', maxSize: 10 * 1024 * 1024 },
});
// assembled
Image.configure({ upload: uploadImage, resourceImage: 'both' }); // + <RichTextImage /> and <RichTextBubbleImage />
```

Options: `upload`, `resourceImage: 'upload' | 'link' | 'both'` (dialog tabs), `acceptMimes` (default: every browser image format incl. SVG — drop `'image/svg+xml'` if the host serves uploads from its own origin), `maxSize` (5 MB), `multiple` (true), `defaultInline` (false), `enableAlt` (false), `onError`, `HTMLAttributes`. Bubble menu: align, sizes, crop (needs `react-image-crop` + its CSS in React), rotate (`rotate` attr → `data-rotate`), caption (`<div class="image-caption">`), remove. Saved form: `<img src alt width align inline flipx flipy data-rotate>` inside `div.image`, so HTML renders anywhere.

Pasted/dropped files also go through `upload`. Without `upload`, only the link tab works.

## Deleting uploaded images (server clean-up)

`upload` runs when the file is chosen, before any save, so deleted pictures leave files behind. Do the clean-up **at save time**, never per edit (undo can restore an image):

```ts
import { getImageChanges, markImagesSaved, collectImageSources } from 'ai-sparkwrite-editor'; // also in /core and /vue

async function save(editor: Editor) {
  const { current, added, removed, orphaned } = getImageChanges(editor);
  await api.saveDocument({ html: editor.getHTML(), images: current });
  await api.deleteImages([...removed, ...orphaned]); // removed: in last save, gone now; orphaned: uploaded this session, never in the doc
  markImagesSaved(editor); // new baseline; current sources stop counting as orphans
}
```

- `getImageChanges(editor, previous?)` diffs against `markImagesSaved`'s snapshot or the `previous` list you pass (e.g. the `images` stored with the document, so the first save after a reload still finds deletions).
- Only sources returned by `upload` can be `orphaned`; linked/pasted URLs never are. Covers `image`, `imageBlock` and `imageGif` nodes.
- `collectImageSources(doc)` lists sources of any ProseMirror doc, for a server-side comparison.
- Deleting a document: delete `collectImageSources(editor.state.doc)` (or the stored `images` list).

## Video, attachment, Mermaid, Drawer, Word import uploads

Same `Promise<string>` contract; all rejections must be real errors.

```ts
Video.configure({
  upload: (file, { onProgress } = {}) => uploadVideo(file, onProgress), // onProgress({ loaded, total })
  resourceVideo: 'both',
  acceptMimes: ['video/mp4', 'video/webm'],
  maxSize: 100 * 1024 * 1024,
  multiple: true,
  uploadConcurrency: 3,
  showUploadProgress: true,
  onError,
});
Attachment.configure({ upload: uploadFile }); // file card; node view shows upload state
Mermaid.configure({ upload: uploadFile }); // rendered diagram exported as an image
Drawer.configure({ upload: uploadFile }); // React only
ImportWord.configure({ upload: async (files: File[]) => uploadMany(files) }); // images embedded in the .docx
```

## Embeds (Iframe)

`Iframe` recognises 35+ services (YouTube, Vimeo, Bilibili, Youku, Tencent Video, Loom, Spotify, SoundCloud, Google Maps, AMap, Baidu Maps, Figma, Canva, Miro, Whimsical, Excalidraw, dbdiagram, ProcessOn, Modao, Lanhu, Framer, CodePen, CodeSandbox, StackBlitz, JSFiddle, GitHub Gist, Google Docs/Sheets/Slides/Forms, Airtable, Trello, ClickUp, Descript, Typeform, Jinshuju) and any other page. A pasted share link or `<iframe>` snippet becomes the embeddable URL with a sensible height.

```ts
import { resolveEmbed, EMBED_SERVICES, EMBED_KINDS } from 'ai-sparkwrite-editor';
const embed = resolveEmbed('https://youtu.be/I4sMhHbHYXM'); // { service, src, height } | null for non-links
editor.commands.setIframe({ src: embed.src, service: embed.service.key, height: embed.height });
```

Saved HTML: `<iframe src data-service width height>`; style per service with `[data-service="youtube"]`. UI: `RichTextIframe` (prompt card with categorised brand logos), `RichTextBubbleIframe` (resize, edit link, remove), slash `/embed`, `/youtube`, `/figma`…. Brand marks beyond the built-in ten load on demand (a separate ~29 KB chunk).

## Notice and callout

`Notice`: info / success / warning / tip boxes containing ordinary blocks; saved as `<div class="notice" data-type="info">…</div>`, no node view, renders anywhere the stylesheet loads. Commands `setNotice(type)`, `toggleNotice(type)`, `updateNotice(type)`, `unsetNotice()`; `NOTICE_TYPES` for menus. Enter on an empty last line leaves the box; Backspace at the start of the first line lifts. Markdown export writes GitHub-style alerts.

`Callout`: a highlighted note block (`CALLOUT_TYPES`: note, tip, important, warning, caution) with `RichTextBubbleCallout`.

## Slash menu (React)

```tsx
const extensions = [...base, SlashCommand];
// inside the provider
<SlashCommandList />; // default groups Insert and Format (AI entries included), filtered by registered extensions
```

Custom list: `<SlashCommandList commandList={[{ name: 'custom', title: 'Custom', commands: [{ name: 'signature', label: 'Signature', iconName: 'PenLine', aliases: ['sig'], action: ({ editor, range }) => editor.chain().focus().deleteRange(range).insertSignature().run() }] }]} />`. `Command` also supports `iconColor`, `variants` (one row, several choices — the notice row uses it), `preview` (icons + `+N` text), `hiddenUntilSearched`, `shortcut` (markdown hint), `shouldBeHidden(editor)`. Icons resolve by name through `registerIcons`. Advertise `/` in a `Placeholder` only when both are registered. Space on an empty line opens Ask AI when `AI` is registered.

## Mention

```ts
Mention.configure({
  suggestions: [
    { char: '@', items: async ({ query }) => users.filter((u) => u.label.toLowerCase().startsWith(query.toLowerCase())) },
    { char: '#', items: async ({ query }) => tags.filter(...) },
  ],
});
// or Tiptap's single `suggestion: { items, render }`
```

Items: `{ id, label, avatar? }`. React only.

## Code block

`CodeBlock.configure({ defaultLanguage: 'ts', detectLanguageFn })`; `RichTextCodeBlock` in the toolbar. The block's own hover toolbar (language picker with search, copy, delete, "· Auto" marker) ships with the node view. Pasted code from VS Code/JetBrains etc. becomes a code block with a guessed language via `RichPaste`. Exports `guessLanguage`, `languageLabel`, `LIST_LANG`, `CODE_THEME` palette.

## Tables

`Table` (+ `RichTextTable`, `RichTextBubbleTable`): right-click context menu with rows/columns, merge/split, cell background colour, "Paragraph After Table" (⌘/Ctrl+Enter also works), delete. `RichTextBubbleTable hiddenActions={['deleteTable']}` (keys: `addColumnBefore`, `addColumnAfter`, `deleteColumn`, `addRowAbove`, `addRowBelow`, `deleteRow`, `mergeCells`, `splitCells`, `cellBackground`, `insertParagraphAfterTable`, `deleteTable`).

## Export and import

- Markdown: `ExportMarkdown` + `RichTextExportMarkdown`, or `await getMarkdown(editor)` from app code (also what the AI layer sends as context).
- Word: `ExportWord`, `ImportWord` (`upload` for embedded images). Libraries load on first use.
- PDF: `ExportPdf.configure({ paperSize: 'A4', margins: { top: '1in', right: '0.4in', bottom: '1in', left: '0.4in' } })`.

## Internationalization

Only English is bundled. Register a dictionary **before** selecting it; state is global to all editors on the page.

```ts
import { localeActions, useLocale, en } from 'ai-sparkwrite-editor/locale'; // useLocale also from /vue
import zhCN from 'ai-sparkwrite-editor/locales/zh-cn';

localeActions.setMessage('zh_CN', zhCN);
localeActions.setLang('zh_CN');
localeActions.setMessage('en', { 'editor.remove': 'Delete' }); // override one key; merges
```

Codes → files: `zh_CN`→`zh-cn`, `pt_BR`→`pt-br`, `hu_HU`→`hu`; others match (`hi es fr bn ru id de ja tr vi ko it fi`). Load on demand with literal `import('ai-sparkwrite-editor/locales/ja')` per language (a computed specifier pulls all or fails). `/locale-bundle` registers every language as a side effect. `useLocale()` → `{ lang, t }`; `t(key, params)`. English UI labels are Title Case; keep that in overrides.

## Theme

```ts
import { themeActions, useTheme } from 'ai-sparkwrite-editor/theme';
themeActions.setTheme('dark');
themeActions.setColor('blue');
themeActions.setBorderRadius('0.5rem');
```

Global to all editors and their portaled dialogs; sync it with the host's theme in an effect. `RichTextProvider dark` is ignored. Fine-tuning: CSS variables on `.sparkwrite` (`--richtext-link`, `--richtext-link-dark`, `--ai-accent`…), `richtext-` prefixed utility classes, `.ProseMirror` padding is responsive (16–24 px phones, 40 px tablets, 80 px ≥1024 px). Document area: `<EditorContent className='article-editor' />` then `.article-editor .tiptap { min-height: 240px }`.

## Custom toolbar and controls

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
import { Save } from 'lucide-react';
registerIcons({ Save }); // module scope, before render

<RichTextToolbar>
  <RichTextBold />
  <RichTextToolbarDivider />
  <RichTextTable />
  <RichTextToolbarButton
    icon='Save'
    tooltip='Save'
    shortcutKeys={['mod', 'S']}
    onClick={() => save(editor)}
  />
  <RichTextToolbarMore label='More'>
    <RichTextToolbarMoreGroup label='Insert' columns={3}>
      <RichTextToolbarMoreRow label='Divider'>
        <RichTextDivider />
      </RichTextToolbarMoreRow>
    </RichTextToolbarMoreGroup>
  </RichTextToolbarMore>
</RichTextToolbar>;
```

Icons are addressed by name and come from a registry that each feature fills (tree-shakable); a name of your own must be registered first; re-registering a built-in name replaces the icon everywhere. Vue: `RichTextToolbarButton`, `RichTextDropdown`, `RichTextPopover`, `RichTextDialog`, `useEditorState(selector)`. Keep the main row to ~18 constant controls and put the rest behind `RichTextToolbarMore` (the kit toolbar already does; extra controls go in its `children`).

## Custom block

Any Tiptap node works; give it a node view for interactive state (React `ReactNodeViewRenderer`, Vue `VueNodeViewRenderer`), `parseHTML`/`renderHTML` define the saved form, add a `RichTextToolbarButton` or slash entry that runs its command. `Divider` and `Callout` in the source are the reference implementations. Register the node alongside the others (a custom node cannot be added through kit options; put it next to `RichTextKit` in `extensions`).

## Recorder (session replay)

```ts
Recorder.configure({
  autoStart: true,
  recordSelection: false,
  onEntry: (entry, recording) => stream(entry),
  maxEntries: 0,
});
const recording = getRecording(editor); // plain JSON to store
await replayRecording(editor, recording, { speed: 4, maxDelay: 2000, onProgress, signal }); // set editable false while playing
```

## Bubble menus

Mount only what the registered extensions need (the kit does this): `RichTextBubbleText` (any text), `RichTextBubbleLink` (hover a link; edit form; stays above the drag handle), `RichTextBubbleImage`/`Video`/`ImageGif` (`/bubble/media`), `RichTextBubbleTable`, `RichTextBubbleNotice`, `RichTextBubbleIframe`, `RichTextBubbleKatex`, `RichTextBubbleMermaid`, `RichTextBubbleMenuDragHandle` (block handle + "+"). Custom buttons: `RichTextBubbleText` takes a `buttonBubble` prop in React (the default slot in Vue) to replace its set.
