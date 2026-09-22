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
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { AI } from 'reactjs-tiptap-editor/ai';
import { Attachment, RichTextAttachment } from 'reactjs-tiptap-editor/attachment';
import { Blockquote, RichTextBlockquote } from 'reactjs-tiptap-editor/blockquote';
import { Bold, RichTextBold } from 'reactjs-tiptap-editor/bold';
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
} from 'reactjs-tiptap-editor/bubble';
import { BulletList, RichTextBulletList } from 'reactjs-tiptap-editor/bulletlist';
import { Callout, RichTextCallout } from 'reactjs-tiptap-editor/callout';
import { Clear, RichTextClear } from 'reactjs-tiptap-editor/clear';
import { Code, RichTextCode } from 'reactjs-tiptap-editor/code';
import { CodeBlock, RichTextCodeBlock } from 'reactjs-tiptap-editor/codeblock';
import { CodeView, RichTextCodeView } from 'reactjs-tiptap-editor/codeview';
import { Color, RichTextColor } from 'reactjs-tiptap-editor/color';
import {
  Column,
  ColumnNode,
  MultipleColumnNode,
  RichTextColumn,
} from 'reactjs-tiptap-editor/column';
import { Details, RichTextDetails } from 'reactjs-tiptap-editor/details';
import { Drawer, RichTextDrawer } from 'reactjs-tiptap-editor/drawer';
import { Emoji, RichTextEmoji } from 'reactjs-tiptap-editor/emoji';
import { Excalidraw, RichTextExcalidraw } from 'reactjs-tiptap-editor/excalidraw';
import { ExportMarkdown, RichTextExportMarkdown } from 'reactjs-tiptap-editor/exportmarkdown';
import { ExportPdf, RichTextExportPdf } from 'reactjs-tiptap-editor/exportpdf';
import { ExportWord, RichTextExportWord } from 'reactjs-tiptap-editor/exportword';
import { FontFamily, RichTextFontFamily } from 'reactjs-tiptap-editor/fontfamily';
import { FontSize, RichTextFontSize } from 'reactjs-tiptap-editor/fontsize';
import { FormatPainter, RichTextFormatPainter } from 'reactjs-tiptap-editor/formatpainter';
import { Heading, RichTextHeading } from 'reactjs-tiptap-editor/heading';
import { Highlight, RichTextHighlight } from 'reactjs-tiptap-editor/highlight';
// build extensions
import { History, RichTextUndo, RichTextRedo } from 'reactjs-tiptap-editor/history';
import { HorizontalRule, RichTextHorizontalRule } from 'reactjs-tiptap-editor/horizontalrule';
import { Iframe, RichTextIframe } from 'reactjs-tiptap-editor/iframe';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { ImageGif, RichTextImageGif } from 'reactjs-tiptap-editor/imagegif';
import { ImportWord, RichTextImportWord } from 'reactjs-tiptap-editor/importword';
import { Indent } from 'reactjs-tiptap-editor/indent';
import { Italic, RichTextItalic } from 'reactjs-tiptap-editor/italic';
import { Katex, RichTextKatex } from 'reactjs-tiptap-editor/katex';
import { LineHeight, RichTextLineHeight } from 'reactjs-tiptap-editor/lineheight';
import { Link, RichTextLink } from 'reactjs-tiptap-editor/link';
import { localeActions, useLocale } from 'reactjs-tiptap-editor/locale-bundle';
import { MarkdownPaste } from 'reactjs-tiptap-editor/markdownpaste';
import { Mention } from 'reactjs-tiptap-editor/mention';
import { Mermaid, RichTextMermaid } from 'reactjs-tiptap-editor/mermaid';
import { MoreMark } from 'reactjs-tiptap-editor/moremark';
import { OrderedList, RichTextOrderedList } from 'reactjs-tiptap-editor/orderedlist';
import { SearchAndReplace, RichTextSearchAndReplace } from 'reactjs-tiptap-editor/searchandreplace';
import { ShortMessage } from 'reactjs-tiptap-editor/shortmessage';
import { SlashCommand, SlashCommandList } from 'reactjs-tiptap-editor/slashcommand';
import { Strike, RichTextStrike } from 'reactjs-tiptap-editor/strike';
import { Table, RichTextTable } from 'reactjs-tiptap-editor/table';
import { TableOfContents, RichTextTableOfContents } from 'reactjs-tiptap-editor/tableofcontents';
import { TaskList, RichTextTaskList } from 'reactjs-tiptap-editor/tasklist';
import { TextAlign, RichTextAlign } from 'reactjs-tiptap-editor/textalign';
import { TextDirection, RichTextTextDirection } from 'reactjs-tiptap-editor/textdirection';
import { TextUnderline, RichTextUnderline } from 'reactjs-tiptap-editor/textunderline';
import { themeActions, useTheme } from 'reactjs-tiptap-editor/theme';
import { Twitter, RichTextTwitter } from 'reactjs-tiptap-editor/twitter';
import { Video, RichTextVideo } from 'reactjs-tiptap-editor/video';

