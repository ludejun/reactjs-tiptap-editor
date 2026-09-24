import { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Gapcursor, Placeholder } from '@tiptap/extensions';
import { PinOff } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
  RichTextBubbleCallout,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleImage,
  RichTextBubbleImageGif,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleMenuDragHandle,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleVideo,
} from '@/components/Bubble';
import {
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
} from '@/components/Toolbar';
import {
  AI,
  AIAutocomplete,
  RichTextAI,
  RichTextAIComposer,
  type RichTextAIComposerProps,
} from '@/extensions/AI';
import { Attachment, RichTextAttachment } from '@/extensions/Attachment';
import { Blockquote, RichTextBlockquote } from '@/extensions/Blockquote';
import { Bold, RichTextBold } from '@/extensions/Bold';
import { BulletList, RichTextBulletList } from '@/extensions/BulletList';
import { Callout, RichTextCallout } from '@/extensions/Callout';
import { Clear, RichTextClear } from '@/extensions/Clear';
import { Code, RichTextCode } from '@/extensions/Code';
import { CodeBlock, RichTextCodeBlock } from '@/extensions/CodeBlock';
import { CodeView, RichTextCodeView } from '@/extensions/CodeView';
import { Color, RichTextColor } from '@/extensions/Color';
import { Column, ColumnNode, MultipleColumnNode, RichTextColumn } from '@/extensions/Column';
import { Details, RichTextDetails } from '@/extensions/Details';
import { Divider, RichTextDivider } from '@/extensions/Divider';
import { Drawer, RichTextDrawer } from '@/extensions/Drawer';
import { Emoji, RichTextEmoji } from '@/extensions/Emoji';
import { Excalidraw, RichTextExcalidraw } from '@/extensions/Excalidraw';
import { ExportMarkdown, RichTextExportMarkdown } from '@/extensions/ExportMarkdown';
import { ExportPdf, RichTextExportPdf } from '@/extensions/ExportPdf';
import { ExportWord, RichTextExportWord } from '@/extensions/ExportWord';
import { FontFamily, RichTextFontFamily } from '@/extensions/FontFamily';
import { FontSize, RichTextFontSize } from '@/extensions/FontSize';
import { FormatPainter, RichTextFormatPainter } from '@/extensions/FormatPainter';
import { Heading, RichTextHeading } from '@/extensions/Heading';
import { Highlight, RichTextHighlight } from '@/extensions/Highlight';
import { History, RichTextRedo, RichTextUndo } from '@/extensions/History';
import { HorizontalRule } from '@/extensions/HorizontalRule';
import { Iframe, RichTextIframe } from '@/extensions/Iframe';
import { Image, RichTextImage } from '@/extensions/Image';
import { ImageGif, RichTextImageGif } from '@/extensions/ImageGif';
import { ImportWord, RichTextImportWord } from '@/extensions/ImportWord';
import { Indent, RichTextIndent } from '@/extensions/Indent';
import { Italic, RichTextItalic } from '@/extensions/Italic';
import { Katex, RichTextKatex } from '@/extensions/Katex';
import { LineHeight, RichTextLineHeight } from '@/extensions/LineHeight';
import { Link, RichTextLink } from '@/extensions/Link';
import { MarkdownPaste } from '@/extensions/MarkdownPaste';
import { Mention } from '@/extensions/Mention';
import { Mermaid, RichTextMermaid } from '@/extensions/Mermaid';
import { MoreMark, RichTextMoreMark } from '@/extensions/MoreMark';
import { OrderedList, RichTextOrderedList } from '@/extensions/OrderedList';
import { Recorder } from '@/extensions/Recorder';
import { RichPaste } from '@/extensions/RichPaste';
import { RichTextSearchAndReplace, SearchAndReplace } from '@/extensions/SearchAndReplace';
import { ShortMessage } from '@/extensions/ShortMessage';
import { SlashCommand, SlashCommandList } from '@/extensions/SlashCommand';
import { RichTextStrike, Strike } from '@/extensions/Strike';
import { RichTextTable, Table } from '@/extensions/Table';
import { RichTextTableOfContents, TableOfContents } from '@/extensions/TableOfContents';
import { RichTextTaskList, TaskList } from '@/extensions/TaskList';
import { RichTextAlign, TextAlign } from '@/extensions/TextAlign';
import { RichTextTextDirection, TextDirection } from '@/extensions/TextDirection';
import { RichTextUnderline, TextUnderline } from '@/extensions/TextUnderline';
import { RichTextTwitter, Twitter } from '@/extensions/Twitter';
import { RichTextVideo, Video } from '@/extensions/Video';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import { buildKit, extensionNames, type KitOptions, type KitRegistry } from './shared';

