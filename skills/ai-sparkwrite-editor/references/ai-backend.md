# AI backend

Everything AI in the editor (composer dock, selection Improve menu, Space-to-ask, ghost text, Katex/Mermaid "describe it") goes through one transport configured on the `AI` extension (`ai: {...}` in the kit). The frontend never needs a provider key.

## Frontend configuration

```ts
AI.configure({ endpoint: '/api/ai' }); // or RichTextKit.configure({ ai: { endpoint: '/api/ai' } })
```

| Option                                         | Default                  | Notes                                                                                                                         |
| ---------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`                                     | `''`                     | **Recommended.** Your backend URL; see contract below                                                                         |
| `headers`                                      | `{}`                     | Extra request headers (CSRF token, tenant id). Cookies travel on same-origin requests                                         |
| `stream`                                       | `true`                   | Ask for server-sent events; `false` always expects JSON                                                                       |
| `maxTokens`                                    | `2048`                   | Sent to the server as `maxTokens`                                                                                             |
| `systemPrompt`                                 | writing-assistant prompt | Sent as `systemPrompt`; asks for the user's language and Markdown-only output                                                 |
| `documentContext`                              | `12000`                  | Characters of the document (as Markdown) sent with document-level prompts; `0` = none                                         |
| `serializeDocument`                            | Markdown export          | `(editor, range) => string \| Promise<string>` to redact or reformat what the model sees                                      |
| `spaceTrigger`                                 | `true`                   | Space on an empty line opens Ask AI                                                                                           |
| `composer`                                     | `true`                   | `false` removes the dock and every way to open it                                                                             |
| `translateLanguages`                           | `[]`                     | Fixed Translate submenu; empty = browser language                                                                             |
| `enableImageInput` / `enableFileInput`         | `true`                   | Attachments; set image input `false` for a text-only model                                                                    |
| `imageMimes`, `fileMimes`, `maxAttachmentSize` | see d.ts                 | Attachment rules (4 MB)                                                                                                       |
| `generate`                                     | `null`                   | Custom transport; replaces `endpoint` and provider calls                                                                      |
| `protocol`, `model`, `apiKey`, `baseURL`       | —                        | Direct provider calls without `endpoint` (browser-visible key: local experiments or a same-origin proxy that injects the key) |
| `renderResult`, `components.Panel`             | —                        | React: replace how the answer is shown / the whole panel                                                                      |
| `mountPanel`                                   | React/Vue renderer       | Framework hook; `null` in `core`                                                                                              |

`AIAutocomplete` (ghost text) is a separate extension using the same transport: `enabled`, `delay` (900 ms), `minChars` (24), `contextChars` (1500), `maxTokens` (48), `prompt`; commands `toggleAIAutocomplete()`, `acceptAISuggestion()` (Tab), `dismissAISuggestion()` (Escape).

## The `endpoint` contract

Request, for every AI action:

```http
POST /api/ai
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Summarize:\n\n…", "attachments": [
      { "id": "…", "name": "chart.png", "mediaType": "image/png", "dataUrl": "data:image/png;base64,…", "kind": "image" }
    ] }
  ],
  "systemPrompt": "You are a writing assistant…",
  "stream": true,
  "maxTokens": 2048
}
```

- `messages`: the conversation so far, `user`/`assistant` turns. Attached **text files are already inlined** into `content`; **images** travel on `attachments` as data URLs (`kind: 'image'`). Forward them to the model as image parts or ignore them.
- `stream` is `true` whenever the UI can render deltas.

Response, one of:

1. **JSON** `{ "text": "…markdown…" }` (`content` or `markdown` keys are also read).
2. **SSE** with `Content-Type: text/event-stream`: `data: {"text":"…"}` per delta (`delta`/`content` keys also read), `data: [DONE]` to end.
3. A plain-text body.
4. An **OpenAI Chat Completions** or **Anthropic Messages** response or stream piped through unchanged.

Errors: a non-2xx status is shown to the user as a generic message with the status code. The response body is **never displayed** (a proxy may leak credentials in it), so put no user-facing text in error bodies; use status codes.

The answer must be **Markdown**: the editor renders it through its own schema (tables, fenced code, task lists become real nodes; unknown HTML is dropped).

### Node / Express with the OpenAI SDK

```ts
app.post('/api/ai', async (req, res) => {
  const { messages, systemPrompt, stream, maxTokens } = req.body;
  const completion = await openai.chat.completions.create({
    model: process.env.AI_MODEL ?? 'gpt-4o-mini',
    max_completion_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages.map(({ role, content, attachments }) =>
        attachments?.length
          ? {
              role,
              content: [
                { type: 'text', text: content },
                ...attachments.map((a) => ({ type: 'image_url', image_url: { url: a.dataUrl } })),
              ],
            }
          : { role, content }
      ),
    ],
    stream,
  });
  if (!stream) return res.json({ text: completion.choices[0].message.content });
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  for await (const chunk of completion) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
```

### Next.js route handler with the Anthropic SDK

```ts
// app/api/ai/route.ts
import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic(); // ANTHROPIC_API_KEY on the server

export async function POST(req: Request) {
  const { messages, systemPrompt, stream, maxTokens } = await req.json();
  const params = {
    model: 'claude-sonnet-5',
    max_tokens: maxTokens ?? 2048,
    system: systemPrompt,
    messages: messages.map(({ role, content, attachments }) => ({
      role,
      content: attachments?.length
        ? [
            { type: 'text', text: content },
            ...attachments.map((a) => ({
              type: 'image',
              source: { type: 'base64', media_type: a.mediaType, data: a.dataUrl.split(',')[1] },
            })),
          ]
        : content,
    })),
  };

  if (!stream) {
    const message = await client.messages.create(params);
    const text = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    return Response.json({ text });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream({
    async start(controller) {
      const events = client.messages.stream(params);
      events.on('text', (text) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      );
      await events.finalMessage();
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });
  return new Response(body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  });
}
```

Any provider or agent framework works the same way; the shortest server is a proxy that adds the key and forwards the provider's own stream unchanged (format 4).

Server checklist: authenticate the request (session cookie or a header from `headers`), rate-limit, cap `maxTokens`, strip `attachments` when the model does not accept images, keep the model choice server-side.

## Custom transport: `generate`

For an SDK client, WebSocket or agent framework the browser already talks to:

```ts
AI.configure({
  generate: async ({ messages, systemPrompt, signal }, onChunk) => {
    const response = await fetch('/api/write', {
      method: 'POST',
      body: JSON.stringify({ messages, systemPrompt }),
      signal,
    });
    if (!response.ok) throw new Error('Unable to generate text.'); // shown in the UI
    let text = '';
    for await (const chunk of readLines(response.body)) {
      text += chunk;
      onChunk?.(chunk); // streams into panel/document
    }
    return text;
  },
});
```

`request.messages[i].attachments` carries images/files; call `onChunk` per delta; resolve with the full text.

## Direct provider calls (no backend)

`AI.configure({ protocol: 'openai' | 'anthropic', model, apiKey, baseURL? })`. `apiKey` may be an async getter. The key is visible in the browser bundle: acceptable for local testing or when `baseURL` points at a same-origin proxy that injects the key (then omit `apiKey`). Do not ship a provider key in a production bundle; steer users to `endpoint`.

## Writing into the document from app code

```ts
import { writeWithAI, AI_COMPOSER_ACTIONS } from 'ai-sparkwrite-editor'; // or '/core', '/vue'

const result = await writeWithAI(editor, {
  prompt: 'Turn the meeting notes into a table of decisions.',
  target: 'selection', // 'selection' | 'cursor' | 'start' | 'end' | 'document' | { from, to }
  history: previous?.messages, // refinement of an earlier answer
  includeDocument: true, // default on for cursor/start/end
  attachments,
  signal,
  onProgress: (markdown) => {},
});
result.keep(); // or result.discard() to restore the original span
```

Other commands: `editor.commands.openAI('Make this concise.')` (panel on the selection), `editor.commands.toggleAIComposer(true)`. `RichTextAIComposer` props: `actions` (`AIComposerAction[]`: `key`, `icon`, `target`, `prompt`, `needsSelection?`, `needsDocument?`), `defaultOpen`, `showTarget`, `hint`, `placeholder`, `rows`, `gradient`, `accent`, `className`, `style`. Katex/Mermaid dialogs and `RichTextAIGenerateField` (Vue) use the same transport for "describe the formula/diagram".

## Behaviour to preserve

- Only the selection (or the allowed document context), the prompt and successful turns are sent. Edits during a panel session close it and abort the request; destroying the editor aborts everything.
- Single-paragraph answers merge into the current paragraph; block-structured answers replace whole blocks; the finished answer is one undo step.
- All UI strings come from the locale keys `editor.ai.*` / `editor.ai.compose.*` and can be overridden with `localeActions.setMessage`.
