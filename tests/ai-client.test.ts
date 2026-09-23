import assert from 'node:assert/strict';
import { test } from 'node:test';

import { generateAIText, hasAITransport } from '../src/extensions/AI/client';

import type { AIOptions, AIRequest } from '../src/extensions/AI/types';

const options: AIOptions = {
  endpoint: '',
  protocol: 'openai',
  apiKey: 'test-key',
  baseURL: '',
  model: 'test-model',
  maxTokens: 128,
  headers: {},
  systemPrompt: 'Write text',
  generate: null,
};
const request = (): AIRequest => ({
  systemPrompt: 'Write text',
  messages: [{ role: 'user', content: 'Hello' }],
  signal: new AbortController().signal,
});

test('OpenAI and Anthropic serialize their own headers, bodies, and responses', async () => {
  const original = globalThis.fetch;
  try {
    for (const protocol of ['openai', 'anthropic'] as const) {
      globalThis.fetch = async (url, init) => {
        const headers = init!.headers as Record<string, string>;
        const body = JSON.parse(init!.body as string);
        assert.equal(body.model, 'test-model');
        assert.ok(init!.signal);
        if (protocol === 'openai') {
          assert.equal(url, 'https://api.openai.com/v1/chat/completions');
          assert.equal(headers.Authorization, 'Bearer test-key');
          assert.equal(body.max_completion_tokens, 128);
          assert.equal(body.messages[0].role, 'system');
          return Response.json({ choices: [{ message: { content: 'OpenAI text' } }] });
        }
        assert.equal(url, 'https://api.anthropic.com/v1/messages');
        assert.equal(headers['x-api-key'], 'test-key');
        assert.equal(headers['anthropic-version'], '2023-06-01');
        assert.equal(body.system, 'Write text');
        assert.equal(body.max_tokens, 128);
        assert.equal(body.messages[0].role, 'user');
        return Response.json({
          content: [
            { type: 'thinking', thinking: 'hidden' },
            { type: 'text', text: 'Anthropic text' },
          ],
        });
      };
      assert.equal(
        await generateAIText({ ...options, protocol }, request()),
        protocol === 'openai' ? 'OpenAI text' : 'Anthropic text'
      );
    }
  } finally {
    globalThis.fetch = original;
  }
});

test('proxy, async keys, failures, empty responses, and cancellation', async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/ai/chat/completions');
      assert.equal((init!.headers as Record<string, string>).Authorization, undefined);
      return Response.json({ choices: [{ message: { content: 'proxy' } }] });
    };
    assert.equal(
      await generateAIText({ ...options, baseURL: '/api/ai/', apiKey: async () => '' }, request()),
      'proxy'
    );
    globalThis.fetch = async () => new Response('secret-key', { status: 401 });
    await assert.rejects(generateAIText(options, request()), /AI request failed \(401\)/);
    globalThis.fetch = async () => Response.json({ choices: [] });
    await assert.rejects(generateAIText(options, request()), /no text/);
    await assert.rejects(
      generateAIText({ ...options, model: '' }, request()),
      /Configure an AI endpoint or model/
    );
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(generateAIText(options, { ...request(), signal: controller.signal }), {
      name: 'AbortError',
    });
    assert.equal(
      await generateAIText({ ...options, generate: async () => 'custom' }, request()),
      'custom'
    );
  } finally {
    globalThis.fetch = original;
  }
});

test('server-sent events stream deltas and resolve with the full text', async () => {
  const original = globalThis.fetch;
  try {
    for (const protocol of ['openai', 'anthropic'] as const) {
      const events =
        protocol === 'openai'
          ? [
              'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
              'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
              'data: [DONE]\n\n',
            ]
          : [
              'event: message_start\ndata: {"type":"message_start"}\n\n',
              'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hel"}}\n\n',
              'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"lo"}}\n\n',
              'event: message_stop\ndata: {"type":"message_stop"}\n\n',
            ];
      globalThis.fetch = async (_url, init) => {
        assert.equal(JSON.parse(init!.body as string).stream, true);
        const encoder = new TextEncoder();
        const body = new ReadableStream({
          start(controller) {
            for (const event of events) controller.enqueue(encoder.encode(event));
            controller.close();
          },
        });
        return new Response(body, { headers: { 'content-type': 'text/event-stream' } });
      };
      const chunks: string[] = [];
      const text = await generateAIText({ ...options, protocol }, request(), (chunk) =>
        chunks.push(chunk)
      );
      assert.equal(text, 'Hello');
      assert.deepEqual(chunks, ['Hel', 'lo']);
    }
    // Without onChunk the request is not a streaming one.
    globalThis.fetch = async (_url, init) => {
      assert.equal(JSON.parse(init!.body as string).stream, undefined);
      return Response.json({ choices: [{ message: { content: 'plain' } }] });
    };
    assert.equal(await generateAIText(options, request()), 'plain');
  } finally {
    globalThis.fetch = original;
  }
});