import type { DragEvent, ReactNode } from 'react';
import type React from 'react';

/** Columns are block-level siblings, so the document has to allow them. */
const DocumentWithColumns = /* @__PURE__ */ Document.extend({ content: '(block|columns)+' });

/**
 * Every feature the kit knows, keyed by its option name. Opt-in entries need
 * a key or a callback (GIPHY, mentions…) and stay out until configured.
 */
const REGISTRY = {
  document: { extension: Document },
  paragraph: { extension: Paragraph },
  text: { extension: Text },
  hardBreak: { extension: HardBreak },
  dropcursor: { extension: Dropcursor },
  gapcursor: { extension: Gapcursor },
  placeholder: { extension: Placeholder, optIn: true },
  history: { extension: History },
  // Marks and text style
  bold: { extension: Bold },
  italic: { extension: Italic },
  underline: { extension: TextUnderline },
  strike: { extension: Strike },
  code: { extension: Code },
  moreMark: { extension: MoreMark },
  color: { extension: Color },
  highlight: { extension: Highlight },
  fontFamily: { extension: FontFamily },
  fontSize: { extension: FontSize },
  lineHeight: { extension: LineHeight },
  textAlign: { extension: TextAlign },
  textDirection: { extension: TextDirection },
  indent: { extension: Indent },
  clear: { extension: Clear },
  formatPainter: { extension: FormatPainter },
  link: { extension: Link },
  // Blocks
  heading: { extension: Heading },
  bulletList: { extension: BulletList, with: [ListItem] },
  orderedList: { extension: OrderedList, with: [ListItem] },
  taskList: { extension: TaskList },
  blockquote: { extension: Blockquote },
  table: { extension: Table },
  divider: { extension: Divider },
  horizontalRule: { extension: HorizontalRule, optIn: true },
  details: { extension: Details },
  codeBlock: { extension: CodeBlock },
  callout: { extension: Callout },
  column: { extension: Column, with: [ColumnNode, MultipleColumnNode] },
  tableOfContents: { extension: TableOfContents },
  // Media and embeds
  image: { extension: Image },
  video: { extension: Video },
  iframe: { extension: Iframe },
  attachment: { extension: Attachment },
  katex: { extension: Katex },
  mermaid: { extension: Mermaid },
  imageGif: { extension: ImageGif, optIn: true },
  emoji: { extension: Emoji, optIn: true },
  excalidraw: { extension: Excalidraw, optIn: true },
  drawer: { extension: Drawer, optIn: true },
  twitter: { extension: Twitter, optIn: true },
  mention: { extension: Mention, optIn: true },
  shortMessage: { extension: ShortMessage, optIn: true },
  // Behaviour
  slashCommand: { extension: SlashCommand },
  searchAndReplace: { extension: SearchAndReplace },
  richPaste: { extension: RichPaste },
  markdownPaste: { extension: MarkdownPaste },
  recorder: { extension: Recorder, optIn: true },
  exportMarkdown: { extension: ExportMarkdown },
  exportWord: { extension: ExportWord },
  importWord: { extension: ImportWord },
  exportPdf: { extension: ExportPdf },
  codeView: { extension: CodeView },
  // AI
  ai: { extension: AI },
  aiAutocomplete: { extension: AIAutocomplete },
} satisfies KitRegistry;

export type RichTextKitOptions = KitOptions<typeof REGISTRY>;

/**
 * The whole editor as one extension, like Tiptap's StarterKit: register it
 * alone and every feature above is in, with its React node views. Pass
 * `false` for a key to leave that feature out, an object to configure it
 * (`ai: { endpoint: '/api/ai' }`, `image: { upload }`), and an object for an
 * opt-in feature to switch it on (`imageGif: { GIPHY_API_KEY }`).
 */
