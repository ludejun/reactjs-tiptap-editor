import { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Gapcursor, Placeholder } from '@tiptap/extensions';
import { useMemo } from 'react';

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
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import { buildKit, extensionNames, type KitOptions, type KitRegistry } from './shared';

import type { ReactNode } from 'react';

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

export interface RichTextKitToolbarProps {
  className?: string;
  /** Extra controls, placed before the overflow panel. */
  children?: ReactNode;
  /** The "More tools" panel with the less frequent controls. Default true. */
  more?: boolean;
}

/**
 * A complete toolbar for `RichTextKit` (or any editor): AI, history, text
 * style, lists, insert, and a "More tools" panel — each control appears only
 * when its extension is registered, so switching a feature off in the kit
 * also removes its button.
 */
export function RichTextKitToolbar({ className, children, more = true }: RichTextKitToolbarProps) {
  const editor = useEditorInstance();
  const { t } = useLocale();
  const has = useMemo(() => extensionNames(editor), [editor]);
  const on = (name: string) => has.has(name);
  const row = (name: string, label: string, node: ReactNode) =>
    on(name) ? (
      <RichTextToolbarMoreRow key={name} label={label}>
        {node}
      </RichTextToolbarMoreRow>
    ) : null;

  const format = [
    row('fontSize', t('editor.fontSize.tooltip'), <RichTextFontSize compact />),
    row('lineHeight', t('editor.lineheight.tooltip'), <RichTextLineHeight />),
    row('moreMark', t('editor.superscript.tooltip'), <RichTextMoreMark />),
    row('richtextIndentOutdent', t('editor.indent.tooltip'), <RichTextIndent />),
    row('painter', t('editor.format'), <RichTextFormatPainter />),
  ].filter(Boolean);
  const insert = [
    row('blockquote', t('editor.blockquote.tooltip'), <RichTextBlockquote />),
    row('code', t('editor.code.tooltip'), <RichTextCode />),
    row('divider', t('editor.divider.tooltip'), <RichTextDivider />),
    row('richtextColumnExtension', t('editor.columns.tooltip'), <RichTextColumn />),
    row('callout', t('editor.callout.tooltip'), <RichTextCallout />),
    row('details', t('editor.details.tooltip'), <RichTextDetails />),
    row('tableOfContents', t('editor.tableofcontents.tooltip'), <RichTextTableOfContents />),
    row('richTextEmojiWrapper', t('editor.emoji.tooltip'), <RichTextEmoji />),
    row('video', t('editor.video.tooltip'), <RichTextVideo />),
    row('imageGif', t('editor.imageGif.tooltip'), <RichTextImageGif />),
    row('attachment', t('editor.attachment.tooltip'), <RichTextAttachment />),
    row('iframe', t('editor.iframe.tooltip'), <RichTextIframe />),
    row('katex', t('editor.katex.tooltip'), <RichTextKatex />),
    row('mermaid', t('editor.mermaid.tooltip'), <RichTextMermaid />),
    row('excalidraw', 'Excalidraw', <RichTextExcalidraw />),
    row('richTextDrawer', 'Drawer', <RichTextDrawer />),
    row('twitter', t('editor.twitter.tooltip'), <RichTextTwitter />),
  ].filter(Boolean);
  const files = [
    row('importWord', t('editor.importWord.tooltip'), <RichTextImportWord />),
    row('exportPdf', t('editor.exportPdf.tooltip'), <RichTextExportPdf />),
    row('exportWord', t('editor.exportWord.tooltip'), <RichTextExportWord />),
    row('exportMarkdown', t('editor.exportMarkdown.tooltip'), <RichTextExportMarkdown />),
  ].filter(Boolean);
  const tools = [
    row('searchAndReplace', t('editor.searchAndReplace.tooltip'), <RichTextSearchAndReplace />),
    row('richTextTextDirection', t('editor.textDirection.tooltip'), <RichTextTextDirection />),
    row('codeView', t('editor.codeView.tooltip'), <RichTextCodeView />),
  ].filter(Boolean);
  const showMore = more && format.length + insert.length + files.length + tools.length > 0;

  return (
    <RichTextToolbar className={className}>
      {withDividers([
        [on('ai') && <RichTextAI key='ai' />],
        [
          on('undoRedo') && <RichTextUndo key='undo' />,
          on('undoRedo') && <RichTextRedo key='redo' />,
        ],
        [
          on('heading') && <RichTextHeading key='heading' />,
          on('fontFamily') && <RichTextFontFamily key='fontFamily' />,
        ],
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
          on('textAlign') && <RichTextAlign key='textAlign' />,
        ],
        [
          on('link') && <RichTextLink key='link' />,
          on('image') && <RichTextImage key='image' />,
          on('table') && <RichTextTable key='table' />,
          on('codeBlock') && <RichTextCodeBlock key='codeBlock' />,
        ],
        [children],
      ])}
      {showMore ? (
        <div className='richtext-kit-toolbar-more'>
          <RichTextToolbarMore label={t('editor.more')}>
            {format.length ? (
              <RichTextToolbarMoreGroup label={t('editor.slash.format')}>
                {format}
              </RichTextToolbarMoreGroup>
            ) : null}
            {insert.length ? (
              <RichTextToolbarMoreGroup label={t('editor.slash.insert')}>
                {insert}
              </RichTextToolbarMoreGroup>
            ) : null}
            {files.length ? (
              <RichTextToolbarMoreGroup label={t('editor.importExport')}>
                {files}
              </RichTextToolbarMoreGroup>
            ) : null}
            {tools.length ? (
              <RichTextToolbarMoreGroup label={t('editor.settings')}>
                {tools}
              </RichTextToolbarMoreGroup>
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