import 'reactjs-tiptap-editor/style.css';
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
    class: 'reactjs-tiptap-editor-theme',
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
  HorizontalRule,
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
  }),
  SlashCommand,
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
<h1>reactjs-tiptap-editor</h1>
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
      </div>
    </header>
  );
};

/** Thin rule between groups of related buttons. */
const ToolbarDivider = () => <div className='mx-1 h-5 w-px shrink-0 bg-gray-200' />;

/**
 * Clicking the label should do what clicking the control does.
 *
 * Radix triggers open on pointerdown and ignore click; plain action buttons do
 * the opposite. Telling them apart by `aria-haspopup` avoids firing a plain
 * button's action twice.
 */
function activateControl(row: HTMLElement | null) {
  const button = row?.querySelector('button');

  if (!button) {
    return;
  }

  if (button.getAttribute('aria-haspopup')) {
    for (const type of ['pointerdown', 'pointerup'] as const) {
      button.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0 }));
    }

    return;
  }

  button.click();
}

/** One control in the overflow panel, named rather than left to a tooltip. */
/**
 * One control in the overflow panel, named rather than left to a tooltip.
 *
 * The controls are not one width — most are a 32px icon, a few carry a
 * chevron, `RichTextFontSize` is a text trigger — so the control sits in a
 * fixed slot and every label in a column starts at the same x. Letting the
 * label follow wherever the control happened to end left the column visibly
 * ragged.
 *
 * `wide` is for a control too big for the slot: the row spans the grid and the
 * control moves to the far end, but the label keeps the same indent as every
 * other row so the column still reads straight.
 */
const OverflowRow = ({
  children,
  label,
  wide,
}: {
  children: React.ReactNode;
  label: string;
  wide?: boolean;
}) => {
  const row = useRef<HTMLDivElement>(null);

  const name = (
    <span
      className='min-w-0 flex-1 cursor-default truncate text-[13px] leading-5 text-gray-700'
      onClick={() => activateControl(row.current)}
      title={label}
    >
      {label}
    </span>
  );

  if (wide) {
    return (
      <div
        className='col-span-2 flex min-w-0 items-center gap-1.5 rounded-md pr-1 hover:bg-gray-50'
        ref={row}
      >
        <span className='w-12 shrink-0' />

        {name}

        {children}
      </div>
    );
  }

  return (
    <div className='flex min-w-0 items-center gap-1.5 rounded-md pr-1 hover:bg-gray-50' ref={row}>
      <span className='flex w-12 shrink-0 items-center'>{children}</span>

      {name}
    </div>
  );
};

