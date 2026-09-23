/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Gapcursor, Placeholder } from '@tiptap/extensions';
import { computed, defineComponent, h, type PropType, type VNode } from 'vue';

import {
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  CodeView,
  Color,
  Column,
  ColumnNode,
  Details,
  ExportMarkdown,
  ExportPdf,
  ExportWord,
  FontFamily,
  FontSize,
  Heading,
  Highlight,
  History,
  ImportWord,
  Indent,
  Italic,
  LineHeight,
  Link,
  MarkdownPaste,
  MoreMark,
  MultipleColumnNode,
  OrderedList,
  Recorder,
  RichPaste,
  SearchAndReplace,
  Strike,
  Table,
  TaskList,
  TextAlign,
  TextDirection,
  TextUnderline,
  Video,
} from '@/core';
import { buildKit, extensionNames, type KitOptions, type KitRegistry } from '@/kit/shared';

import { AI, AIAutocomplete, RichTextAI, RichTextAIComposer } from './ai';
import {
  RichTextBubbleImage,
  RichTextBubbleLink,
  RichTextBubbleTable,
  RichTextBubbleText,
} from './bubble';
import { useEditorInstance, useLocale } from './context';
import {
  RichTextAttachment,
  RichTextBlockquote,
  RichTextBold,
  RichTextBulletList,
  RichTextCallout,
  RichTextClear,
  RichTextCode,
  RichTextCodeBlock,
  RichTextColor,
  RichTextDetails,
  RichTextDivider,
  RichTextFontSize,
  RichTextHeading,
  RichTextHighlight,
  RichTextIframe,
  RichTextImage,
  RichTextIndent,
  RichTextItalic,
  RichTextKatex,
  RichTextLineHeight,
  RichTextLink,
  RichTextMermaid,
  RichTextOrderedList,
  RichTextOutdent,
  RichTextRedo,
  RichTextStrike,
  RichTextTable,
  RichTextTableOfContents,
  RichTextTaskList,
  RichTextTextAlign,
  RichTextUnderline,
  RichTextUndo,
  RichTextVideo,
} from './controls';
import { Divider } from './Divider';
import {
  Attachment,
  Callout,
  CodeBlock,
  Iframe,
  Image,
  ImageGif,
  Katex,
  Mermaid,
  TableOfContents,
} from './nodeviews';
import {
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
} from './ui';

/** Columns are block-level siblings, so the document has to allow them. */
const DocumentWithColumns = /* @__PURE__ */ Document.extend({ content: '(block|columns)+' });

/**
 * Every feature the Vue kit knows, keyed by its option name. Blocks with a
 * node view use the Vue variants; React-only features (Excalidraw, Drawer,
 * Emoji, Mention, Twitter, the slash menu) are not part of it.
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
  link: { extension: Link },
  heading: { extension: Heading },
  bulletList: { extension: BulletList, with: [ListItem] },
  orderedList: { extension: OrderedList, with: [ListItem] },
  taskList: { extension: TaskList },
  blockquote: { extension: Blockquote },
  table: { extension: Table },
  divider: { extension: Divider },
  details: { extension: Details },
  codeBlock: { extension: CodeBlock },
  callout: { extension: Callout },
  column: { extension: Column, with: [ColumnNode, MultipleColumnNode], optIn: true },
  tableOfContents: { extension: TableOfContents },
  image: { extension: Image },
  video: { extension: Video },
  iframe: { extension: Iframe },
  attachment: { extension: Attachment },
  katex: { extension: Katex },
  mermaid: { extension: Mermaid },
  imageGif: { extension: ImageGif, optIn: true },
  searchAndReplace: { extension: SearchAndReplace },
  richPaste: { extension: RichPaste },
  markdownPaste: { extension: MarkdownPaste },
  recorder: { extension: Recorder, optIn: true },
  exportMarkdown: { extension: ExportMarkdown },
  exportWord: { extension: ExportWord },
  importWord: { extension: ImportWord },
  exportPdf: { extension: ExportPdf },
  codeView: { extension: CodeView },
  ai: { extension: AI },
  aiAutocomplete: { extension: AIAutocomplete },
} satisfies KitRegistry;

export type RichTextKitOptions = KitOptions<typeof REGISTRY>;

/**
 * The whole editor as one extension for Vue, like Tiptap's StarterKit: every
 * feature above with its Vue node views. `false` leaves a feature out, an
 * object configures it (`ai: { endpoint: '/api/ai' }`), and an object for an
 * opt-in feature switches it on (`imageGif: { GIPHY_API_KEY }`).
 */
export const RichTextKit = Extension.create<RichTextKitOptions>({
  name: 'richTextKit',

  addOptions() {
    return {};
  },

  addExtensions() {
    const registry = { ...REGISTRY } as typeof REGISTRY;
    if (this.options.column && this.options.column !== undefined) {
      registry.document = { extension: DocumentWithColumns } as typeof REGISTRY.document;
    }
    return buildKit(registry, this.options);
  },
});

type Maybe = VNode | null | false;

function withDividers(groups: Maybe[][]): VNode[] {
  const out: VNode[] = [];
  groups
    .map((group) => group.filter((node): node is VNode => !!node))
    .filter((group) => group.length)
    .forEach((group, index) => {
      if (index) out.push(h(RichTextToolbarDivider, { key: `divider-${index}` }));
      out.push(...group);
    });
  return out;
}

