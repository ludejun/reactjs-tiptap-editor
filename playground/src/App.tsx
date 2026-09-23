// Base Kit
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';
// import Collaboration from '@tiptap/extension-collaboration'
// import CollaborationCaret from '@tiptap/extension-collaboration-caret'
// import { HocuspocusProvider } from '@hocuspocus/provider'
// import * as Y from 'yjs'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
// const hocuspocusProvider = new HocuspocusProvider({
//   url: 'ws://0.0.0.0:8080',
//   name: 'github.com/hunghg255',
//   document: ydoc,
// })
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  RichTextProvider,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
} from 'sparkwrite';
import { AI } from 'sparkwrite/ai';
import { Attachment, RichTextAttachment } from 'sparkwrite/attachment';
import { Blockquote, RichTextBlockquote } from 'sparkwrite/blockquote';
import { Bold, RichTextBold } from 'sparkwrite/bold';
// Bubble
import {
  RichTextBubbleCallout,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleVideo,
  RichTextBubbleImageGif,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleMenuDragHandle,
} from 'sparkwrite/bubble';
import { BulletList, RichTextBulletList } from 'sparkwrite/bulletlist';
import { Callout, RichTextCallout } from 'sparkwrite/callout';
import { Clear, RichTextClear } from 'sparkwrite/clear';
import { Code, RichTextCode } from 'sparkwrite/code';
import { CodeBlock, RichTextCodeBlock, guessLanguage } from 'sparkwrite/codeblock';
import { CodeView, RichTextCodeView } from 'sparkwrite/codeview';
import { Color, RichTextColor } from 'sparkwrite/color';
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from 'sparkwrite/column';
import { Details, RichTextDetails } from 'sparkwrite/details';
import { Divider, RichTextDivider } from 'sparkwrite/divider';
import { Drawer, RichTextDrawer } from 'sparkwrite/drawer';
import { Emoji, RichTextEmoji } from 'sparkwrite/emoji';
import { Excalidraw, RichTextExcalidraw } from 'sparkwrite/excalidraw';
import { ExportMarkdown, RichTextExportMarkdown } from 'sparkwrite/exportmarkdown';
import { ExportPdf, RichTextExportPdf } from 'sparkwrite/exportpdf';
import { ExportWord, RichTextExportWord } from 'sparkwrite/exportword';
import { FontFamily, RichTextFontFamily } from 'sparkwrite/fontfamily';
import { FontSize, RichTextFontSize } from 'sparkwrite/fontsize';
import { FormatPainter, RichTextFormatPainter } from 'sparkwrite/formatpainter';
import { Heading, RichTextHeading } from 'sparkwrite/heading';
import { Highlight, RichTextHighlight } from 'sparkwrite/highlight';
// build extensions
import { History, RichTextUndo, RichTextRedo } from 'sparkwrite/history';
import { Iframe, RichTextIframe } from 'sparkwrite/iframe';
import { Image, RichTextImage } from 'sparkwrite/image';
import { ImageGif, RichTextImageGif } from 'sparkwrite/imagegif';
import { ImportWord, RichTextImportWord } from 'sparkwrite/importword';
import { Indent } from 'sparkwrite/indent';
import { Italic, RichTextItalic } from 'sparkwrite/italic';
import { Katex, RichTextKatex } from 'sparkwrite/katex';
import { LineHeight, RichTextLineHeight } from 'sparkwrite/lineheight';
import { Link, RichTextLink } from 'sparkwrite/link';
import { localeActions, useLocale } from 'sparkwrite/locale-bundle';
import { MarkdownPaste } from 'sparkwrite/markdownpaste';
import { Mention } from 'sparkwrite/mention';
import { Mermaid, RichTextMermaid } from 'sparkwrite/mermaid';
import { MoreMark } from 'sparkwrite/moremark';
import { OrderedList, RichTextOrderedList } from 'sparkwrite/orderedlist';
import { Recorder, getRecording, replayRecording } from 'sparkwrite/recorder';
import { RichPaste } from 'sparkwrite/richpaste';
import { SearchAndReplace, RichTextSearchAndReplace } from 'sparkwrite/searchandreplace';
import { ShortMessage } from 'sparkwrite/shortmessage';
import { SlashCommand, SlashCommandList } from 'sparkwrite/slashcommand';
import { Strike, RichTextStrike } from 'sparkwrite/strike';
import { Table, RichTextTable } from 'sparkwrite/table';
import { TableOfContents, RichTextTableOfContents } from 'sparkwrite/tableofcontents';
import { TaskList, RichTextTaskList } from 'sparkwrite/tasklist';
import { TextAlign, RichTextAlign } from 'sparkwrite/textalign';
import { TextDirection, RichTextTextDirection } from 'sparkwrite/textdirection';
import { TextUnderline, RichTextUnderline } from 'sparkwrite/textunderline';
import { themeActions, useTheme } from 'sparkwrite/theme';
import { Twitter, RichTextTwitter } from 'sparkwrite/twitter';
import { Video, RichTextVideo } from 'sparkwrite/video';

