import { translate } from '@/locales/store';

import type { AIAttachment, AIMessage, AIOptions, AIRequest } from './types';

/** Strips the `data:<type>;base64,` prefix; providers want the payload alone. */
function base64Payload(dataUrl: string): string {
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}

/** Text attachments are inlined into the prompt; both protocols read them the same way. */
function withInlinedFiles(content: string, attachments: AIAttachment[]): string {
  const files = attachments.filter((attachment) => attachment.kind === 'file' && attachment.text);

  if (!files.length) {
    return content;
  }

  const blocks = files.map((file) => `--- ${file.name} ---\n${file.text}`);

  return [content, ...blocks].filter(Boolean).join('\n\n');
}

function openAIContent(message: AIMessage) {
  const images = (message.attachments ?? []).filter((a) => a.kind === 'image');
  const text = withInlinedFiles(message.content, message.attachments ?? []);

  if (!images.length) {
    return text;
  }

  return [
    { type: 'text', text },
    ...images.map((image) => ({ type: 'image_url', image_url: { url: image.dataUrl } })),
  ];
}

function anthropicContent(message: AIMessage) {
  const images = (message.attachments ?? []).filter((a) => a.kind === 'image');
  const text = withInlinedFiles(message.content, message.attachments ?? []);

  if (!images.length) {
    return text;
  }

  return [
    ...images.map((image) => ({
      type: 'image',
      source: {
        type: 'base64',
        media_type: image.mediaType,
        data: base64Payload(image.dataUrl),
      },
    })),
    { type: 'text', text },
  ];
}

/**
 * Reads a server-sent-events body and hands each text delta to `onChunk`.
 * Returns the concatenated text.
 */
async function readEventStream(
  response: Response,
  extract: (data: string) => string | undefined,
  onChunk: (text: string) => void,
  signal: AbortSignal
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  const onAbort = () => void reader.cancel().catch(() => undefined);
  signal.addEventListener('abort', onAbort, { once: true });
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const event = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        boundary = buffer.indexOf('\n\n');
        const data = event
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('\n');
        if (!data || data === '[DONE]') continue;
        const piece = extract(data);
        if (typeof piece === 'string' && piece) {
          text += piece;
          onChunk(piece);
        }
      }
    }
  } finally {
    signal.removeEventListener('abort', onAbort);
  }
  return text;
}

type Json = Record<string, unknown>;

function parseJSON(data: string): Json | undefined {
  try {
    const json = JSON.parse(data);
    return json && typeof json === 'object' ? (json as Json) : undefined;
  } catch {
    return undefined;
  }
}

/** Text delta of one OpenAI Chat Completions stream chunk. */
function openAIDelta(json: Json): string | undefined {
  return (json.choices as { delta?: { content?: string } }[] | undefined)?.[0]?.delta?.content;
}

/** Text delta of one Anthropic Messages stream event. */
function anthropicDelta(json: Json): string | undefined {
  if (json.type !== 'content_block_delta') return undefined;
  const delta = json.delta as { type?: string; text?: string } | undefined;
  return delta?.type === 'text_delta' ? delta.text : undefined;
}

/** Text of a complete OpenAI Chat Completions response. */
function openAIText(json: Json): unknown {
  return (json.choices as { message?: { content?: unknown } }[] | undefined)?.[0]?.message?.content;
}

/** Text of a complete Anthropic Messages response. */
function anthropicText(json: Json): unknown {
  return Array.isArray(json.content)
    ? json.content
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('\n')
    : undefined;
}

/**
 * One event of your own endpoint's stream: `{ text }` (also `delta` or
 * `content`), a plain string, or an OpenAI / Anthropic chunk passed through.
 */
function endpointDelta(data: string): string | undefined {
  const json = parseJSON(data);
  if (!json) return data;
  for (const key of ['text', 'delta', 'content']) {
    if (typeof json[key] === 'string') return json[key] as string;
  }
  return openAIDelta(json) ?? anthropicDelta(json);
}

/** The text of your own endpoint's JSON answer; same shapes as `endpointDelta`. */
function endpointText(json: Json): unknown {
  for (const key of ['text', 'content', 'markdown']) {
    if (typeof json[key] === 'string') return json[key];
  }
  return openAIText(json) ?? anthropicText(json);
}

/** True when the AI extension can answer: a transport, an endpoint or a model is set. */
export function hasAITransport(options: Pick<AIOptions, 'generate' | 'endpoint' | 'model'>) {
  return !!(options.generate || options.endpoint?.trim() || options.model?.trim());
}