test('an endpoint receives the conversation as JSON and answers with { text } or a stream', async () => {
  const original = globalThis.fetch;
  try {
    const endpoint = { ...options, endpoint: '/api/ai', model: '', headers: { 'X-Team': 'docs' } };
    assert.ok(hasAITransport(endpoint));
    assert.ok(!hasAITransport({ ...options, model: '' }));

    // JSON answer; the request carries messages, systemPrompt, stream and maxTokens.
    globalThis.fetch = async (url, init) => {
      assert.equal(url, '/api/ai');
      const headers = init!.headers as Record<string, string>;
      assert.equal(headers['X-Team'], 'docs');
      assert.equal(headers.Authorization, undefined);
      const body = JSON.parse(init!.body as string);
      assert.equal(body.model, undefined);
      assert.equal(body.systemPrompt, 'Write text');
      assert.equal(body.stream, false);
      assert.equal(body.maxTokens, 128);
      assert.deepEqual(body.messages, [{ role: 'user', content: 'Hello', attachments: [] }]);
      return Response.json({ text: 'From my server' });
    };
    assert.equal(await generateAIText(endpoint, request()), 'From my server');

    // Plain text and provider-shaped answers work too.
    globalThis.fetch = async () => new Response('plain answer');
    assert.equal(await generateAIText(endpoint, request()), 'plain answer');
    globalThis.fetch = async () => Response.json({ choices: [{ message: { content: 'openai' } }] });
    assert.equal(await generateAIText(endpoint, request()), 'openai');
    globalThis.fetch = async () => Response.json({ ok: true });
    await assert.rejects(generateAIText(endpoint, request()), /no text/);
    globalThis.fetch = async () => new Response('leaked-secret', { status: 500 });
    await assert.rejects(generateAIText(endpoint, request()), /AI request failed \(500\)/);

    // Streaming: { text } events, raw strings and OpenAI chunks all count as deltas.
    globalThis.fetch = async (_url, init) => {
      assert.equal(JSON.parse(init!.body as string).stream, true);
      const encoder = new TextEncoder();
      const events = [
        'data: {"text":"Hel"}\n\n',
        'data: lo\n\n',
        'data: {"choices":[{"delta":{"content":"!"}}]}\n\n',
        'data: [DONE]\n\n',
      ];
      const body = new ReadableStream({
        start(controller) {
          for (const event of events) controller.enqueue(encoder.encode(event));
          controller.close();
        },
      });
      return new Response(body, { headers: { 'content-type': 'text/event-stream' } });
    };
    const chunks: string[] = [];
    assert.equal(
      await generateAIText(endpoint, request(), (chunk) => chunks.push(chunk)),
      'Hello!'
    );
    assert.deepEqual(chunks, ['Hel', 'lo', '!']);

    // File attachments are inlined into the content; images travel on `attachments`.
    globalThis.fetch = async (_url, init) => {
      const body = JSON.parse(init!.body as string);
      assert.match(body.messages[0].content, /--- notes.txt ---\nsome notes/);
      assert.equal(body.messages[0].attachments.length, 1);
      assert.equal(body.messages[0].attachments[0].kind, 'image');
      return Response.json({ text: 'ok' });
    };
    const req = request();
    req.messages[0].attachments = [
      {
        id: '1',
        name: 'notes.txt',
        mediaType: 'text/plain',
        dataUrl: 'data:,',
        kind: 'file',
        text: 'some notes',
      },
      {
        id: '2',
        name: 'a.png',
        mediaType: 'image/png',
        dataUrl: 'data:image/png;base64,AAAA',
        kind: 'image',
      },
    ];
    assert.equal(await generateAIText(endpoint, req), 'ok');
  } finally {
    globalThis.fetch = original;
  }
});