import 'sparkwrite/style.css';
// const ydoc = new Y.Doc()
import 'katex/dist/katex.min.css';
import 'easydrawer/styles.css';
import '@excalidraw/excalidraw/index.css';

// This is only an example, all supported languages are already loaded above
// but you can also register only specific languages to reduce bundle-size

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function convertBase64ToBlob(base64: string) {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

// custom document to support columns
const DocumentColumn = /* @__PURE__ */ Document.extend({
  content: '(block|columns)+',
});

const MOCK_USERS = [
  {
    id: '0',
    label: 'hunghg255',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/42096908?v=4',
    },
  },
  {
    id: '1',
    label: 'benjamincanac',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4',
    },
  },
  {
    id: '2',
    label: 'atinux',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/904724?v=4',
    },
  },
  {
    id: '3',
    label: 'danielroe',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/28706372?v=4',
    },
  },
  {
    id: '4',
    label: 'pi0',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/5158436?v=4',
    },
  },
];

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor.configure({
    class: 'sparkwrite-theme',
    color: 'hsl(var(--primary))',
    width: 2,
  }),
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
  Placeholder.configure({
    placeholder: "Press '/' for commands",
  }),
];

/**
 * Canned answers for the playground: streams markdown in small pieces, the way
 * a provider would, so the panel's live rendering can be seen without an API
 * key. `window.__aiGenerate` overrides it (used by the browser checks).
 */
async function demoAIGenerate(
  request: import('sparkwrite/ai').AIRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  const override = (window as unknown as { __aiGenerate?: typeof demoAIGenerate }).__aiGenerate;

  if (override) {
    return override(request, onChunk);
  }

  const last = request.messages[request.messages.length - 1]?.content ?? '';
  const selected = /Selected text:\n([\s\S]*?)(?:\n\n|$)/.exec(last)?.[1]?.trim();
  const answer = /translate/i.test(last)
    ? `${selected ?? 'Nothing selected'} *(translated — demo)*`
    : [
        '## Summary *(demo answer)*',
        '',
        selected ? `You selected **${selected.slice(0, 60)}**.` : 'No text was selected.',
        '',
        '| Step | What happens |',
        '| --- | --- |',
        '| 1 | Text streams in from the provider |',
        '| 2 | Markdown is rendered through the editor schema |',
        '| 3 | Apply inserts real nodes |',
        '',
        '```ts',
        "editor.commands.applyAI('## Summary…');",
        '```',
        '',
        '- [x] streaming',
        '- [ ] your API key (set `VITE_AI_MODEL` to use a real model)',
      ].join('\n');

  for (const piece of answer.match(/[\s\S]{1,8}/g) ?? []) {
    request.signal.throwIfAborted();
    await new Promise((resolve) => setTimeout(resolve, 12));
    onChunk?.(piece);
  }

  return answer;
}

