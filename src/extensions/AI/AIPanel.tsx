import { ArrowUp, Check, Paperclip, RotateCcw, Sparkles, Square, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLocale } from '@/locales';

import { generateAIText } from './client';

import type { AIAttachment, AIMessage, AIOptions } from './types';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Math.round(bytes / (1024 * 1024))} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

/** Splits text into paragraphs of word tokens; each token keeps its surrounding whitespace. */
function tokenize(text: string) {
  return text.split(/\n\s*\n/).map((paragraph) => paragraph.match(/\s*\S+\s*/g) ?? []);
}

export interface AIPanelProps {
  options: AIOptions;
  selectedText: string;
  initialPrompt?: string;
  apply: (text: string) => void;
  close: () => void;
}

export function AIPanel({ options, selectedText, initialPrompt, apply, close }: AIPanelProps) {
  const { t } = useLocale();
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [tone, setTone] = useState('');
  const [attachments, setAttachments] = useState<AIAttachment[]>([]);
  const filePicker = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState('');
  const paragraphs = useMemo(() => (result ? tokenize(result) : []), [result]);
  const total = paragraphs.reduce((sum, tokens) => sum + tokens.length, 0);
  const [revealed, setRevealed] = useState(0);
  const animation = useRef(0);
  const revealing = revealed < total;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const working = busy || revealing;
  const input = useRef<HTMLTextAreaElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);
  const controller = useRef<AbortController | null>(null);
  const history = useRef<AIMessage[]>([]);
  const lastRequest = useRef<AIMessage[]>([]);

  const startPreset = useRef(() => {
    if (initialPrompt) void submit(false, initialPrompt);
  });

  useEffect(() => {
    // Slash command restores editor focus after its action completes.
    const frame = requestAnimationFrame(() => {
      input.current?.focus();
      startPreset.current();
    });
    return () => {
      cancelAnimationFrame(frame);
      controller.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!total) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(total);
      return;
    }
    // Words stream in at a steady cadence; each newly mounted word fades in via CSS.
    const duration = Math.min(total * 60, 5000);
    const start = performance.now();
    function tick(now: number) {
      const count = Math.min(total, Math.max(1, Math.floor(((now - start) / duration) * total)));
      setRevealed(count);
      if (count < total) animation.current = requestAnimationFrame(tick);
    }
    animation.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animation.current);
  }, [paragraphs, total]);

  useEffect(() => {
    if (busy) stopButton.current?.focus();
    else if (!revealing) input.current?.focus();
  }, [busy, revealing]);

  const imageInput = options.enableImageInput !== false;
  const fileInput = options.enableFileInput !== false;
  const canAttach = imageInput || fileInput;
  const acceptedMimes = [
    ...(imageInput ? (options.imageMimes ?? []) : []),
    ...(fileInput ? (options.fileMimes ?? []) : []),
  ];

  async function addFiles(files: File[]) {
    const maxSize = options.maxAttachmentSize ?? 4 * 1024 * 1024;
    const next: AIAttachment[] = [];

    for (const file of files) {
      const isImage = imageInput && file.type.startsWith('image/');
      const isFile = fileInput && (options.fileMimes ?? []).includes(file.type);

      if (!isImage && !isFile) {
        setError(t('editor.ai.error.fileType', { name: file.name }));
        continue;
      }

      if (file.size > maxSize) {
        setError(t('editor.ai.error.fileTooBig', { name: file.name, size: formatSize(maxSize) }));
        continue;
      }

      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        name: file.name,
        mediaType: file.type,
        dataUrl: await readAsDataUrl(file),
        kind: isImage ? 'image' : 'file',
        text: isImage ? undefined : await file.text(),
      });
    }

    if (next.length) {
      setAttachments((current) => [
        ...current,
        ...next.filter((item) => !current.some((existing) => existing.id === item.id)),
      ]);
    }
  }

  async function submit(retry = false, instruction = prompt) {
    if (working || controller.current || (!retry && !instruction.trim() && !attachments.length))
      return;
    const messages: AIMessage[] = retry
      ? lastRequest.current
      : [
          ...history.current,
          {
            role: 'user',
            content: [
              history.current.length === 0 && selectedText ? `Selected text:\n${selectedText}` : '',
              instruction.trim(),
              tone ? `Tone: ${tone}` : '',
            ]
              .filter(Boolean)
              .join('\n\n'),
            attachments: attachments.length ? attachments : undefined,
          },
        ];
    if (!messages.length) return;
    lastRequest.current = messages;
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError('');
    try {
      const text = await generateAIText(options, {
        messages,
        systemPrompt: options.systemPrompt,
        signal: active.signal,
      });
      if (active.signal.aborted) return;
      if (!text.trim()) throw new Error(t('editor.ai.error.empty'));
      history.current = [...messages, { role: 'assistant', content: text }];
      if (text !== result) setRevealed(0);
      setResult(text);
      setPrompt('');
      setAttachments([]);
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

  function stop() {
    cancelAnimationFrame(animation.current);
    setRevealed(total);
    controller.current?.abort();
    controller.current = null;
    setBusy(false);
    input.current?.focus();
  }

  let offset = 0;
  const preview = paragraphs.map((tokens, index) => {
    const start = offset;
    offset += tokens.length;
    // Paragraphs the stream has not reached yet stay unmounted so they take no space.
    if (index > 0 && revealed <= start) return null;
    const shown = Math.min(tokens.length, Math.max(0, revealed - start));
    return (
      <p key={index}>
        <span className='richtext-ai-insertion'>
          {tokens.slice(0, shown).map((token, position) => (
            <span key={position} className='richtext-ai-word'>
              {token}
            </span>
          ))}
        </span>
      </p>
    );
  });

  return (
    <div
      className='richtext-ai'
      data-richtext-portal
      role='dialog'
      aria-label={t('editor.ai.title')}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          close();
        }
        event.stopPropagation();
      }}
    >
      {result ? (
        <div
          className='richtext-ai-preview'
          aria-label={t('editor.ai.preview')}
          aria-busy={revealing}
        >
          {preview}
        </div>
      ) : null}
      {busy ? (
        <div className='richtext-ai-loading'>
          <span className='richtext-ai-loading-label' role='status'>
            {t('editor.ai.writing')}
          </span>
          <span className='richtext-ai-loading-dots' aria-hidden='true'>
            <i />
            <i />
            <i />
          </span>
          <button
            ref={stopButton}
            type='button'
            className='richtext-ai-loading-stop'
            aria-label={t('editor.ai.stop')}
            title={t('editor.ai.stop')}
            onClick={stop}
          >
            <Square size={10} fill='currentColor' />
          </button>
        </div>
      ) : (
        <form
          className={`richtext-ai-panel ${result ? 'richtext-ai-review' : ''}`}
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {!result ? (
            <div className='richtext-ai-heading'>
              <span>
                <Sparkles size={16} /> {t('editor.ai.title')}
              </span>
              <button type='button' aria-label={t('editor.ai.close')} onClick={close}>
                <X size={16} />
              </button>
            </div>
          ) : null}

          {attachments.length ? (
            <ul className='richtext-ai-attachments'>
              {attachments.map((attachment) => (
                <li key={attachment.id}>
                  {attachment.kind === 'image' ? (
                    <img alt='' src={attachment.dataUrl} />
                  ) : (
                    <Paperclip size={13} />
                  )}
                  <span title={attachment.name}>{attachment.name}</span>
                  <button
                    type='button'
                    aria-label={t('editor.ai.attach.remove', { name: attachment.name })}
                    onClick={() =>
                      setAttachments((current) =>
                        current.filter((item) => item.id !== attachment.id)
                      )
                    }
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <div className='richtext-ai-prompt-row'>
            {result ? <Sparkles className='richtext-ai-prompt-icon' size={17} /> : null}
            <textarea
              ref={input}
              aria-label={result ? t('editor.ai.refine.label') : t('editor.ai.prompt.label')}
              placeholder={
                result ? t('editor.ai.refine.placeholder') : t('editor.ai.prompt.placeholder')
              }
              value={prompt}
              disabled={working}
              rows={result ? 1 : 3}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void submit();
                }
              }}
            />
            {result ? (
              <button
                type={revealing ? 'button' : 'submit'}
                className='richtext-ai-send'
                aria-label={revealing ? t('editor.ai.stop') : t('editor.ai.send')}
                disabled={!revealing && !prompt.trim()}
                onClick={revealing ? stop : undefined}
              >
                {revealing ? <Square size={16} /> : <ArrowUp size={20} />}
              </button>
            ) : null}
          </div>

          {!result ? (
            <div className='richtext-ai-compose-actions'>
              {canAttach ? (
                <>
                  <button
                    type='button'
                    className='richtext-ai-attach'
                    aria-label={t('editor.ai.attach')}
                    title={t('editor.ai.attach')}
                    disabled={working}
                    onClick={() => filePicker.current?.click()}
                  >
                    <Paperclip size={16} />
                  </button>
                  <input
                    accept={acceptedMimes.join(',')}
                    hidden
                    multiple
                    ref={filePicker}
                    type='file'
                    onChange={(event) => {
                      void addFiles(Array.from(event.currentTarget.files ?? []));
                      event.currentTarget.value = '';
                    }}
                  />
                </>
              ) : null}

              <label className='richtext-ai-tone'>
                {t('editor.ai.tone')}{' '}
                <select
                  aria-label={t('editor.ai.tone')}
                  value={tone}
                  disabled={working}
                  onChange={(event) => setTone(event.target.value)}
                >
                  <option value=''>{t('editor.ai.tone.default')}</option>
                  <option value='Professional'>{t('editor.ai.tone.professional')}</option>
                  <option value='Friendly'>{t('editor.ai.tone.friendly')}</option>
                  <option value='Casual'>{t('editor.ai.tone.casual')}</option>
                  <option value='Confident'>{t('editor.ai.tone.confident')}</option>
                </select>
              </label>

              {/* The error sits on this row rather than on a line of its own. */}
              <span className='richtext-ai-error' role='alert'>
                {error}
              </span>

              {working ? (
                <button type='button' aria-label={t('editor.ai.stop')} onClick={stop}>
                  <Square size={16} />
                </button>
              ) : (
                <button
                  type='submit'
                  className='richtext-ai-send'
                  aria-label={t('editor.ai.send')}
                  disabled={!prompt.trim() && !attachments.length}
                >
                  <ArrowUp size={20} />
                </button>
              )}
            </div>
          ) : null}

          {result && error ? (
            <p className='richtext-ai-error richtext-ai-error-block' role='alert'>
              {error}
            </p>
          ) : null}

          {/* Only a result is worth keeping or discarding; an error just needs a retry. */}
          {result ? (
            <div className='richtext-ai-actions'>
              <button type='button' disabled={working} onClick={() => void submit(true)}>
                <RotateCcw size={16} /> {t('editor.ai.retry')}
              </button>
              <div>
                <button type='button' onClick={close}>
                  <X size={16} /> {t('editor.ai.discard')}
                </button>
                <button
                  type='button'
                  className='richtext-ai-apply'
                  disabled={working}
                  onClick={() => apply(result)}
                >
                  <Check size={17} /> {t('editor.ai.apply')}
                </button>
              </div>
            </div>
          ) : null}
        </form>
      )}
    </div>
  );
}