/** A labelled section of the overflow panel. */
const OverflowGroup = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div className='flex flex-col gap-0.5'>
    <span className='px-1 pb-0.5 text-[11px] font-medium uppercase tracking-wide text-gray-400'>
      {label}
    </span>

    <div className='grid grid-cols-2 gap-x-2'>{children}</div>
  </div>
);

/**
 * Everything that does not earn a permanent slot. Mature editors all keep the
 * top row to the handful of controls used constantly and put the rest one
 * click away — Word's ribbon overflow, Google Docs' "More", TinyMCE's chevron.
 */
const ToolbarOverflow = ({ children, label }: { children: React.ReactNode; label: string }) => {
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;

      // A control in this panel opens its own dropdown in a portal outside this
      // subtree. Closing on those clicks would unmount the button and take its
      // open menu with it.
      if (
        target?.closest(
          '[data-richtext-portal], [data-radix-popper-content-wrapper], [role="dialog"]'
        )
      ) {
        return;
      }

      if (target && container.current?.contains(target)) {
        return;
      }

      // Also hit-test by geometry. While a Radix menu is open it sets
      // `pointer-events: none` on the body, so a click on the panel behind it
      // reports <body> as the target and the panel would close itself along
      // with the menu. The panel is absolutely positioned, so its box is not
      // part of the trigger wrapper's and has to be measured separately.
      const hit = [container.current, panel.current].some((element) => {
        const rect = element?.getBoundingClientRect();

        return (
          rect &&
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        );
      });

      if (hit) {
        return;
      }

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className='relative' ref={container}>
      <button
        aria-expanded={open}
        aria-label={label}
        className='flex size-8 items-center justify-center rounded-md border-none bg-transparent text-gray-600 hover:bg-gray-100 aria-expanded:bg-gray-100'
        onClick={() => setOpen((previous) => !previous)}
        title={label}
        type='button'
      >
        <svg fill='currentColor' height='16' viewBox='0 0 16 16' width='16'>
          <circle cx='3' cy='8' r='1.4' />
          <circle cx='8' cy='8' r='1.4' />
          <circle cx='13' cy='8' r='1.4' />
        </svg>
      </button>

      {open && (
        <div
          className='absolute right-0 top-9 z-20 flex max-h-[70vh] w-[440px] flex-col gap-3 overflow-y-auto rounded-xl border border-solid border-gray-300 bg-white p-3 shadow-lg'
          ref={panel}
        >
          {children}
        </div>
      )}
    </div>
  );
};

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