const extensions = [
  ...BaseKit,

  History,
  SearchAndReplace,
  Clear,
  FontFamily,
  Heading,
  FontSize,
  FormatPainter,
  Bold,
  Italic,
  TextUnderline,
  Strike,
  MoreMark,
  Emoji.configure({
    suggestion: {
      items: async ({ query }: any) => {
        const { EMOJI_LIST } = await import('@/emojis');
        const lowerCaseQuery = query?.toLowerCase();

        return EMOJI_LIST.filter(({ name }) => name.toLowerCase().includes(lowerCaseQuery));
      },
    },
  }),
  Color,
  Highlight,
  BulletList,
  OrderedList,
  TextAlign,
  Indent,
  LineHeight,
  TaskList,
  Link,
  Image.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  Video.configure({
    upload: (files: File) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(files));
        }, 300);
      });
    },
  }),
  ImageGif.configure({
    provider: 'giphy',
    API_KEY: import.meta.env.VITE_GIPHY_API_KEY as string,
  }),
  Blockquote,
  Divider,
  Code,
  CodeBlock,

  Column,
  ColumnNode,
  MultipleColumnNode,
  Table,
  Iframe,
  ExportPdf,
  ImportWord,
  ExportWord,
  ExportMarkdown,
  TextDirection,
  Attachment.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Katex.configure({
    loadKatex: async () => {
      const [{ default: katex }] = await Promise.all([
        import('katex'),
        import('katex/contrib/mhchem'),
      ]);
      return katex;
    },
  }),
  Excalidraw,
  Mermaid.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Drawer.configure({
    upload: (file: any) => {
      // fake upload return base 64
      const reader = new FileReader();
      reader.readAsDataURL(file);

      return new Promise((resolve) => {
        setTimeout(() => {
          const blob = convertBase64ToBlob(reader.result as string);
          resolve(URL.createObjectURL(blob));
        }, 300);
      });
    },
  }),
  Twitter,
  Mention.configure({
    suggestion: {
      char: '@',
      items: async ({ query }: any) => {
        console.log('query', query);
        // const data = MOCK_USERS.map(item => item.label);
        // return data.filter(item => item.toLowerCase().startsWith(query.toLowerCase()));
        return MOCK_USERS.filter((item) =>
          item.label.toLowerCase().startsWith(query.toLowerCase())
        );
      },
    },
    // suggestions: [
    //   {
    //     char: '@',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   },
    //   {
    //     char: '#',
    //     items: async ({ query }: any) => {
    //       return MOCK_USERS.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()));
    //     },
    //   }
    // ]
  }),
  AI.configure({
    protocol: import.meta.env.VITE_AI_PROTOCOL === 'anthropic' ? 'anthropic' : 'openai',
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    model: import.meta.env.VITE_AI_MODEL || '',
    baseURL: import.meta.env.VITE_AI_BASE_URL || '',
    // Without a model the playground answers itself, so the AI flow — streaming,
    // markdown rendering, Apply — can be tried without a key.
    generate: import.meta.env.VITE_AI_MODEL ? null : demoAIGenerate,
  }),
  SlashCommand,
  RichPaste.configure({ detectLanguage: guessLanguage }),
  Recorder,
  ShortMessage.configure({
    shortcut: 'Shift-Space',
    messages: [
      { short: 'nsfw', long_content: 'Not safe forward' },
      { short: 'brb', long_content: 'Be right back' },
      {
        short: 'ty',
        long_content: 'Thank you for your time and consideration.',
      },
      {
        short: 'sig',
        long_content: '<p>Best regards,<br><strong>Hung</strong></p>',
      },
    ],
  }),
  CodeView,
  Callout,
  Details,
  TableOfContents,
  MarkdownPaste,
  //  Collaboration.configure({
  //   document: hocuspocusProvider.document,
  // }),
  // CollaborationCaret.configure({
  //   provider: hocuspocusProvider,
  //   user: {
  //     color: getRandomColor(),
  //   },
  // }),
];