export const RichTextKit = Extension.create<RichTextKitOptions>({
  name: 'richTextKit',

  addOptions() {
    return {};
  },

  addExtensions() {
    const registry = { ...REGISTRY } as typeof REGISTRY;
    if (this.options.column !== false) {
      registry.document = { extension: DocumentWithColumns } as typeof REGISTRY.document;
    }
    return buildKit(registry, this.options);
  },
});

/** Renders `nodes` with a divider between non-empty groups. */
function withDividers(groups: ReactNode[][]): ReactNode[] {
  const out: ReactNode[] = [];
  groups
    .map((group) => group.filter(Boolean))
    .filter((group) => group.length)
    .forEach((group, index) => {
      if (index) out.push(<RichTextToolbarDivider key={`divider-${index}`} />);
      out.push(...group);
    });
  return out;
}

const DRAG_TYPE = 'application/x-richtext-kit-control';
const DEFAULT_PINS_KEY = 'ai-sparkwrite-editor:kit-toolbar-pins';

function readPins(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function writePins(key: string, pins: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(pins));
  } catch {
    // Storage may be unavailable (private mode, quota); pins then last for the session.
  }
}

export interface RichTextKitToolbarProps {
  className?: string;
  /** Extra controls, placed before the overflow panel. */
  children?: ReactNode;
  /** The "More tools" panel with the less frequent controls. Default true. */
  more?: boolean;
  /**
   * Let users drag a row out of the panel onto the toolbar to keep it there
   * (and drag it back onto the panel to return it). Default true.
   */
  pinnable?: boolean;
  /** localStorage key the pinned controls are remembered under. Default `ai-sparkwrite-editor:kit-toolbar-pins`. */
  storageKey?: string;
  /** Controls pinned before the user changes anything, by panel key (`fontSize`, `katex`…). */
  defaultPins?: string[];
}

/** One panel entry: the extension that has to be registered, its label and control. */
interface PanelEntry {
  key: string;
  name: string;
  label: string;
  node: ReactNode;
  /** A control wider than the icon slot; its row spans two columns. */
  wide?: boolean;
}

/**
 * A complete toolbar for `RichTextKit` (or any editor): AI, history, text
 * style, lists, insert, and a "More tools" panel — each control appears only
 * when its extension is registered, so switching a feature off in the kit
 * also removes its button. Rows of the panel can be dragged onto the toolbar
 * to pin them there; the choice is remembered in localStorage.
 */