const RichTextToolbar = ({ editor }: { editor: import('@tiptap/core').Editor | null }) => {
  const { t } = useLocale();

  return (
    <div className='flex flex-wrap items-center gap-0.5 border-0 border-b border-solid border-gray-200 px-2 py-1.5'>
      <RichTextUndo />
      <RichTextRedo />

      <ToolbarDivider />

      <RichTextHeading />
      <RichTextFontFamily />

      <ToolbarDivider />

      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextColor />
      <RichTextHighlight />
      <RichTextClear />

      <ToolbarDivider />

      <RichTextBulletList />
      <RichTextOrderedList />
      <RichTextTaskList />
      <RichTextAlign />

      <ToolbarDivider />

      <RichTextLink />
      <RichTextImage />
      <RichTextTable />
      <RichTextCodeBlock />

      <div className='ml-auto flex items-center'>
        <ToolbarOverflow label={t('editor.more')}>
          <OverflowGroup label={t('editor.slash.format')}>
            <OverflowRow label={t('editor.fontSize.tooltip')}>
              <RichTextFontSize compact />
            </OverflowRow>

            <OverflowRow label={t('editor.lineheight.tooltip')}>
              <RichTextLineHeight />
            </OverflowRow>

            <OverflowRow label={t('editor.superscript.tooltip')}>
              <MarkButton
                editor={editor}
                label={t('editor.superscript.tooltip')}
                mark='superscript'
              />
            </OverflowRow>

            <OverflowRow label={t('editor.subscript.tooltip')}>
              <MarkButton
                editor={editor}
                label={t('editor.subscript.tooltip')}
                mark='subscript'
                sub
              />
            </OverflowRow>

            <OverflowRow label={t('editor.indent.indent')}>
              <IndentButton editor={editor} label={t('editor.indent.indent')} />
            </OverflowRow>

            <OverflowRow label={t('editor.indent.outdent')}>
              <IndentButton editor={editor} label={t('editor.indent.outdent')} outdent />
            </OverflowRow>

            <OverflowRow label={t('editor.format')}>
              <RichTextFormatPainter />
            </OverflowRow>
          </OverflowGroup>

          <OverflowGroup label={t('editor.slash.insert')}>
            <OverflowRow label={t('editor.blockquote.tooltip')}>
              <RichTextBlockquote />
            </OverflowRow>

            <OverflowRow label={t('editor.code.tooltip')}>
              <RichTextCode />
            </OverflowRow>

            <OverflowRow label={t('editor.horizontalrule.tooltip')}>
              <RichTextHorizontalRule />
            </OverflowRow>

            <OverflowRow label={t('editor.columns.tooltip')}>
              <RichTextColumn />
            </OverflowRow>

            <OverflowRow label={t('editor.callout.tooltip')}>
              <RichTextCallout />
            </OverflowRow>

            <OverflowRow label={t('editor.details.tooltip')}>
              <RichTextDetails />
            </OverflowRow>

            <OverflowRow label={t('editor.tableofcontents.tooltip')}>
              <RichTextTableOfContents />
            </OverflowRow>

            <OverflowRow label={t('editor.emoji.tooltip')}>
              <RichTextEmoji />
            </OverflowRow>

            <OverflowRow label={t('editor.video.tooltip')}>
              <RichTextVideo />
            </OverflowRow>

            <OverflowRow label={t('editor.imageGif.tooltip')}>
              <RichTextImageGif />
            </OverflowRow>

            <OverflowRow label={t('editor.attachment.tooltip')}>
              <RichTextAttachment />
            </OverflowRow>

            <OverflowRow label={t('editor.iframe.tooltip')}>
              <RichTextIframe />
            </OverflowRow>

            <OverflowRow label={t('editor.katex.tooltip')}>
              <RichTextKatex />
            </OverflowRow>

            <OverflowRow label='Excalidraw'>
              <RichTextExcalidraw />
            </OverflowRow>

            <OverflowRow label={t('editor.mermaid.tooltip')}>
              <RichTextMermaid />
            </OverflowRow>

            <OverflowRow label='Drawer'>
              <RichTextDrawer />
            </OverflowRow>

            <OverflowRow label={t('editor.twitter.tooltip')}>
              <RichTextTwitter />
            </OverflowRow>
          </OverflowGroup>

          <OverflowGroup label={t('editor.importExport')}>
            <OverflowRow label={t('editor.importWord.tooltip')}>
              <RichTextImportWord />
            </OverflowRow>

            <OverflowRow label={t('editor.exportPdf.tooltip')}>
              <RichTextExportPdf />
            </OverflowRow>

            <OverflowRow label={t('editor.exportWord.tooltip')}>
              <RichTextExportWord />
            </OverflowRow>

            <OverflowRow label={t('editor.exportMarkdown.tooltip')}>
              <RichTextExportMarkdown />
            </OverflowRow>
          </OverflowGroup>

          <OverflowGroup label={t('editor.settings')}>
            <OverflowRow label={t('editor.searchAndReplace.tooltip')}>
              <RichTextSearchAndReplace />
            </OverflowRow>

            <OverflowRow label={t('editor.textDirection.tooltip')}>
              <RichTextTextDirection />
            </OverflowRow>

            <OverflowRow label={t('editor.codeView.tooltip')}>
              <RichTextCodeView />
            </OverflowRow>
          </OverflowGroup>
        </ToolbarOverflow>
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
            <RichTextToolbar editor={editor} />

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