/**
 * A complete Vue toolbar for `RichTextKit` (or any editor). Each control
 * appears only when its extension is registered. The default slot adds
 * controls before the "More tools" panel.
 */
export const RichTextKitToolbar = defineComponent({
  name: 'RichTextKitToolbar',
  props: {
    /** The "More tools" panel with the less frequent controls. Default true. */
    more: { type: Boolean, default: true },
  },
  setup(props, { slots }) {
    const editor = useEditorInstance();
    const { t } = useLocale();
    const names = computed(() => extensionNames(editor.value));

    return () => {
      const on = (name: string) => names.value.has(name);
      const row = (name: string, label: string, control: Parameters<typeof h>[0]) =>
        on(name) ? h(RichTextToolbarMoreRow, { key: name, label }, () => h(control)) : null;
      const format = [
        row('fontSize', t('editor.fontSize.tooltip'), RichTextFontSize),
        row('lineHeight', t('editor.lineheight.tooltip'), RichTextLineHeight),
        row('richtextIndentOutdent', t('editor.indent.indent'), RichTextIndent),
        row('richtextIndentOutdent', t('editor.indent.outdent'), RichTextOutdent),
      ].filter(Boolean) as VNode[];
      const insert = [
        row('codeBlock', t('editor.codeblock.tooltip'), RichTextCodeBlock),
        row('callout', t('editor.callout.tooltip'), RichTextCallout),
        row('details', t('editor.details.tooltip'), RichTextDetails),
        row('tableOfContents', t('editor.tableofcontents.tooltip'), RichTextTableOfContents),
        row('video', t('editor.video.tooltip'), RichTextVideo),
        row('iframe', t('editor.iframe.tooltip'), RichTextIframe),
        row('attachment', t('editor.attachment.tooltip'), RichTextAttachment),
        row('katex', t('editor.katex.tooltip'), RichTextKatex),
        row('mermaid', t('editor.mermaid.tooltip'), RichTextMermaid),
      ].filter(Boolean) as VNode[];
      const showMore = props.more && format.length + insert.length > 0;

      return h(RichTextToolbar, null, () => [
        ...withDividers([
          [on('ai') && h(RichTextAI, { key: 'ai' })],
          [
            on('undoRedo') && h(RichTextUndo, { key: 'undo' }),
            on('undoRedo') && h(RichTextRedo, { key: 'redo' }),
          ],
          [on('heading') && h(RichTextHeading, { key: 'heading' })],
          [
            on('bold') && h(RichTextBold, { key: 'bold' }),
            on('italic') && h(RichTextItalic, { key: 'italic' }),
            on('underline') && h(RichTextUnderline, { key: 'underline' }),
            on('strike') && h(RichTextStrike, { key: 'strike' }),
            on('code') && h(RichTextCode, { key: 'code' }),
            on('color') && h(RichTextColor, { key: 'color' }),
            on('highlight') && h(RichTextHighlight, { key: 'highlight' }),
            on('clear') && h(RichTextClear, { key: 'clear' }),
          ],
          [
            on('bulletList') && h(RichTextBulletList, { key: 'bulletList' }),
            on('orderedList') && h(RichTextOrderedList, { key: 'orderedList' }),
            on('taskList') && h(RichTextTaskList, { key: 'taskList' }),
            on('blockquote') && h(RichTextBlockquote, { key: 'blockquote' }),
            on('textAlign') && h(RichTextTextAlign, { key: 'textAlign' }),
          ],
          [
            on('link') && h(RichTextLink, { key: 'link' }),
            on('image') && h(RichTextImage, { key: 'image' }),
            on('table') && h(RichTextTable, { key: 'table' }),
            on('divider') && h(RichTextDivider, { key: 'divider' }),
          ],
          [...((slots.default?.() ?? []) as VNode[])],
        ]),
        showMore
          ? h('div', { class: 'richtext-kit-toolbar-more' }, [
              h(RichTextToolbarMore, { label: t('editor.more') }, () => [
                format.length
                  ? h(RichTextToolbarMoreGroup, { label: t('editor.slash.format') }, () => format)
                  : null,
                insert.length
                  ? h(RichTextToolbarMoreGroup, { label: t('editor.slash.insert') }, () => insert)
                  : null,
              ]),
            ])
          : null,
      ]);
    };
  },
});

/**
 * The floating UI for a Vue editor: the AI composer dock, the text bubble
 * with the Improve menu, and the table, link and image bubbles — each only
 * when its extension is registered. Place it after `EditorContent`.
 */
export const RichTextKitMenus = defineComponent({
  name: 'RichTextKitMenus',
  props: {
    /** The AI composer dock: `false` hides it, an object passes its props. Default true. */
    composer: {
      type: [Boolean, Object] as PropType<boolean | Record<string, unknown>>,
      default: true,
    },
  },
  setup(props) {
    const editor = useEditorInstance();
    const names = computed(() => extensionNames(editor.value));

    return () => {
      const on = (name: string) => names.value.has(name);
      return [
        on('ai') && props.composer !== false
          ? h(RichTextAIComposer, typeof props.composer === 'object' ? props.composer : {})
          : null,
        h(RichTextBubbleText),
        on('table') ? h(RichTextBubbleTable) : null,
        on('link') ? h(RichTextBubbleLink) : null,
        on('image') ? h(RichTextBubbleImage) : null,
      ];
    };
  },
});
