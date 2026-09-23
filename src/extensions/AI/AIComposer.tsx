import { useEditorState } from '@tiptap/react';
import {
  ArrowUp,
  Check,
  Heading1,
  Languages,
  ListOrdered,
  ListTodo,
  ListTree,
  PenLine,
  RotateCcw,
  Sparkles,
  SpellCheck,
  Square,
  Undo2,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import { AI_COMPOSER_ACTIONS, composerPrompt, type AIComposerAction } from './composer';
import { aiPluginKey } from './state';
import { aiOptionsOf, writeWithAI, type WriteWithAIResult } from './writer';

import type { AIWriteTarget } from './types';
import type { Range } from '@tiptap/core';
import type { ComponentType } from 'react';

const ICONS: Record<string, ComponentType<{ size?: number }>> = {
  PenLine,
  ListTree,
  ListOrdered,
  Heading1,
  ListTodo,
  SpellCheck,
  Languages,
};

type Target = 'selection' | 'cursor' | 'start' | 'end' | 'document';
const TARGETS: Target[] = ['selection', 'cursor', 'start', 'end', 'document'];

export interface RichTextAIComposerProps {
  /** Quick actions shown as chips. Defaults to `AI_COMPOSER_ACTIONS`. */
  actions?: AIComposerAction[];
  /** Start open. Otherwise the `RichTextAI` button, `Mod-J` or `toggleAIComposer()` opens it. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * The composer dock: a prompt bar that sits under the editor and writes
 * straight into the document. Type what you want (or pick a chip), watch the
 * answer stream into the page above as real blocks, then keep it, undo it or
 * ask for a change. Place it after `EditorContent` inside `RichTextProvider`.
 */
export function RichTextAIComposer({
  actions = AI_COMPOSER_ACTIONS,
  defaultOpen = false,
  className = '',
}: RichTextAIComposerProps) {
  const editor = useEditorInstance();
  const { t } = useLocale();
  const state = useEditorState({
    editor,
    selector: ({ editor }) => ({
      open: aiPluginKey.getState(editor.state)?.composer ?? false,
      hasSelection: !editor.state.selection.empty,
      empty: editor.state.doc.textContent.trim().length === 0,
      editable: editor.isEditable,
    }),
  });
  const [prompt, setPrompt] = useState('');
  const [target, setTarget] = useState<Target>('selection');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<WriteWithAIResult | null>(null);
  const controller = useRef<AbortController | null>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const lastRequest = useRef<{ prompt: string; target: AIWriteTarget } | null>(null);

  useEffect(() => {
    if (defaultOpen) editor.commands.toggleAIComposer(true);
  }, [defaultOpen, editor]);

  useEffect(() => {
    if (state?.open) input.current?.focus();
  }, [state?.open]);

  useEffect(() => () => controller.current?.abort(), []);

  if (!state?.open || !aiOptionsOf(editor)) return null;

  async function run(instruction: string, where: AIWriteTarget, refineFrom?: WriteWithAIResult) {
    if (busy || !instruction.trim()) return;
    // A refinement or retry rewrites the same span, so the previous answer
    // goes first and the conversation continues from it.
    let range: Range | null = null;
    if (refineFrom) range = refineFrom.discard();
    else result?.keep();
    setResult(null);
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError('');
    try {
      const next = await writeWithAI(editor, {
        prompt: instruction,
        target: range ?? where,
        history: refineFrom?.messages,
        signal: active.signal,
      });
      if (!refineFrom) lastRequest.current = { prompt: instruction, target: where };
      setResult(next);
      setPrompt('');
    } catch (cause) {
      if (!active.signal.aborted)
        setError(cause instanceof Error ? cause.message : t('editor.ai.error.generic'));
    } finally {
      if (controller.current === active) {
        controller.current = null;
        setBusy(false);
        input.current?.focus();
      }
    }
  }

  function submit() {
    const instruction = prompt.trim();
    if (!instruction) return;
    if (result) void run(instruction, result, result);
    else void run(instruction, target);
  }

  function stop() {
    controller.current?.abort();
  }

  function close() {
    stop();
    result?.keep();
    setResult(null);
    editor.commands.toggleAIComposer(false);
    editor.commands.focus();
  }

  const chips = actions.filter(
    (action) =>
      (!action.needsSelection || state.hasSelection) && (!action.needsDocument || !state.empty)
  );

  return (
    <div
      className={`richtext-ai-composer ${className}`}
      data-richtext-portal
      role='region'
      aria-label={t('editor.ai.compose.title')}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
      }}
    >
      {chips.length && !result ? (
        <div className='richtext-ai-composer-chips' role='group'>
          {chips.map((action) => {
            const Icon = ICONS[action.icon];

            return (
              <button
                key={action.key}
                type='button'
                disabled={busy || !state.editable}
                onClick={() => void run(composerPrompt(action), action.target)}
              >
                {Icon ? <Icon size={14} /> : null}
                {t(action.key)}
              </button>
            );
          })}
        </div>
      ) : null}

      <form
        className='richtext-ai-composer-row'
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <Sparkles className='richtext-ai-composer-icon' size={18} />
        <textarea
          ref={input}
          rows={1}
          aria-label={result ? t('editor.ai.compose.refine') : t('editor.ai.compose.placeholder')}
          placeholder={result ? t('editor.ai.compose.refine') : t('editor.ai.compose.placeholder')}
          value={prompt}
          disabled={busy || !state.editable}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
        />
        {!result ? (
          <select
            aria-label={t('editor.ai.compose.target')}
            value={target}
            disabled={busy}
            onChange={(event) => setTarget(event.target.value as Target)}
          >
            {TARGETS.map((value) => (
              <option key={value} value={value}>
                {value === 'selection' && !state.hasSelection
                  ? t('editor.ai.compose.target.cursor')
                  : t(`editor.ai.compose.target.${value}`)}
              </option>
            ))}
          </select>
        ) : null}
        {busy ? (
          <button
            type='button'
            className='richtext-ai-composer-send'
            aria-label={t('editor.ai.stop')}
            title={t('editor.ai.stop')}
            onClick={stop}
          >
            <Square size={14} fill='currentColor' />
          </button>
        ) : (
          <button
            type='submit'
            className='richtext-ai-composer-send'
            aria-label={t('editor.ai.send')}
            title={t('editor.ai.send')}
            disabled={!prompt.trim() || !state.editable}
          >
            <ArrowUp size={18} />
          </button>
        )}
        <button
          type='button'
          className='richtext-ai-composer-close'
          aria-label={t('editor.ai.compose.close')}
          title={t('editor.ai.compose.close')}
          onClick={close}
        >
          <X size={16} />
        </button>
      </form>

      <div className='richtext-ai-composer-status'>
        {busy ? (
          <span role='status' className='richtext-ai-composer-writing'>
            <span className='richtext-ai-loading-dots' aria-hidden='true'>
              <i />
              <i />
              <i />
            </span>
            {t('editor.ai.compose.writing')}
          </span>
        ) : result ? (
          <div className='richtext-ai-composer-actions'>
            <button
              type='button'
              className='richtext-ai-composer-keep'
              onClick={() => {
                result.keep();
                setResult(null);
                editor.commands.focus();
              }}
            >
              <Check size={15} /> {t('editor.ai.compose.keep')}
            </button>
            <button
              type='button'
              onClick={() => {
                result.discard();
                setResult(null);
                editor.commands.focus();
              }}
            >
              <Undo2 size={15} /> {t('editor.ai.compose.undo')}
            </button>
            <button
              type='button'
              onClick={() => {
                const last = lastRequest.current;
                if (last) void run(last.prompt, last.target, result);
              }}
            >
              <RotateCcw size={15} /> {t('editor.ai.compose.retry')}
            </button>
          </div>
        ) : error ? (
          <span role='alert' className='richtext-ai-composer-error'>
            {error}
          </span>
        ) : (
          <span className='richtext-ai-composer-hint'>{t('editor.ai.compose.hint')}</span>
        )}
      </div>
    </div>
  );
}
