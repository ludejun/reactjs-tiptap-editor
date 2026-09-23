---
description: AI

next:
  text: Attachment
  link: /extensions/Attachment/index.md
---

# AI

The model writes **into the document**, not into a chat window. Answers stream in as Markdown and are rendered through the editor's own schema, so a `|` table becomes the editor's table, a fenced block a code block, `- [ ]` a task list — real nodes you can keep editing, never pasted text.

There are five ways in, and they share one extension:

| Entry point                                    | What happens                                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Select text → Improve**                      | The selection menu rewrites, shortens, translates, explains, turns the text into a table or a list; preview, then Apply.      |
| **Space on an empty line**                     | Opens Ask AI at the caret (Notion's gesture). `spaceTrigger: false` turns it off.                                             |
| **`/ai`, `/continue`**                         | Slash entries: Ask AI, Continue writing, open the composer.                                                                   |
| **The AI toolbar button, `⌘/Ctrl+J`**          | Opens the **composer dock** under the editor: type what you want, the answer streams into the page above. Keep, undo, refine. |
| **Ghost text while typing** (`AIAutocomplete`) | After a pause at the end of a block the next few words appear in grey; Tab keeps them, Escape or typing dismisses.            |

## Setup

```tsx
import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';
import { SlashCommand, SlashCommandList } from 'ai-sparkwrite-editor/slashcommand';
import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';
import 'ai-sparkwrite-editor/style.css';

const extensions = [
  // Document, Paragraph, Text, History, …
  AI.configure({
    protocol: 'openai', // 'openai' | 'anthropic'
    apiKey: 'your-api-key', // or () => string | Promise<string>
    model: 'your-model-id',
    baseURL: 'https://api.openai.com/v1', // optional root including /v1
  }),
  AIAutocomplete, // optional: ghost-text suggestions
  SlashCommand,
];

// Inside <RichTextProvider editor={editor}>:
//   <RichTextToolbar><RichTextAI /> …</RichTextToolbar>
//   <EditorContent editor={editor} />
//   <RichTextAIComposer />      ← the dock, opened by RichTextAI / ⌘J / "/ai"
//   <RichTextBubbleText />      ← includes the Improve menu
//   <SlashCommandList />
```

For Anthropic set `protocol: 'anthropic'` and omit `baseURL` (defaults to `https://api.anthropic.com/v1`). The transport speaks [Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create) or [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat) and asks for server-sent events.

## The composer dock

`RichTextAIComposer` sits under the editor and writes straight into it. It opens from the `RichTextAI` toolbar button, `⌘/Ctrl+J`, the `/ai` slash entry, the Improve menu ("Open AI composer") or `editor.commands.toggleAIComposer(true)`.

- **Chips** run the document-level presets: Continue writing, Summarize, Outline, Suggest a title, Action items (a task list of every decision and open question), Fix grammar everywhere, Translate document. Each knows where its answer goes (end, top, caret, or the whole document).
- **The prompt** takes anything; a target selector chooses _Replace selection_ / _At cursor_ / _Top_ / _End_ / _Whole document_.
- **The chips stay on one line.** Whatever does not fit sits behind a `+N` button. Hovering a chip shows the exact prompt it sends; the prompts are the `prompt` fields of `AI_COMPOSER_ACTIONS`.
- **While the answer streams** the span it is filling is tinted and follows edits made elsewhere; Stop keeps what has arrived.
- **Afterwards**: Keep, Undo (puts the original back), Retry, or type a follow-up — the same span is rewritten with the conversation so far. The finished answer is a single undo step.

The presets are data, so you can change them:

```tsx
import { AI_COMPOSER_ACTIONS, RichTextAIComposer } from 'ai-sparkwrite-editor/ai';

<RichTextAIComposer
  actions={[
    ...AI_COMPOSER_ACTIONS,
    {
      key: 'editor.ai.compose.tweet', // a locale key or a plain label
      icon: 'PenLine',
      target: 'end',
      prompt: 'Write a tweet announcing this document.',
    },
  ]}
/>;
```

### Turning the composer off, or restyling it

`AI.configure({ composer: false })` removes the dock **and every way in**: the `RichTextAI` toolbar button renders nothing, `⌘/Ctrl+J` and `/ai composer` disappear, the Improve menu loses "Open AI Composer", and `toggleAIComposer()` is a no-op. The selection menu, Space-to-ask and autocomplete are unaffected.

The dock itself takes props (same names in Vue):

| Prop                 | Default               | Effect                                                      |
| -------------------- | --------------------- | ----------------------------------------------------------- |
| `actions`            | `AI_COMPOSER_ACTIONS` | The chips; `[]` hides the row                               |
| `showTarget`         | `true`                | The "where the text goes" selector                          |
| `hint`               | `true`                | Footer line; `false` hides it, a string replaces it         |
| `placeholder`        | locale string         | Prompt box placeholder                                      |
| `rows`               | `2`                   | Visible lines of the prompt box                             |
| `gradient`           | `true`                | Gradient border and background wash; `false` is a flat dock |
| `accent`             | `#804dff`             | Accent colour; sets the `--ai-accent` variable              |
| `className`, `style` | —                     | Passed to the root                                          |

For finer control the stylesheet exposes `--ai-accent`, `--ai-accent-2`, `--ai-accent-3` on `.richtext-ai-composer`, and the parts are plain classes: `richtext-ai-composer-chipline`, `-chips`, `-more`, `-menu`, `-row`, `-send`, `-close`, `-status`, `-actions`, `-hint`.

### Writing into the document from your own UI

The engine behind the dock is exported and framework-free:

```ts
import { writeWithAI } from 'ai-sparkwrite-editor/ai'; // or 'ai-sparkwrite-editor/core'

const result = await writeWithAI(editor, {
  prompt: 'Turn the meeting notes into a table of decisions.',
  target: 'selection', // 'selection' | 'cursor' | 'start' | 'end' | 'document' | { from, to }
  signal: controller.signal,
  onProgress: (markdown) => console.log(markdown.length),
});
result.keep(); // or result.discard() to put the original back
// result.messages is the conversation; pass it as `history` to refine.
```

Document-level targets (`cursor`, `start`, `end`) send the document as Markdown context, trimmed to `documentContext` characters (default 12 000; `0` sends none). `selection` and `document` send the affected text itself — as Markdown when it spans more than one block, so structure survives a rewrite.

## Ghost-text autocomplete

`AIAutocomplete` is a separate extension so it costs nothing unless registered. Options: `enabled` (start on/off; `toggleAIAutocomplete()` flips it), `delay` (900 ms of quiet), `minChars` (24 characters in the block), `contextChars` (1 500 sent), `maxTokens` (48), `prompt`. It uses the `AI` extension's transport, asks only when the caret is at the end of a non-code block and the editor is focused, and drops stale answers. `acceptAISuggestion()` and `dismissAISuggestion()` are commands; Tab and Escape are bound.

## Improve selected text

`RichTextBubbleText` includes **Improve** when AI is registered: _Edit selection_ (improve writing, fix spelling & grammar, shorter, longer, simplify, change tone) and _Generate_ (summarize, explain, **turn into table**, **turn into list**, translate). Rewrites keep the original language, so translation is one entry that targets the reader's browser language; set `translateLanguages: ['English', 'Deutsch']` for a fixed submenu. **Ask AI anything** opens an empty prompt. It works after Select All too.

The panel opens in the document flow under the selection, streams the answer with the document's own styles, and offers Retry, Discard and Apply. Enter sends, Shift+Enter is a newline, Escape closes. Programmatically: `editor.commands.openAI('Make this more concise.')`.

Presets are plain prompts; a custom `buttonBubble` can place `RichTextAIImprove` (from `ai-sparkwrite-editor/bubble/ai`) anywhere.

## Production: keep keys on your server

A key passed to a browser extension is visible to the browser. Either configure `baseURL: '/api/ai'` with no key (your backend speaks the selected protocol), or supply a transport:

```tsx
AI.configure({
  generate: async ({ messages, systemPrompt, signal }, onChunk) => {
    const response = await fetch('/api/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
      signal,
    });
    if (!response.ok) throw new Error('Unable to generate text.');
    let text = '';
    for await (const chunk of readLines(response.body)) {
      text += chunk;
      onChunk?.(chunk); // streams into the panel / document
    }
    return text; // the full answer
  },
});
```

`generate` replaces the built-in transport, needs no model or key in the frontend, and receives attachments on `message.attachments`. Error messages you throw are shown in the UI; the built-in transport never shows raw provider errors.

## Options

| Option                                         | Default                      | Purpose                                                                                                                                                                                                       |
| ---------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `protocol`                                     | `'openai'`                   | OpenAI Chat Completions or Anthropic Messages                                                                                                                                                                 |
| `apiKey`                                       | `''`                         | Key or async key getter; omit for an authenticated proxy                                                                                                                                                      |
| `model`                                        | `''`                         | Model ID for the built-in transport                                                                                                                                                                           |
| `baseURL`                                      | provider `/v1` root          | API root, not a complete endpoint                                                                                                                                                                             |
| `maxTokens`                                    | `2048`                       | Maximum generated tokens                                                                                                                                                                                      |
| `headers`                                      | `{}`                         | Extra or overridden request headers                                                                                                                                                                           |
| `systemPrompt`                                 | writing-assistant prompt     | Asks for the user's language and Markdown-only output                                                                                                                                                         |
| `generate`                                     | `null`                       | Custom transport `(request, onChunk?) => Promise<string>`                                                                                                                                                     |
| `stream`                                       | `true`                       | Ask for server-sent events                                                                                                                                                                                    |
| `spaceTrigger`                                 | `true`                       | Space on an empty line opens Ask AI                                                                                                                                                                           |
| `documentContext`                              | `12000`                      | Characters of the document sent with document-level prompts                                                                                                                                                   |
| `serializeDocument`                            | the editor's Markdown export | `(editor, range) => string`: how a span is turned into text for the model. Multi-block spans and the whole document go as Markdown so tables, lists and code keep their shape; override to redact or reformat |
| `translateLanguages`                           | `[]`                         | Fixed Translate targets; empty means the browser language                                                                                                                                                     |
| `enableImageInput`                             | `true`                       | Attach images (the model has to accept them)                                                                                                                                                                  |
| `enableFileInput`                              | `true`                       | Attach text files, inlined into the prompt                                                                                                                                                                    |
| `imageMimes`, `fileMimes`, `maxAttachmentSize` | see source                   | Accepted attachment types and size (4 MB)                                                                                                                                                                     |
| `renderResult`                                 | —                            | React: replace how the panel shows the answer (`{ markdown, html, streaming }`)                                                                                                                               |
| `components.Panel`                             | —                            | React: replace the whole panel                                                                                                                                                                                |
| `mountPanel`                                   | React/Vue renderer           | Framework hook: `(mount, props) => unmount`; the core entry ships it as `null`                                                                                                                                |

Only the selected text (or the document context you allow), your prompt and successful turns are sent. Document edits during a panel session — including collaborative ones — close the session and abort its request. Closing, stopping or destroying the editor aborts requests.

## Streaming and rich answers

With the built-in transport the provider is asked for server-sent events (OpenAI `stream: true`, Anthropic `content_block_delta`) and each delta is shown as it arrives; `stream: false` waits for the whole answer. The answer is Markdown rendered **through the editor's own schema**: the preview is the exact HTML the editor would save, with the document's styles, and Apply inserts real nodes. A single-paragraph answer merges into the paragraph being edited; anything with block structure replaces whole blocks. Unknown tags, scripts and attributes are dropped on the way in.

## Custom rendering (React)

- `renderResult({ markdown, html, streaming })` replaces only how the answer is shown — your own Markdown component, a word count, a diff against the selection.
- `components.Panel` replaces the whole dialog. It receives `editor`, `options`, `selectedText`, `initialPrompt`, `apply(markdown)` and `close()`; call `generateAIText(options, request, onChunk)` for the transport.

The helpers are exported: `markdownToHTML`, `markdownToFragment(editor, md)`, `markdownToSlice(editor, md)`, `markdownToPreviewHTML(editor, md)`.

## Core and Vue

`ai-sparkwrite-editor/core` exports the same extension as `AI` (headless: commands, decorations, `writeWithAI`, `AIAutocomplete`, `AI_COMPOSER_ACTIONS`, `generateAIText`, the Markdown helpers) with `mountPanel: null` — supply your own to mount a panel in any framework. `ai-sparkwrite-editor/vue` exports `AI` with the Vue panel plus `RichTextAI`, `RichTextAIComposer`, `RichTextAIImprove` and `RichTextBubbleText`; see [Frameworks](/guide/frameworks).

All strings go through the locale system (`editor.ai.*`, `editor.ai.compose.*`); the playground answers itself without a key so the whole flow can be tried (`VITE_AI_MODEL` etc. switch to a real model, see `playground/.env.example`).
