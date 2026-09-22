import { Sparkles, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { generateAIText } from '@/extensions/AI/client';
import { useLocale } from '@/locales';

import type { AIOptions } from '@/extensions/AI/types';
import type { Editor } from '@tiptap/core';

/** The AI extension's options when it is registered and usable, else null. */
export function usableAIOptions(editor: Editor | null | undefined): AIOptions | null {
  const extension = editor?.extensionManager.extensions.find((item) => item.name === 'ai');
  const options = extension?.options as AIOptions | undefined;

  if (!options || (!options.generate && !options.model)) {
    return null;
  }

  return options;
}

/** Models like to wrap source in ``` fences even when told not to. */
function stripFences(text: string): string {
  return text
    .replace(/^\s*```[\w-]*\s*\n?/, '')
    .replace(/\n?\s*```\s*$/, '')
    .trim();
}

export interface AIGenerateFieldProps {
  editor: Editor | null | undefined;
  /** System prompt that pins the output format ("return only Mermaid source"). */
  instruction: string;
  placeholder: string;
  /** What is in the editor field now, sent along so "make it blue" works. */
  current?: string;
  /** Receives the text as it streams and once more when complete. */
  onResult: (text: string) => void;
}

/**
 * "Describe it, let the model write the source" — a one-line prompt for dialogs
 * that edit a language the model knows (LaTeX, Mermaid). Renders nothing when
 * the AI extension is absent or unconfigured.
 */
export function AIGenerateField({
  editor,
  instruction,
  placeholder,
  current,
  onResult,
}: AIGenerateFieldProps) {
  const { t } = useLocale();
  const options = usableAIOptions(editor);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  if (!options) {
    return null;
  }

  async function submit() {
    if (busy || !prompt.trim()) return;
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError('');
    let streamed = '';
    try {
      const content = current?.trim()
        ? `Current source:\n${current}\n\nInstruction: ${prompt.trim()}`
        : prompt.trim();
      const text = await generateAIText(
        options!,
        { messages: [{ role: 'user', content }], systemPrompt: instruction, signal: active.signal },
        (chunk) => {
          streamed += chunk;
          onResult(stripFences(streamed));
        }
      );
      if (!active.signal.aborted) onResult(stripFences(text));
    } catch (cause) {
      if (!active.signal.aborted)
        setError(cause instanceof Error ? cause.message : t('editor.ai.error.generic'));
    } finally {
      if (controller.current === active) {
        controller.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <div className='richtext-mb-[10px]'>
      <div className='richtext-flex richtext-items-center richtext-gap-2 richtext-rounded-md richtext-border richtext-border-solid richtext-border-border richtext-bg-background richtext-px-2 richtext-py-1'>
        <Sparkles className='richtext-shrink-0 richtext-text-[#804dff]' size={15} />
        <input
          aria-label={placeholder}
          className='richtext-min-w-0 richtext-flex-1 richtext-border-0 richtext-bg-transparent richtext-py-1 richtext-text-sm richtext-text-foreground richtext-outline-none'
          disabled={busy}
          placeholder={placeholder}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void submit();
            }
          }}
        />
        {busy ? (
          <button
            aria-label={t('editor.ai.stop')}
            className='richtext-flex richtext-size-7 richtext-items-center richtext-justify-center richtext-rounded richtext-border-0 richtext-bg-transparent richtext-text-foreground hover:richtext-bg-accent'
            type='button'
            onClick={() => {
              controller.current?.abort();
              controller.current = null;
              setBusy(false);
            }}
          >
            <Square size={12} fill='currentColor' />
          </button>
        ) : (
          <button
            className='richtext-rounded richtext-border-0 richtext-bg-[#804dff] richtext-px-2.5 richtext-py-1 richtext-text-xs richtext-font-medium richtext-text-white disabled:richtext-opacity-50'
            disabled={!prompt.trim()}
            type='button'
            onClick={() => void submit()}
          >
            {t('editor.ai.generate')}
          </button>
        )}
      </div>
      {error ? (
        <p className='richtext-mt-1 richtext-text-xs richtext-text-red-500' role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}