export function RichTextKitToolbar({
  className,
  children,
  more = true,
  pinnable = true,
  storageKey = DEFAULT_PINS_KEY,
  defaultPins = [],
}: RichTextKitToolbarProps) {
  const editor = useEditorInstance();
  const { t } = useLocale();
  const has = useMemo(() => extensionNames(editor), [editor]);
  const on = (name: string) => has.has(name);
  const [pins, setPins] = useState<string[]>(() => {
    const stored = readPins(storageKey);
    return stored.length || window.localStorage.getItem(storageKey) ? stored : defaultPins;
  });
  const [dropTarget, setDropTarget] = useState<'toolbar' | 'panel' | null>(null);

  const updatePins = useCallback(
    (next: (current: string[]) => string[]) =>
      setPins((current) => {
        const value = next(current);
        writePins(storageKey, value);
        return value;
      }),
    [storageKey]
  );

  // Panel entries in display order; three per line, related ones side by side.
  const groups: { label: string; entries: PanelEntry[] }[] = [
    {
      label: t('editor.slash.format'),
      entries: [
        {
          key: 'fontFamily',
          name: 'fontFamily',
          label: t('editor.fontFamily.tooltip'),
          node: <RichTextFontFamily />,
          wide: true,
        },
        {
          key: 'fontSize',
          name: 'fontSize',
          label: t('editor.fontSize.tooltip'),
          node: <RichTextFontSize compact />,
        },
        {
          key: 'lineHeight',
          name: 'lineHeight',
          label: t('editor.lineheight.tooltip'),
          node: <RichTextLineHeight />,
        },
        {
          key: 'formatPainter',
          name: 'painter',
          label: t('editor.format'),
          node: <RichTextFormatPainter />,
        },
        {
          key: 'moreMark',
          name: 'moreMark',
          label: t('editor.superscript.tooltip'),
          node: <RichTextMoreMark />,
        },
        {
          key: 'indent',
          name: 'richtextIndentOutdent',
          label: t('editor.indent.indent'),
          node: <RichTextIndent only='indent' />,
        },
        {
          key: 'outdent',
          name: 'richtextIndentOutdent',
          label: t('editor.indent.outdent'),
          node: <RichTextIndent only='outdent' />,
        },
      ],
    },
    {
      label: t('editor.slash.insert'),
      entries: [
        { key: 'code', name: 'code', label: t('editor.code.tooltip'), node: <RichTextCode /> },
        {
          key: 'divider',
          name: 'divider',
          label: t('editor.divider.tooltip'),
          node: <RichTextDivider />,
        },
        {
          key: 'column',
          name: 'richtextColumnExtension',
          label: t('editor.columns.tooltip'),
          node: <RichTextColumn />,
        },
        {
          key: 'callout',
          name: 'callout',
          label: t('editor.callout.tooltip'),
          node: <RichTextCallout />,
        },
        {
          key: 'details',
          name: 'details',
          label: t('editor.details.tooltip'),
          node: <RichTextDetails />,
        },
        {
          key: 'tableOfContents',
          name: 'tableOfContents',
          label: t('editor.tableofcontents.tooltip'),
          node: <RichTextTableOfContents />,
        },
        {
          key: 'emoji',
          name: 'richTextEmojiWrapper',
          label: t('editor.emoji.tooltip'),
          node: <RichTextEmoji />,
        },
        { key: 'video', name: 'video', label: t('editor.video.tooltip'), node: <RichTextVideo /> },
        {
          key: 'imageGif',
          name: 'imageGif',
          label: t('editor.imageGif.tooltip'),
          node: <RichTextImageGif />,
        },
        {
          key: 'attachment',
          name: 'attachment',
          label: t('editor.attachment.tooltip'),
          node: <RichTextAttachment />,
        },
        {
          key: 'iframe',
          name: 'iframe',
          label: t('editor.iframe.tooltip'),
          node: <RichTextIframe />,
        },
        { key: 'katex', name: 'katex', label: t('editor.katex.tooltip'), node: <RichTextKatex /> },
        {
          key: 'mermaid',
          name: 'mermaid',
          label: t('editor.mermaid.tooltip'),
          node: <RichTextMermaid />,
        },
        {
          key: 'excalidraw',
          name: 'excalidraw',
          label: 'Excalidraw',
          node: <RichTextExcalidraw />,
        },
        { key: 'drawer', name: 'richTextDrawer', label: 'Drawer', node: <RichTextDrawer /> },
        {
          key: 'twitter',
          name: 'twitter',
          label: t('editor.twitter.tooltip'),
          node: <RichTextTwitter />,
        },
      ],
    },
    {
      label: t('editor.importExport'),
      entries: [
        {
          key: 'importWord',
          name: 'importWord',
          label: t('editor.importWord.tooltip'),
          node: <RichTextImportWord />,
        },
        {
          key: 'exportPdf',
          name: 'exportPdf',
          label: t('editor.exportPdf.tooltip'),
          node: <RichTextExportPdf />,
        },
        {
          key: 'exportWord',
          name: 'exportWord',
          label: t('editor.exportWord.tooltip'),
          node: <RichTextExportWord />,
        },
        {
          key: 'exportMarkdown',
          name: 'exportMarkdown',
          label: t('editor.exportMarkdown.tooltip'),
          node: <RichTextExportMarkdown />,
        },
      ],
    },
    {
      label: t('editor.settings'),
      entries: [
        {
          key: 'searchAndReplace',
          name: 'searchAndReplace',
          label: t('editor.searchAndReplace.tooltip'),
          node: <RichTextSearchAndReplace />,
        },
        {
          key: 'textDirection',
          name: 'richTextTextDirection',
          label: t('editor.textDirection.tooltip'),
          node: <RichTextTextDirection />,
        },
        {
          key: 'codeView',
          name: 'codeView',
          label: t('editor.codeView.tooltip'),
          node: <RichTextCodeView />,
        },
      ],
    },
  ];

  const available = groups.flatMap((group) => group.entries).filter((entry) => on(entry.name));
  const pinned = pins
    .map((key) => available.find((entry) => entry.key === key))
    .filter((entry): entry is PanelEntry => !!entry);
  const panelGroups = groups
    .map((group) => ({
      ...group,
      entries: group.entries.filter((entry) => on(entry.name) && !pins.includes(entry.key)),
    }))
    .filter((group) => group.entries.length);
  const showMore = more && (panelGroups.length > 0 || pinned.length > 0);

  const dragKey = (event: React.DragEvent) =>
    event.dataTransfer.types.includes(DRAG_TYPE) ? event.dataTransfer.getData(DRAG_TYPE) : '';
  const startDrag = (key: string) => (event: React.DragEvent) => {
    event.dataTransfer.setData(DRAG_TYPE, key);
    event.dataTransfer.effectAllowed = 'move';
  };
  const accept = (target: 'toolbar' | 'panel') => (event: React.DragEvent) => {
    if (!pinnable || !event.dataTransfer.types.includes(DRAG_TYPE)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropTarget !== target) setDropTarget(target);
  };
  const dropOnToolbar = (event: React.DragEvent) => {
    const key = dragKey(event);
    setDropTarget(null);
    if (!key || !pinnable) return;
    event.preventDefault();
    updatePins((current) => (current.includes(key) ? current : [...current, key]));
  };
  const dropOnPanel = (event: React.DragEvent) => {
    const key = dragKey(event);
    setDropTarget(null);
    if (!key || !pinnable) return;
    event.preventDefault();
    event.stopPropagation();
    updatePins((current) => current.filter((item) => item !== key));
  };

  const unpin = (key: string) => updatePins((current) => current.filter((item) => item !== key));

  return (
    <RichTextToolbar
      className={cn(className, dropTarget === 'toolbar' && 'richtext-kit-toolbar--drop')}
      data-pinnable={pinnable || undefined}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(null);
      }}
      onDragOver={accept('toolbar')}
      onDrop={dropOnToolbar}
    >
      {withDividers([
        [on('ai') && <RichTextAI key='ai' />],
        [
          on('undoRedo') && <RichTextUndo key='undo' />,
          on('undoRedo') && <RichTextRedo key='redo' />,
        ],
        [on('heading') && <RichTextHeading key='heading' />],
        [
          on('bold') && <RichTextBold key='bold' />,
          on('italic') && <RichTextItalic key='italic' />,
          on('underline') && <RichTextUnderline key='underline' />,
          on('strike') && <RichTextStrike key='strike' />,
          on('color') && <RichTextColor key='color' />,
          on('highlight') && <RichTextHighlight key='highlight' />,
          on('clear') && <RichTextClear key='clear' />,
        ],
        [
          on('bulletList') && <RichTextBulletList key='bulletList' />,
          on('orderedList') && <RichTextOrderedList key='orderedList' />,
          on('taskList') && <RichTextTaskList key='taskList' />,
          on('blockquote') && <RichTextBlockquote key='blockquote' />,
          on('textAlign') && <RichTextAlign key='textAlign' />,
        ],
        [
          on('link') && <RichTextLink key='link' />,
          on('image') && <RichTextImage key='image' />,
          on('table') && <RichTextTable key='table' />,
          on('codeBlock') && <RichTextCodeBlock key='codeBlock' />,
        ],
        // Controls the user dragged out of the panel. Drag one back to unpin it.
        pinned.map((entry) => (
          <span
            className='richtext-kit-toolbar__pinned'
            draggable={pinnable}
            key={`pin-${entry.key}`}
            onDragStart={startDrag(entry.key)}
            title={entry.label}
          >
            {entry.node}
            <button
              aria-label={t('editor.more.unpin')}
              className='richtext-kit-toolbar__unpin'
              onClick={() => unpin(entry.key)}
              title={t('editor.more.unpin')}
              type='button'
            >
              ×
            </button>
          </span>
        )),
        [children],
      ])}
      {showMore ? (
        <div
          className={cn(
            'richtext-kit-toolbar-more',
            dropTarget === 'panel' && 'richtext-kit-toolbar-more--drop'
          )}
          onDragOver={accept('panel')}
          onDrop={dropOnPanel}
        >
          <RichTextToolbarMore label={t('editor.more')} width={620}>
            {panelGroups.map((group) => (
              <RichTextToolbarMoreGroup columns={3} key={group.label} label={group.label}>
                {group.entries.map((entry) => (
                  <div
                    className='richtext-kit-toolbar__row'
                    draggable={pinnable}
                    key={entry.key}
                    onDragStart={startDrag(entry.key)}
                  >
                    <RichTextToolbarMoreRow label={entry.label} wide={entry.wide}>
                      {entry.node}
                    </RichTextToolbarMoreRow>
                  </div>
                ))}
              </RichTextToolbarMoreGroup>
            ))}
            {pinnable && pinned.length ? (
              // What is on the toolbar already, each with a one-click way back.
              <RichTextToolbarMoreGroup columns={3} label={t('editor.more.pinned')}>
                {pinned.map((entry) => (
                  <div className='richtext-kit-toolbar__pinned-row' key={entry.key}>
                    <RichTextToolbarMoreRow label={entry.label}>
                      {entry.node}
                    </RichTextToolbarMoreRow>
                    <button
                      aria-label={t('editor.more.unpin')}
                      className='richtext-kit-toolbar__unpin-row'
                      onClick={() => unpin(entry.key)}
                      title={t('editor.more.unpin')}
                      type='button'
                    >
                      <PinOff size={14} />
                    </button>
                  </div>
                ))}
              </RichTextToolbarMoreGroup>
            ) : null}
            {pinnable ? (
              <span className='richtext-kit-toolbar__hint'>{t('editor.more.pinHint')}</span>
            ) : null}
          </RichTextToolbarMore>
        </div>
      ) : null}
    </RichTextToolbar>
  );
}

