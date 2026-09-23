import { TextSelection, type Transaction } from '@tiptap/pm/state';

import { createMarkdown } from '@/extensions/ExportMarkdown/createMarkdown';

import { generateAIText } from './client';
import { markdownToSlice } from './markdown';
import { aiPluginKey, type AIAction } from './state';

import type { AIMessage, AIOptions, AIWriteTarget, AIAttachment } from './types';
import type { Editor, Range } from '@tiptap/core';

export interface WriteWithAIOptions {
  /** What the user asked for. */
  prompt: string;
  /** Where the answer goes. Default `'selection'`. */
  target?: AIWriteTarget;
  /**
   * Earlier turns of the same conversation, for a refinement ("shorter",
   * "add an example"). The previous answer is included as the assistant turn.
   */
  history?: AIMessage[];
  /**
   * Send the document (as Markdown, trimmed to `documentContext` characters)
   * so the model knows what it is continuing or summarising. Default: on for
   * `cursor`, `start` and `end`; off for `selection` and `document`, whose
   * text is sent in full anyway.
   */
  includeDocument?: boolean;
  /** Images and text files sent with the prompt; see `AIAttachment`. */
  attachments?: AIAttachment[];
  signal?: AbortSignal;
  /** Called with the Markdown so far every time the document is updated. */
  onProgress?: (markdown: string) => void;
}

export interface WriteWithAIResult {
  /** The span the answer now occupies. */
  from: number;
  to: number;
  /** The final answer, as Markdown. */
  markdown: string;
  /** The conversation so far, ready to be passed back as `history`. */
  messages: AIMessage[];
  /**
   * Puts back what the span held before the answer replaced it and returns
   * the span the original now occupies (the place to retry into), or null
   * when there was nothing to discard.
   */
  discard: () => Range | null;
  /** Accepts the answer: stops tracking the span. */
  keep: () => void;
}

/** The AI extension's options, or null when it is not registered. */
export function aiOptionsOf(editor: Editor): AIOptions | null {
  const extension = editor.extensionManager.extensions.find((ext) => ext.name === 'ai');
  return (extension?.options as AIOptions | undefined) ?? null;
}

/** Resolves a target to positions in the current document. */
export function resolveWriteTarget(editor: Editor, target: AIWriteTarget): Range {
  const { doc, selection } = editor.state;
  if (typeof target === 'object') return { from: target.from, to: target.to };
  switch (target) {
    case 'cursor':
      return { from: selection.to, to: selection.to };
    case 'start':
      return { from: 0, to: 0 };
    case 'end':
      return { from: doc.content.size, to: doc.content.size };
    case 'document':
      return { from: 0, to: doc.content.size };
    default:
      return { from: selection.from, to: selection.to };
  }
}

/**
 * A span of the document as Markdown, so headings, lists, tables and code
 * reach the model as structure rather than flattened text. Text inside a
 * single block stays plain text (no escaping noise for a sentence). Uses
 * `serializeDocument` from the AI options when set, else the editor's own
 * Markdown export. Not a dynamic import: one would drag a bundler interop
 * chunk into the core entry.
 */
export async function rangeMarkdown(editor: Editor, range: Range): Promise<string> {
  const { doc } = editor.state;
  const from = Math.max(0, Math.min(range.from, doc.content.size));
  const to = Math.max(from, Math.min(range.to, doc.content.size));
  if (from === to) return '';
  const plain = doc.textBetween(from, to, '\n');
  const $from = doc.resolve(from);
  if ($from.parent.isTextblock && $from.sameParent(doc.resolve(to))) return plain;
  const serialize = aiOptionsOf(editor)?.serializeDocument;
  try {
    if (serialize) return await serialize(editor, { from, to });
    const content = doc.type.create(null, doc.slice(from, to).content).toJSON();
    return createMarkdown(editor, { content }).trim() || plain;
  } catch {
    return plain;
  }
}

/**
 * The document as Markdown for the model, trimmed to `limit` characters from
 * the end (a "continue writing" needs what comes last).
 */
export async function documentContext(editor: Editor, limit: number): Promise<string> {
  if (limit <= 0) return '';
  const text = await rangeMarkdown(editor, { from: 0, to: editor.state.doc.content.size });
  if (text.length <= limit) return text;
  return `…${text.slice(-limit)}`;
}

function buildPrompt(
  instruction: string,
  selectedText: string,
  context: string,
  target: AIWriteTarget
): string {
  const parts: string[] = [];
  if (context) parts.push(`Document so far (Markdown):\n${context}`);
  if (selectedText && target !== 'document') parts.push(`Selected text:\n${selectedText}`);
  else if (selectedText) parts.push(`Document:\n${selectedText}`);
  parts.push(instruction.trim());
  return parts.filter(Boolean).join('\n\n');
}

/**
 * Asks the model and writes the answer straight into the document, block by
 * block, as it streams. Headings, lists, tables and code arrive as real
 * nodes, not as a preview to apply later. While the answer is arriving the
 * span is marked (`.richtext-ai-writing`) and follows any edit made elsewhere
 * in the document. The finished answer is a single undo step, and `discard()`
 * puts the original content back.
 */
