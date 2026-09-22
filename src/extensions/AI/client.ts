import { translate } from '@/locales';

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

export async function generateAIText(options: AIOptions, request: AIRequest): Promise<string> {
  if (options.generate) return options.generate(request);
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
          }
        : {
            model: options.model,
            max_completion_tokens: options.maxTokens,
            messages: [{ role: 'system', content: request.systemPrompt }, ...messages],
          }
    ),
  });
  // Do not display raw provider errors: a proxy may include credentials in them.
  if (!response.ok)
    throw new Error(translate('editor.ai.error.request', { status: response.status }));
  const data = await response.json();
  const text: unknown = anthropic
    ? Array.isArray(data.content)
      ? data.content
          .filter((block: { type: string }) => block.type === 'text')
          .map((block: { text: string }) => block.text)
          .join('\n')
      : undefined
    : data.choices?.[0]?.message?.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error(translate('editor.ai.error.empty'));
  return text;
}