const DEFAULT = `
<h1>sparkwrite</h1>
<p>A rich text editor built on Tiptap. Everything below is live — edit it, or start from scratch.</p>
<div class="table-of-contents" data-type="table-of-contents"></div>
<h2>Text</h2>
<p>Select any text to bring up the formatting bubble. You can make it <strong>bold</strong>, <em>italic</em>, <s>struck through</s>, <code>inline code</code>, or a <a class="link" href="https://tiptap.dev" target="_blank" rel="noopener noreferrer">link</a>.</p>
<h2>Lists</h2>
<ul><li><p>Press Tab to indent an item</p><ul><li><p>and Shift+Tab to move it back out</p></li></ul></li><li><p>Ordered lists work the same way</p></li></ul>
<ol><li><p>First step</p></li><li><p>Second step</p></li></ol>
<h2>Code</h2>
<p>Code blocks detect their language automatically. Hover one to pick a language, copy it, or delete it.</p>
<pre class="shj"><code class="language-ts">interface Post {
  title: string;
  tags: string[];
}

export function slugify(post: Post): string {
  return post.title.toLowerCase().replace(/\\s+/g, '-');
}</code></pre>
<h2>Tables</h2>
<p>Right-click inside a table for row and column actions.</p>
<table><tbody><tr><th><p>Feature</p></th><th><p>Shortcut</p></th></tr><tr><td><p>Bold</p></td><td><p>Mod+B</p></td></tr><tr><td><p>Code block</p></td><td><p>Mod+Alt+C</p></td></tr></tbody></table>
<h2>Everything else</h2>
<p>Type <code>/</code> on an empty line to insert images, diagrams, callouts and more.</p>
<details class="details" open=""><summary class="details-summary">A collapsible section</summary><div class="details-content" data-type="detailsContent"><p>Hidden until you open it.</p></div></details>
<blockquote class="blockquote"><p>Drag the handle on the left of any block to move it.</p></blockquote>
<p></p>
`;

function debounce(func: any, wait: number) {
  let timeout: NodeJS.Timeout;
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-ignore
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/** Same order as the bundled locales: most widely spoken first. */
const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'zh_CN', label: '中文' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'pt_BR', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'tr', label: 'Türkçe' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ko', label: '한국어' },
  { value: 'it', label: 'Italiano' },
  { value: 'hu_HU', label: 'Magyar' },
  { value: 'fi', label: 'Suomi' },
] as const;

const ACCENTS = [
  { value: 'default', swatch: '#18181b' },
  { value: 'red', swatch: '#dc2626' },
  { value: 'rose', swatch: '#e11d48' },
  { value: 'orange', swatch: '#ea580c' },
  { value: 'yellow', swatch: '#ca8a04' },
  { value: 'green', swatch: '#16a34a' },
  { value: 'blue', swatch: '#2563eb' },
  { value: 'violet', swatch: '#7c3aed' },
] as const;

/** Label above a group of controls. */
const Field = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className='flex flex-col gap-1.5'>
    <span className='text-[11px] font-medium uppercase tracking-wide text-gray-400'>{label}</span>

    {children}
  </div>
);

/** iOS-style segmented control: one pill, the active option raised out of it. */
function Segmented<T extends string>({
  onChange,
  options,
  value,
}: {
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  value: T;
}) {
  return (
    <div className='inline-flex rounded-lg bg-gray-100 p-0.5'>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            type='button'
            className={[
              'rounded-[6px] px-2.5 py-1 text-[13px] leading-5 transition-colors',
              active
                ? 'bg-white font-medium text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900',
            ].join(' ')}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Dropdown for lists too long to sit in a segmented control. */
function Picker<T extends string>({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
  value: T;
}) {
  return (
    <div className='relative inline-flex'>
      <select
        aria-label={label}
        className='h-[30px] cursor-pointer appearance-none rounded-lg border-none bg-gray-100 py-0 pl-2.5 pr-7 text-[13px] leading-5 text-gray-900 outline-none hover:bg-gray-200'
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <svg
        aria-hidden
        className='pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-gray-400'
        fill='none'
        stroke='currentColor'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='1.5'
        viewBox='0 0 12 12'
      >
        <path d='m3 4.5 3 3 3-3' />
      </svg>
    </div>
  );
}

/** Record a session, then play it back at 4× — the Recorder extension demo. */
const RecordingControls = ({ editor }: { editor: import('@tiptap/core').Editor | null }) => {
  const [state, setState] = useState<'idle' | 'recording' | 'replaying'>('idle');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!editor || state !== 'recording') {
      return;
    }

    const tick = () => setCount(getRecording(editor)?.entries.length ?? 0);

    editor.on('transaction', tick);

    return () => {
      editor.off('transaction', tick);
    };
  }, [editor, state]);

  const recording = editor ? getRecording(editor) : null;

  return (
    <div className='flex items-center gap-1.5'>
      {state === 'recording' ? (
        <button
          className='rounded-md border border-solid border-red-300 bg-red-50 px-2.5 py-1 text-[13px] text-red-700'
          onClick={() => {
            editor?.commands.stopRecording();
            setState('idle');
          }}
          type='button'
        >
          Stop · {count}
        </button>
      ) : (
        <button
          className='rounded-md border border-solid border-gray-300 bg-white px-2.5 py-1 text-[13px] text-gray-700 disabled:opacity-50'
          disabled={!editor || state === 'replaying'}
          onClick={() => {
            editor?.commands.startRecording();
            setCount(0);
            setState('recording');
          }}
          type='button'
        >
          Record
        </button>
      )}

      <button
        className='rounded-md border border-solid border-gray-300 bg-white px-2.5 py-1 text-[13px] text-gray-700 disabled:opacity-50'
        disabled={!editor || !recording?.entries.length || state !== 'idle'}
        onClick={async () => {
          if (!editor || !recording) return;
          setState('replaying');
          editor.setEditable(false);
          try {
            await replayRecording(editor, recording, { speed: 4 });
          } finally {
            editor.setEditable(true);
            setState('idle');
          }
        }}
        type='button'
      >
        {state === 'replaying'
          ? 'Replaying…'
          : `Replay ×4${recording?.entries.length ? ` (${recording.entries.length})` : ''}`}
      </button>
    </div>
  );
};

