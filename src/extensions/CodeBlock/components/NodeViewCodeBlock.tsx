import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import { Check, Copy, Search, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { IconComponent } from '@/components/icons';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { guessLanguage } from '@/extensions/CodeBlock/detect-language';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';

import type { NodeViewProps } from '@tiptap/react';

/**
 * Languages in rough order of how often they turn up in documents. The picker
 * lists them in this order, then everything else alphabetically, so the common
 * choice is a glance away instead of a scroll away.
 */
const POPULAR_LANGUAGES = [
  'js',
  'ts',
  'tsx',
  'jsx',
  'py',
  'java',
  'go',
  'rs',
  'json',
  'html',
  'css',
  'scss',
  'bash',
  'sql',
  'yaml',
  'md',
  'php',
  'cs',
  'cpp',
  'c',
  'rb',
  'swift',
  'kt',
];

const OTHER_LANGUAGES = [
  'asm',
  'astro',
  'csv',
  'dart',
  'diff',
  'docker',
  'graphql',
  'http',
  'ini',
  'less',
  'log',
  'lua',
  'make',
  'pl',
  'plain',
  'ps1',
  'svelte',
  'toml',
  'uri',
  'vue',
  'xml',
];

export const LIST_LANG = [...POPULAR_LANGUAGES, ...OTHER_LANGUAGES.slice().sort()];

export const MAP_LANGUAGE_LABEL: Record<string, string> = {
  plaintext: 'Plain Text',
  js: 'JavaScript',
  ts: 'TypeScript',
  css: 'CSS',
  html: 'HTML',
  python: 'Python',
  bash: 'Bash',
  asm: 'Assembly',
  astro: 'Astro',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  csv: 'CSV',
  dart: 'Dart',
  diff: 'Diff',
  docker: 'Dockerfile',
  go: 'Go',
  graphql: 'GraphQL',
  http: 'HTTP',
  ini: 'INI',
  java: 'Java',
  json: 'JSON',
  jsx: 'JSX',
  kt: 'Kotlin',
  less: 'Less',
  log: 'Log',
  lua: 'Lua',
  make: 'Makefile',
  md: 'Markdown',
  php: 'PHP',
  pl: 'Perl',
  plain: 'Plain Text',
  ps1: 'PowerShell',
  py: 'Python',
  rb: 'Ruby',
  rs: 'Rust',
  scss: 'SCSS',
  sql: 'SQL',
  svelte: 'Svelte',
  swift: 'Swift',
  toml: 'TOML',
  ts_: 'TypeScript',
  tsx: 'TSX',
  uri: 'URI/URL',
  vue: 'Vue.js',
  xml: 'XML',
  yaml: 'YAML',
};

const AUTO_VALUE = '__auto__';
const COPIED_FEEDBACK_MS = 1500;

function labelOf(value: string) {
  return MAP_LANGUAGE_LABEL[value] || value;
}

const toolbarButtonClass =
  'richtext-flex richtext-items-center richtext-justify-center richtext-rounded richtext-border-none richtext-bg-transparent richtext-p-1 richtext-text-[var(--shj-numbers)] richtext-transition-colors hover:richtext-text-[var(--shj-fg)] focus-visible:richtext-text-[var(--shj-fg)]';

/**
 * Code block node view.
 *
 * The controls live in the block's top-right corner and appear on hover, so
 * typing never moves them (GitHub / Notion behaviour), and a line-number gutter
 * is painted outside the scrolling code area.
 */
export function NodeViewCodeBlock({
  node,
  updateAttributes,
  deleteNode,
  extension,
  editor,
}: NodeViewProps) {
  const { t } = useLocale();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const code = node.textContent;
  const explicitLanguage: string | null = node.attrs.language || null;

  // With no explicit choice, fall back to what the highlighter itself guessed,
  // so the label matches the colours on screen.
  const detected = useMemo(() => {
    if (explicitLanguage) {
      return null;
    }

    const guess = guessLanguage(code);
    return guess === 'plain' ? null : guess;
  }, [explicitLanguage, code]);

  const activeLanguage = explicitLanguage ?? detected ?? 'plain';
  const languageClassPrefix = extension.options.languageClassPrefix || 'language-';
  const lineCount = useMemo(() => code.split('\n').length, [code]);

  const languages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = LIST_LANG.filter((value) => {
      if (!needle) return true;
      return value.toLowerCase().includes(needle) || labelOf(value).toLowerCase().includes(needle);
    });

    return list;
  }, [query]);

  const autoMatchesQuery = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (
      !needle ||
      'auto'.includes(needle) ||
      t('editor.codeblock.auto').toLowerCase().includes(needle)
    );
  }, [query, t]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  useEffect(() => {
    if (!languageOpen) {
      setQuery('');
    }
  }, [languageOpen]);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  const pick = (value: string) => {
    updateAttributes({ language: value === AUTO_VALUE ? null : value });
    setLanguageOpen(false);
  };

  return (
    <NodeViewWrapper className='richtext-code-block'>
      <pre className={extension.options.HTMLAttributes?.class}>
        <NodeViewContent<'code'> as='code' className={`${languageClassPrefix}${activeLanguage}`} />
      </pre>

      <div aria-hidden className='richtext-code-block__gutter' contentEditable={false}>
        {Array.from({ length: lineCount }, (_, index) => (
          <span key={index}>{index + 1}</span>
        ))}
      </div>

      {editor.isEditable ? (
        <div
          className='richtext-code-block__toolbar'
          contentEditable={false}
          data-open={languageOpen ? 'true' : 'false'}
          onMouseDown={(event) => event.preventDefault()}
        >
          <Popover modal onOpenChange={setLanguageOpen} open={languageOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  toolbarButtonClass,
                  'richtext-gap-0.5 richtext-px-1.5 richtext-text-xs'
                )}
                type='button'
              >
                {explicitLanguage ? labelOf(activeLanguage) : `${labelOf(activeLanguage)} · auto`}

                <IconComponent className='richtext-size-3' name='MenuDown' />
              </button>
            </PopoverTrigger>

            <PopoverContent
              align='end'
              className='!richtext-w-[210px] !richtext-p-1'
              hideWhenDetached
              side='bottom'
            >
              <div className='richtext-relative richtext-mb-1'>
                <Search className='richtext-pointer-events-none richtext-absolute richtext-left-2 richtext-top-1/2 richtext-size-3.5 -richtext-translate-y-1/2 richtext-text-muted-foreground' />

                <input
                  autoFocus
                  className='richtext-h-7 richtext-w-full richtext-rounded-sm !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-transparent richtext-pl-7 richtext-pr-2 richtext-text-sm richtext-text-foreground !richtext-outline-none'
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('editor.codeblock.search')}
                  value={query}
                />
              </div>

              <div className='richtext-max-h-[220px] richtext-overflow-auto'>
                {autoMatchesQuery ? (
                  <LanguageOption
                    active={!explicitLanguage}
                    label={
                      detected
                        ? `${t('editor.codeblock.auto')} · ${labelOf(detected)}`
                        : t('editor.codeblock.auto')
                    }
                    onSelect={() => pick(AUTO_VALUE)}
                  />
                ) : null}

                {languages.map((value) => (
                  <LanguageOption
                    active={explicitLanguage === value}
                    key={value}
                    label={labelOf(value)}
                    onSelect={() => pick(value)}
                  />
                ))}

                {!languages.length && !autoMatchesQuery ? (
                  <div className='richtext-px-2 richtext-py-3 richtext-text-center richtext-text-sm richtext-text-muted-foreground'>
                    {t('editor.codeblock.noResult')}
                  </div>
                ) : null}
              </div>
            </PopoverContent>
          </Popover>

          <button
            aria-label={t('editor.copyToClipboard')}
            className={toolbarButtonClass}
            onClick={onCopy}
            title={t('editor.copyToClipboard')}
            type='button'
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>

          <button
            aria-label={t('editor.delete')}
            className={toolbarButtonClass}
            onClick={() => deleteNode()}
            title={t('editor.delete')}
            type='button'
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : null}
    </NodeViewWrapper>
  );
}

function LanguageOption({
  active,
  label,
  onSelect,
}: {
  active: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      className='richtext-flex richtext-w-full richtext-items-center richtext-gap-3 richtext-rounded-sm !richtext-border-none !richtext-bg-transparent richtext-py-1.5 richtext-pl-2 richtext-pr-10 richtext-text-left richtext-text-sm richtext-text-foreground !richtext-outline-none richtext-transition-colors hover:!richtext-bg-accent'
      onClick={onSelect}
      type='button'
    >
      <span className='!richtext-min-w-[20px]'>{active ? <Check size={16} /> : null}</span>

      <span>{label}</span>
    </button>
  );
}
