---
description: AI

next:
  text: Attachment
  link: /extensions/Attachment/index.md
---

# AI

A custom writing assistant with an inline prompt, tone selection, plain-text preview,
follow-up instructions, retry, cancellation, discard, and apply. Works in light and dark themes.

```tsx
import { AI } from 'reactjs-tiptap-editor/ai';
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';
import 'reactjs-tiptap-editor/style.css';

const extensions = [
  // Your existing document, paragraph, text, history, etc.
  AI.configure({
    protocol: 'openai', // 'openai' | 'anthropic'
    apiKey: 'your-api-key', // Also accepts () => string | Promise<string>
    model: 'your-model-id',
    // Optional root including /v1; defaults to the selected provider's API.
    baseURL: 'https://api.openai.com/v1',
  }),
  SlashCommand,
];
// Render <SlashCommandList /> inside your existing RichTextProvider.
```

Type `/` and choose **Ask AI**. The entry is added automatically when `AI` is
registered, including when you supply a custom slash command list. Without `AI`,
the menu is unchanged. Enter sends a prompt; Shift+Enter inserts a newline;
Escape closes the panel. Select text and call `editor.commands.openAI()` to rewrite
that selection, or call it at the cursor to insert new text.

For Anthropic, set `protocol: 'anthropic'`, pass your model ID and API key, and omit
`baseURL` (defaults to `https://api.anthropic.com/v1`). The transport uses
[Anthropic Messages](https://platform.claude.com/docs/en/api/messages/create) or
[OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat).
OpenAI-compatible proxies should support `max_completion_tokens`; use `generate`
for a gateway requiring a different payload.

## Production: keep keys on your server

A key passed to a React extension is visible to the browser. Use direct keys only
for local testing or user-supplied keys. The extension does not persist keys.
For production, route requests through an authenticated backend. Either configure
`baseURL: '/api/ai'` with no key (the backend implements the selected protocol), or
provide a custom transport:

```tsx
AI.configure({
  generate: async ({ messages, systemPrompt, signal }) => {
    const response = await fetch('/api/write', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, systemPrompt }),
      signal,
    });
    if (!response.ok) throw new Error('Unable to generate text.');
    const { text } = await response.json();
    return text;
  },
});
```

`generate` returns `Promise<string>` and replaces the built-in transport. It does
not require a model or API key in the frontend. Custom error messages are shown in
the UI; avoid including secrets in them. Your backend supplies provider credentials,
authenticates users, and enforces request limits.

## Options and behavior

| Option         | Default                        | Purpose                                                  |
| -------------- | ------------------------------ | -------------------------------------------------------- |
| `protocol`     | `'openai'`                     | OpenAI Chat Completions or Anthropic Messages            |
| `apiKey`       | `''`                           | Key or async key getter; omit for an authenticated proxy |
| `model`        | `''`                           | Required model ID for built-in requests                  |
| `baseURL`      | Provider `/v1` root            | API root, not a complete endpoint                        |
| `maxTokens`    | `2048`                         | Maximum generated tokens                                 |
| `headers`      | `{}`                           | Extra or overridden request headers                      |
| `systemPrompt` | Writing assistant instructions | Language matching and plain text output                  |
| `generate`     | `null`                         | Custom async transport                                   |

Only selected text, your prompt, tone, and successful conversation turns are sent.
The full document is not sent automatically. Requests are non-streaming; once a response arrives, the preview reveals it progressively with a typewriter effect (up to five seconds). Reduced-motion preferences show the full result immediately. Stop during the reveal shows the complete response, and Apply becomes available when the reveal finishes. Results
are inserted as plain text paragraphs, so generated HTML is never executed.
Apply replaces the captured selection or inserts at the captured cursor; it is
undoable with Tiptap history enabled. Discard never inserts the preview.

Document edits (including collaboration updates) close the session and cancel its
request to avoid overwriting changed content. Closing, stopping, or destroying the
editor aborts the active request. Changing the cursor alone preserves the target.

The playground enables AI and reads `VITE_AI_PROTOCOL`, `VITE_AI_MODEL`,
`VITE_AI_BASE_URL`, and `VITE_AI_API_KEY`; see `playground/.env.example`.

The preview is rendered as temporary paragraph DOM inside a ProseMirror block widget. It participates in document layout, so long results expand the editor and push following blocks down. It is excluded from saved HTML/JSON until Apply. The follow-up panel sits directly below the preview.

## Attachments

The prompt box accepts images and text files. Images are sent to the model as
images (OpenAI `image_url`, Anthropic `image` blocks); text files are inlined
into the prompt under their filename. Both are off switches, not features you
have to use:

```tsx
AI.configure({
  // The model has to accept images. Turn this off when it does not.
  enableImageInput: true,
  enableFileInput: true,
  imageMimes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
  fileMimes: ['text/plain', 'text/markdown', 'text/csv', 'application/json'],
  maxAttachmentSize: 4 * 1024 * 1024,

  // Fixed targets for Translate, shown as a submenu. Empty (the default)
  // offers one target: the reader's browser language.
  translateLanguages: [],
});
```

A custom `generate` transport receives the attachments on the message
(`message.attachments`) and can encode them however its backend expects.

## Improve selected text

The default `RichTextBubbleText` toolbar includes **Improve** when AI is enabled.
It groups actions the way Notion and Craft do: _Edit selection_ (improve writing,
fix spelling & grammar, make shorter, make longer, simplify, change tone) and
_Generate_ (summarize, explain, translate). Rewrites keep the original language,
so translation is a single entry rather than one per language.
They run immediately on the selected text and show a preview before Apply.

**Translate** targets the reader's browser language (`navigator.language`), named
in the menu next to the label, so the common case needs no picking. Set
`translateLanguages` to a list to replace that entry with a submenu of fixed
targets.
**Ask AI anything** opens an empty prompt for custom instructions.

All panel and menu strings go through the editor's locale system; add
`editor.ai.*` keys to a custom locale to override them.

For a custom `buttonBubble`, import `RichTextAIImprove` from
`reactjs-tiptap-editor/bubble/ai` and place it inside your toolbar.
You can also run a preset programmatically with
`editor.commands.openAI('Make the selected text more concise.')`.
Calling `openAI()` without a prompt retains the manual input flow.

## Streaming and rich answers

Answers stream in. With the built-in transport the provider is asked for server-sent events (OpenAI `stream: true`, Anthropic `content_block_delta`) and each delta is shown as it arrives; set `stream: false` to wait for the whole answer instead. A custom `generate` streams by calling its second argument:

```ts
AI.configure({
  generate: async (request, onChunk) => {
    const response = await fetch('/api/ai', {
      method: 'POST',
      body: JSON.stringify(request),
      signal: request.signal,
    });
    let text = '';
    for await (const chunk of readLines(response.body)) {
      text += chunk;
      onChunk?.(chunk); // shown immediately
    }
    return text; // the full answer, used for history and Apply
  },
});
```

The answer is treated as markdown and rendered **through the editor's own schema**: a `|` table becomes the editor's table, a fenced block its code block, `##` a heading, `- [ ]` a task list. The preview inside the panel is the exact HTML the editor would save, with the document's styles, so what you see is what Apply inserts — as real nodes, not pasted text. Anything the schema does not know (scripts, unknown tags, attributes) is dropped on the way in.

Apply merges a single-paragraph answer into the paragraph being edited and replaces whole blocks otherwise. The preview lives in the document flow under the selection rather than in a modal, so you can compare it with the surrounding text; it is not part of the document until Apply.

## Custom rendering

Two levels:

- `renderResult({ markdown, html, streaming })` replaces only how the answer is shown — for example to render the markdown with your own component, add a word count, or show a diff against the selection. `html` is the schema-rendered form described above.
- `components.Panel` replaces the whole dialog. It receives `editor`, `options`, `selectedText`, `initialPrompt`, `apply(markdown)` and `close()`; call `generateAIText(options, request, onChunk)` from `reactjs-tiptap-editor/ai` for the transport, or your own.

```tsx
AI.configure({
  renderResult: ({ html, streaming }) => (
    <div
      className={streaming ? 'answer answer--live' : 'answer'}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ),
});
```

The helpers behind this are exported too: `markdownToHTML`, `markdownToFragment(editor, md)`, `markdownToSlice(editor, md)` and `markdownToPreviewHTML(editor, md)`.