const Header = ({
  editor,
  theme,
  setTheme,
}: {
  editor: import('@tiptap/core').Editor | null;
  theme: string;
  setTheme: (theme: string) => void;
}) => {
  const [editorEditable, setEditorEditable] = useState(true);
  const [radius, setRadius] = useState(0.5);
  const currentLocale = useLocale();
  const currentTheme = useTheme();

  useEffect(() => {
    localeActions.setLang('en');
    setEditorEditable(editor?.isEditable ?? true);
  }, []);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const onUpdate = () => setEditorEditable(editor.isEditable);

    editor.on('update', onUpdate);

    return () => {
      editor.off('update', onUpdate);
    };
  }, [editor]);

  return (
    <header className='rounded-xl border border-solid border-gray-200 bg-white px-4 py-3.5'>
      <div className='flex flex-wrap items-start gap-x-7 gap-y-4'>
        <Field label='Language'>
          <Picker
            label='Language'
            onChange={(lang) => localeActions.setLang(lang)}
            options={LANGUAGES}
            value={(currentLocale.lang as (typeof LANGUAGES)[number]['value']) ?? 'en'}
          />
        </Field>

        <Field label='Appearance'>
          <Segmented
            value={theme === 'dark' ? 'dark' : 'light'}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            onChange={(next) => {
              setTheme(next);
              themeActions.setTheme(next);
            }}
          />
        </Field>

        <Field label='Editing'>
          <Segmented
            value={editorEditable ? 'edit' : 'read'}
            options={[
              { value: 'edit', label: 'Editable' },
              { value: 'read', label: 'Read only' },
            ]}
            onChange={(next) => editor?.setEditable(next === 'edit')}
          />
        </Field>

        <Field label='Accent'>
          <div className='flex h-[30px] items-center gap-1.5'>
            {ACCENTS.map((accent) => {
              const active = currentTheme.color === accent.value;

              return (
                <button
                  aria-label={accent.value}
                  key={accent.value}
                  onClick={() => themeActions.setColor(accent.value)}
                  title={accent.value}
                  type='button'
                  style={{ background: accent.swatch }}
                  className={[
                    'size-5 rounded-full border-none transition-transform',
                    active
                      ? 'ring-2 ring-gray-900 ring-offset-2'
                      : 'opacity-70 hover:scale-110 hover:opacity-100',
                  ].join(' ')}
                />
              );
            })}
          </div>
        </Field>

        <Field label={`Radius · ${radius.toFixed(2)}rem`}>
          <div className='flex h-[30px] items-center'>
            <input
              className='w-36 accent-gray-900'
              max={1.5}
              min={0}
              step={0.05}
              type='range'
              value={radius}
              onChange={(event) => {
                const next = Number(event.target.value);

                setRadius(next);
                themeActions.setBorderRadius(`${next}rem`);
              }}
            />
          </div>
        </Field>

        <Field label='Recording'>
          <RecordingControls editor={editor} />
        </Field>
      </div>
    </header>
  );
};

/** Thin rule between groups of related buttons. */

/** Shared styling for the buttons the playground draws itself. */
const PANEL_BUTTON_CLASS =
  'flex size-8 shrink-0 items-center justify-center rounded-md border-none bg-transparent hover:bg-gray-100';