/**
 * POSTs the conversation to `options.endpoint` and reads back either JSON
 * (`{ text }`) or server-sent events (`data: {"text": "…"}` per delta). The
 * model, the provider and the key live behind that URL.
 */
async function generateViaEndpoint(
  options: AIOptions,
  request: AIRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  const stream = !!onChunk && options.stream !== false;
  const messages = request.messages.map((message) => ({
    role: message.role,
    content: withInlinedFiles(message.content, message.attachments ?? []),
    attachments: (message.attachments ?? []).filter((a) => a.kind === 'image'),
  }));
  const response = await fetch(options.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    signal: request.signal,
    body: JSON.stringify({
      messages,
      systemPrompt: request.systemPrompt,
      stream,
      maxTokens: options.maxTokens,
    }),
  });
  // Do not display raw provider errors: a proxy may include credentials in them.
  if (!response.ok)
    throw new Error(translate('editor.ai.error.request', { status: response.status }));
  const type = response.headers.get('content-type') ?? '';
  if (stream && /text\/event-stream/i.test(type)) {
    const streamed = await readEventStream(response, endpointDelta, onChunk!, request.signal);
    if (!streamed.trim()) throw new Error(translate('editor.ai.error.empty'));
    return streamed;
  }
  const raw = await response.text();
  const json = parseJSON(raw);
  const text: unknown = json ? endpointText(json) : raw;
  if (typeof text !== 'string' || !text.trim()) throw new Error(translate('editor.ai.error.empty'));
  return text;
}

/**
 * Asks the configured provider for text. With `onChunk` (and `stream` not
 * disabled) the provider is asked for server-sent events and each delta is
 * passed on as it arrives; the resolved value is always the full text.
 */
export async function generateAIText(
  options: AIOptions,
  request: AIRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  if (options.generate) return options.generate(request, onChunk);
  if (options.endpoint?.trim()) return generateViaEndpoint(options, request, onChunk);
  if (!options.model.trim()) throw new Error(translate('editor.ai.error.noModel'));
  if (options.protocol !== 'openai' && options.protocol !== 'anthropic') {
    throw new Error(translate('editor.ai.error.protocol'));
  }
  const apiKey = typeof options.apiKey === 'function' ? await options.apiKey() : options.apiKey;
  request.signal.throwIfAborted();
  const anthropic = options.protocol === 'anthropic';
  const base = (
    options.baseURL || (anthropic ? 'https://api.anthropic.com/v1' : 'https://api.openai.com/v1')
  ).replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (anthropic) {
    headers['anthropic-version'] = '2023-06-01';
    if (apiKey) {
      headers['x-api-key'] = apiKey;
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
    }
  } else if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  const messages = request.messages.map((message) => ({
    role: message.role,
    content: anthropic ? anthropicContent(message) : openAIContent(message),
  }));
  const stream = !!onChunk && options.stream !== false;
  const response = await fetch(`${base}/${anthropic ? 'messages' : 'chat/completions'}`, {
    method: 'POST',
    headers: { ...headers, ...options.headers },
    signal: request.signal,
    body: JSON.stringify(
      anthropic
        ? {
            model: options.model,
            max_tokens: options.maxTokens,
            system: request.systemPrompt,
            messages,
            ...(stream ? { stream: true } : {}),
          }
        : {
            model: options.model,
            max_completion_tokens: options.maxTokens,
            messages: [{ role: 'system', content: request.systemPrompt }, ...messages],
            ...(stream ? { stream: true } : {}),
          }
    ),
  });
  // Do not display raw provider errors: a proxy may include credentials in them.
  if (!response.ok)
    throw new Error(translate('editor.ai.error.request', { status: response.status }));
  if (stream && /text\/event-stream/i.test(response.headers.get('content-type') ?? '')) {
    const extract = (data: string) => {
      const json = parseJSON(data);
      return json ? (anthropic ? anthropicDelta(json) : openAIDelta(json)) : undefined;
    };
    const streamed = await readEventStream(response, extract, onChunk!, request.signal);
    if (!streamed.trim()) throw new Error(translate('editor.ai.error.empty'));
    return streamed;
  }
  const data = (await response.json()) as Json;
  const text: unknown = anthropic ? anthropicText(data) : openAIText(data);
  if (typeof text !== 'string' || !text.trim()) throw new Error(translate('editor.ai.error.empty'));
  return text;
}