export async function writeWithAI(
  editor: Editor,
  options: WriteWithAIOptions
): Promise<WriteWithAIResult> {
  const aiOptions = aiOptionsOf(editor);
  if (!aiOptions) throw new Error('The AI extension is not registered.');
  const target = options.target ?? 'selection';
  const range = resolveWriteTarget(editor, target);
  const original = editor.state.doc.slice(range.from, range.to);
  const selectedText = await rangeMarkdown(editor, range);
  const wantsContext =
    options.includeDocument ?? (target === 'cursor' || target === 'start' || target === 'end');
  const context = wantsContext ? await documentContext(editor, aiOptions.documentContext) : '';
  options.signal?.throwIfAborted();

  const messages: AIMessage[] = [
    ...(options.history ?? []),
    {
      role: 'user',
      content: options.history?.length
        ? options.prompt.trim()
        : buildPrompt(options.prompt, selectedText, context, target),
      attachments: options.attachments?.length ? options.attachments : undefined,
    },
  ];

  // The span is tracked in the plugin state, so edits elsewhere move it.
  let markdown = '';
  let pending = '';
  let frame = 0;
  const setWriting = (writing: Range | null, tr = editor.state.tr) =>
    tr.setMeta(aiPluginKey, { type: 'writing', writing } satisfies AIAction);
  const currentSpan = (): Range => aiPluginKey.getState(editor.state)?.writing ?? range;

  editor.view.dispatch(setWriting(range).setMeta('addToHistory', false));

  function render(text: string, addToHistory: boolean): Range {
    const span = currentSpan();
    const tr = editor.state.tr;
    const before = tr.doc.content.size;
    const slice = text.trim() ? markdownToSlice(editor, text) : original;
    tr.replaceRange(span.from, span.to, slice);
    const next = { from: span.from, to: span.to + (tr.doc.content.size - before) };
    // Follow the writing only when the caret was already in it.
    const { from, to } = editor.state.selection;
    if (from >= span.from && to <= span.to) {
      tr.setSelection(
        TextSelection.near(tr.doc.resolve(Math.min(next.to, tr.doc.content.size)), -1)
      );
    }
    setWriting(addToHistory ? null : next, tr);
    tr.setMeta('addToHistory', addToHistory);
    if (!addToHistory) tr.setMeta('preventUpdate', true);
    editor.view.dispatch(tr);
    return next;
  }

  function flush() {
    frame = 0;
    if (!pending) return;
    markdown += pending;
    pending = '';
    if (editor.isDestroyed) return;
    render(markdown, false);
    options.onProgress?.(markdown);
  }

  const onChunk = (text: string) => {
    if (options.signal?.aborted) return;
    pending += text;
    if (!frame) frame = requestAnimationFrame(flush);
  };

  let final: string;
  try {
    final = await generateAIText(
      aiOptions,
      {
        messages,
        systemPrompt: aiOptions.systemPrompt,
        signal: options.signal ?? new AbortController().signal,
      },
      onChunk
    );
  } catch (error) {
    cancelAnimationFrame(frame);
    frame = 0;
    // Whatever streamed in stays if the user stopped; an error puts the
    // original back.
    if (options.signal?.aborted && (markdown || pending)) {
      pending = '';
      final = markdown;
    } else {
      if (!editor.isDestroyed) {
        const span = currentSpan();
        editor.view.dispatch(
          setWriting(null, editor.state.tr.replaceRange(span.from, span.to, original)).setMeta(
            'addToHistory',
            false
          )
        );
      }
      throw error;
    }
  }
  cancelAnimationFrame(frame);
  frame = 0;
  pending = '';
  markdown = final;

  // One undo step: put the original back silently, then apply the answer.
  const span = currentSpan();
  editor.view.dispatch(
    setWriting(null, editor.state.tr.replaceRange(span.from, span.to, original)).setMeta(
      'addToHistory',
      false
    )
  );
  const tr = editor.state.tr;
  const before = tr.doc.content.size;
  const start = span.from;
  const end = span.from + original.size;
  if (markdown.trim()) tr.replaceRange(start, end, markdownToSlice(editor, markdown));
  const result: Range = { from: start, to: end + (tr.doc.content.size - before) };
  tr.setSelection(TextSelection.near(tr.doc.resolve(Math.min(result.to, tr.doc.content.size)), -1));
  tr.scrollIntoView();
  editor.view.dispatch(tr);

  const answer: AIMessage[] = [...messages, { role: 'assistant', content: markdown }];
  let discarded = false;
  let tracked: Range = result;
  const track = ({ transaction }: { transaction: Transaction }) => {
    if (!transaction.docChanged) return;
    tracked = {
      from: transaction.mapping.map(tracked.from, -1),
      to: transaction.mapping.map(tracked.to, 1),
    };
  };
  editor.on('transaction', track);
  return {
    ...result,
    markdown,
    messages: answer,
    keep: () => editor.off('transaction', track),
    discard: () => {
      editor.off('transaction', track);
      if (discarded || editor.isDestroyed) return null;
      discarded = true;
      const size = editor.state.doc.content.size;
      const from = Math.min(tracked.from, size);
      const to = Math.min(Math.max(tracked.to, from), size);
      const tr = editor.state.tr.replaceRange(from, to, original);
      editor.view.dispatch(tr.scrollIntoView());
      return { from, to: from + (tr.doc.content.size - size) + (to - from) };
    },
  };
}