/**
 * Superscript and subscript, the two marks `RichTextMoreMark` keeps behind a
 * menu of its own. One nested menu inside the overflow panel is one too many,
 * so they get a row each.
 */
const MarkButton = ({
  editor,
  label,
  mark,
  sub,
}: {
  editor: import('@tiptap/core').Editor | null;
  label: string;
  mark: 'superscript' | 'subscript';
  sub?: boolean;
}) => {
  // A selection change does not re-render the toolbar on its own.
  // `useEditorState` yields null until the editor exists.
  const active =
    useEditorState({
      editor,
      selector: ({ editor }) => editor?.isActive(mark) ?? false,
    }) ?? false;

  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`${PANEL_BUTTON_CLASS} font-serif text-[13px] leading-none ${
        active ? 'bg-gray-100 text-gray-900' : 'text-gray-600'
      }`}
      onClick={() =>
        mark === 'superscript'
          ? editor?.chain().focus().toggleSuperscript().run()
          : editor?.chain().focus().toggleSubscript().run()
      }
      type='button'
    >
      x<span className={`text-[9px] ${sub ? 'self-end pb-0.5' : 'self-start pt-0.5'}`}>2</span>
    </button>
  );
};

/**
 * `RichTextIndent` renders increase and decrease as one pair, which does not
 * fit a list where every other row names a single action.
 */
const IndentButton = ({
  editor,
  label,
  outdent,
}: {
  editor: import('@tiptap/core').Editor | null;
  label: string;
  outdent?: boolean;
}) => (
  <button
    aria-label={label}
    className={`${PANEL_BUTTON_CLASS} text-gray-600`}
    onClick={() =>
      outdent ? editor?.chain().focus().outdent().run() : editor?.chain().focus().indent().run()
    }
    type='button'
  >
    <svg
      fill='none'
      height='16'
      stroke='currentColor'
      strokeLinecap='round'
      strokeLinejoin='round'
      strokeWidth='2'
      viewBox='0 0 24 24'
      width='16'
    >
      <path d={outdent ? 'm7 8-4 4 4 4' : 'm3 8 4 4-4 4'} />
      <path d='M21 6H11' />
      <path d='M21 12H11' />
      <path d='M21 18H11' />
    </svg>
  </button>
);