export interface RichTextKitMenusProps {
  /** The AI composer dock under the editor: `false` hides it, an object passes its props. Default true. */
  composer?: boolean | RichTextAIComposerProps;
  /** The block drag handle. Default true. */
  dragHandle?: boolean;
}

/**
 * Every floating piece of UI the registered extensions can use: the AI
 * composer dock, the text bubble with the Improve menu, the table, link,
 * media and block bubbles, the drag handle and the slash menu. Place it
 * after `EditorContent` inside `RichTextProvider`.
 */
export function RichTextKitMenus({ composer = true, dragHandle = true }: RichTextKitMenusProps) {
  const editor = useEditorInstance();
  const has = useMemo(() => extensionNames(editor), [editor]);
  const on = (name: string) => has.has(name);

  return (
    <>
      {on('ai') && composer !== false ? (
        <RichTextAIComposer {...(typeof composer === 'object' ? composer : {})} />
      ) : null}
      <RichTextBubbleText />
      {on('table') ? <RichTextBubbleTable /> : null}
      {on('link') ? <RichTextBubbleLink /> : null}
      {on('image') ? <RichTextBubbleImage /> : null}
      {on('video') ? <RichTextBubbleVideo /> : null}
      {on('imageGif') ? <RichTextBubbleImageGif /> : null}
      {on('callout') ? <RichTextBubbleCallout /> : null}
      {on('iframe') ? <RichTextBubbleIframe /> : null}
      {on('katex') ? <RichTextBubbleKatex /> : null}
      {on('mermaid') ? <RichTextBubbleMermaid /> : null}
      {on('excalidraw') ? <RichTextBubbleExcalidraw /> : null}
      {on('richTextDrawer') ? <RichTextBubbleDrawer /> : null}
      {on('twitter') ? <RichTextBubbleTwitter /> : null}
      {dragHandle ? <RichTextBubbleMenuDragHandle /> : null}
      {on('richtextSlashCommand') ? <SlashCommandList /> : null}
    </>
  );
}