const PlaygroundToolbar = ({ editor }: { editor: import('@tiptap/core').Editor | null }) => {
  const { t } = useLocale();

  return (
    <div className='flex flex-wrap items-center gap-0.5 border-0 border-b border-solid border-gray-200 px-2 py-1.5'>
      <RichTextUndo />
      <RichTextRedo />

      <RichTextToolbarDivider />

      <RichTextHeading />
      <RichTextFontFamily />

      <RichTextToolbarDivider />

      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextColor />
      <RichTextHighlight />
      <RichTextClear />

      <RichTextToolbarDivider />

      <RichTextBulletList />
      <RichTextOrderedList />
      <RichTextTaskList />
      <RichTextAlign />

      <RichTextToolbarDivider />

      <RichTextLink />
      <RichTextImage />
      <RichTextTable />
      <RichTextCodeBlock />

      <div className='ml-auto flex items-center'>
        <RichTextToolbarMore label={t('editor.more')}>
          <RichTextToolbarMoreGroup label={t('editor.slash.format')}>
            <RichTextToolbarMoreRow label={t('editor.fontSize.tooltip')}>
              <RichTextFontSize compact />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.lineheight.tooltip')}>
              <RichTextLineHeight />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.superscript.tooltip')}>
              <MarkButton
                editor={editor}
                label={t('editor.superscript.tooltip')}
                mark='superscript'
              />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.subscript.tooltip')}>
              <MarkButton
                editor={editor}
                label={t('editor.subscript.tooltip')}
                mark='subscript'
                sub
              />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.indent.indent')}>
              <IndentButton editor={editor} label={t('editor.indent.indent')} />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.indent.outdent')}>
              <IndentButton editor={editor} label={t('editor.indent.outdent')} outdent />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.format')}>
              <RichTextFormatPainter />
            </RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>

          <RichTextToolbarMoreGroup label={t('editor.slash.insert')}>
            <RichTextToolbarMoreRow label={t('editor.blockquote.tooltip')}>
              <RichTextBlockquote />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.code.tooltip')}>
              <RichTextCode />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.divider.tooltip')}>
              <RichTextDivider />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.columns.tooltip')}>
              <RichTextColumn />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.callout.tooltip')}>
              <RichTextCallout />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.details.tooltip')}>
              <RichTextDetails />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.tableofcontents.tooltip')}>
              <RichTextTableOfContents />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.emoji.tooltip')}>
              <RichTextEmoji />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.video.tooltip')}>
              <RichTextVideo />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.imageGif.tooltip')}>
              <RichTextImageGif />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.attachment.tooltip')}>
              <RichTextAttachment />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.iframe.tooltip')}>
              <RichTextIframe />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.katex.tooltip')}>
              <RichTextKatex />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label='Excalidraw'>
              <RichTextExcalidraw />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.mermaid.tooltip')}>
              <RichTextMermaid />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label='Drawer'>
              <RichTextDrawer />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.twitter.tooltip')}>
              <RichTextTwitter />
            </RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>

          <RichTextToolbarMoreGroup label={t('editor.importExport')}>
            <RichTextToolbarMoreRow label={t('editor.importWord.tooltip')}>
              <RichTextImportWord />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.exportPdf.tooltip')}>
              <RichTextExportPdf />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.exportWord.tooltip')}>
              <RichTextExportWord />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.exportMarkdown.tooltip')}>
              <RichTextExportMarkdown />
            </RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>

          <RichTextToolbarMoreGroup label={t('editor.settings')}>
            <RichTextToolbarMoreRow label={t('editor.searchAndReplace.tooltip')}>
              <RichTextSearchAndReplace />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.textDirection.tooltip')}>
              <RichTextTextDirection />
            </RichTextToolbarMoreRow>

            <RichTextToolbarMoreRow label={t('editor.codeView.tooltip')}>
              <RichTextCodeView />
            </RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>
        </RichTextToolbarMore>
      </div>
    </div>
  );
};

function App() {
  const [content, setContent] = useState(DEFAULT);
  const [theme, setTheme] = useState('light');

  const onValueChange = useCallback(
    debounce((value: any) => {
      setContent(value);
    }, 300),
    []
  );

  const editor = useEditor({
    // shouldRerenderOnTransaction:  false,
    textDirection: 'auto', // global text direction
    content,
    extensions,
    // content,
    // immediatelyRender: false, // error duplicate plugin key
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onValueChange(html);
    },
  });

  useEffect(() => {
    window['editor'] = editor;
  }, [editor]);

  return (
    <div className='mx-auto my-0 flex w-full max-w-screen-lg flex-col gap-5 px-6 py-10'>
      <Header editor={editor} setTheme={setTheme} theme={theme} />

      <RichTextProvider editor={editor} dark={theme === 'dark'}>
        <div className='overflow-hidden rounded-[0.5rem] bg-background shadow outline outline-1'>
          <div className='flex max-h-full w-full flex-col'>
            <PlaygroundToolbar editor={editor} />

            <EditorContent editor={editor} />

            {/* Bubble */}
            <RichTextBubbleCallout />
            <RichTextBubbleDrawer />
            <RichTextBubbleExcalidraw />
            <RichTextBubbleIframe />
            <RichTextBubbleKatex />
            <RichTextBubbleLink />

            <RichTextBubbleImage />
            <RichTextBubbleVideo />
            <RichTextBubbleImageGif />

            <RichTextBubbleMermaid />
            <RichTextBubbleTable />
            <RichTextBubbleText />
            <RichTextBubbleTwitter />

            <RichTextBubbleMenuDragHandle />

            {/* Command List */}
            <SlashCommandList />
          </div>
        </div>
      </RichTextProvider>

      {typeof content === 'string' && (
        <details className='rounded-xl border border-solid border-gray-200 bg-white px-4 py-3'>
          <summary className='cursor-pointer text-[13px] font-medium text-gray-600'>
            Output HTML
          </summary>

          <textarea
            className='mt-3 h-80 w-full resize-y rounded-lg border border-solid border-gray-200 bg-gray-50 p-3 font-mono text-xs leading-relaxed text-gray-700'
            readOnly
            value={content}
          />
        </details>
      )}
    </div>
  );
}

export default App;
