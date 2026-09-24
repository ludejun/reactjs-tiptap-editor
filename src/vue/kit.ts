/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { Extension } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { HardBreak } from '@tiptap/extension-hard-break';
import { ListItem } from '@tiptap/extension-list';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Dropcursor, Gapcursor, Placeholder } from '@tiptap/extensions';
import { PinOff } from 'lucide-vue-next';
import { computed, defineComponent, h, ref, type PropType, type VNode } from 'vue';

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

const DRAG_TYPE = 'application/x-richtext-kit-control';
const DEFAULT_PINS_KEY = 'ai-sparkwrite-editor:kit-toolbar-pins';

function readPins(key: string): string[] | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((item) => typeof item === 'string') : [];
  } catch {
    return null;
  }
}

function writePins(key: string, pins: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(pins));
  } catch {
    // Storage may be unavailable; pins then last for the session.
  }
}

interface PanelEntry {
  key: string;
  name: string;
  label: string;
  control: Parameters<typeof h>[0];
}

/**
 * A complete Vue toolbar for `RichTextKit` (or any editor). Each control
 * appears only when its extension is registered. Rows of the "More tools"
 * panel can be dragged onto the toolbar to pin them there (and back to
 * unpin); the choice is remembered in localStorage. The default slot adds
 * controls before the panel.
 */
export const RichTextKitToolbar = defineComponent({
  name: 'RichTextKitToolbar',
  props: {
    /** The "More tools" panel with the less frequent controls. Default true. */
    more: { type: Boolean, default: true },
    /** Let users drag panel rows onto the toolbar to keep them there. Default true. */
    pinnable: { type: Boolean, default: true },
    /** localStorage key for the pinned controls. */
    storageKey: { type: String, default: DEFAULT_PINS_KEY },
    /** Controls pinned before the user changes anything, by panel key. */
    defaultPins: { type: Array as PropType<string[]>, default: () => [] },
  },
  setup(props, { slots }) {
    const editor = useEditorInstance();
    const { t } = useLocale();
    const names = computed(() => extensionNames(editor.value));
    const pins = ref<string[]>(readPins(props.storageKey) ?? props.defaultPins);
    const dropTarget = ref<'toolbar' | 'panel' | null>(null);
    const setPins = (next: string[]) => {
      pins.value = next;
      writePins(props.storageKey, next);
    };
    const dragKey = (event: DragEvent) =>
      event.dataTransfer?.types.includes(DRAG_TYPE) ? event.dataTransfer.getData(DRAG_TYPE) : '';
    const startDrag = (key: string) => (event: DragEvent) => {
      event.dataTransfer?.setData(DRAG_TYPE, key);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
    };
    const accept = (target: 'toolbar' | 'panel') => (event: DragEvent) => {
      if (!props.pinnable || !event.dataTransfer?.types.includes(DRAG_TYPE)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      dropTarget.value = target;
    };

    return () => {
      const on = (name: string) => names.value.has(name);
      const groups: { label: string; entries: PanelEntry[] }[] = [
        {
          label: t('editor.slash.format'),
          entries: [
            {
              key: 'fontSize',
              name: 'fontSize',
              label: t('editor.fontSize.tooltip'),
              control: RichTextFontSize,
            },
            {
              key: 'lineHeight',
              name: 'lineHeight',
              label: t('editor.lineheight.tooltip'),
              control: RichTextLineHeight,
            },
            {
              key: 'indent',
              name: 'richtextIndentOutdent',
              label: t('editor.indent.indent'),
              control: RichTextIndent,
            },
            {
              key: 'outdent',
              name: 'richtextIndentOutdent',
              label: t('editor.indent.outdent'),
              control: RichTextOutdent,
            },
          ],
        },
        {
          label: t('editor.slash.insert'),
          entries: [
            {
              key: 'codeBlock',
              name: 'codeBlock',
              label: t('editor.codeblock.tooltip'),
              control: RichTextCodeBlock,
            },
            {
              key: 'callout',
              name: 'callout',
              label: t('editor.callout.tooltip'),
              control: RichTextCallout,
            },
            {
              key: 'details',
              name: 'details',
              label: t('editor.details.tooltip'),
              control: RichTextDetails,
            },
            {
              key: 'tableOfContents',
              name: 'tableOfContents',
              label: t('editor.tableofcontents.tooltip'),
              control: RichTextTableOfContents,
            },
            {
              key: 'video',
              name: 'video',
              label: t('editor.video.tooltip'),
              control: RichTextVideo,
            },
            {
              key: 'iframe',
              name: 'iframe',
              label: t('editor.iframe.tooltip'),
              control: RichTextIframe,
            },
            {
              key: 'attachment',
              name: 'attachment',
              label: t('editor.attachment.tooltip'),
              control: RichTextAttachment,
            },
            {
              key: 'katex',
              name: 'katex',
              label: t('editor.katex.tooltip'),
              control: RichTextKatex,
            },
            {
              key: 'mermaid',
              name: 'mermaid',
              label: t('editor.mermaid.tooltip'),
              control: RichTextMermaid,
            },
          ],
        },
      ];
      const available = groups.flatMap((group) => group.entries).filter((entry) => on(entry.name));
      const pinned = pins.value
        .map((key) => available.find((entry) => entry.key === key))
        .filter((entry): entry is PanelEntry => !!entry);
      const panelGroups = groups
        .map((group) => ({
          ...group,
          entries: group.entries.filter(
            (entry) => on(entry.name) && !pins.value.includes(entry.key)
          ),
        }))
        .filter((group) => group.entries.length);
      const showMore = props.more && (panelGroups.length > 0 || pinned.length > 0);
      const unpin = (key: string) => setPins(pins.value.filter((item) => item !== key));

      return h(
        RichTextToolbar,
        {
          class: dropTarget.value === 'toolbar' ? 'richtext-kit-toolbar--drop' : undefined,
          onDragover: accept('toolbar'),
          onDragleave: (event: DragEvent) => {
            const root = event.currentTarget as HTMLElement;
            if (!root.contains(event.relatedTarget as Node | null)) dropTarget.value = null;
          },
          onDrop: (event: DragEvent) => {
            const key = dragKey(event);
            dropTarget.value = null;
            if (!key || !props.pinnable) return;
            event.preventDefault();
            if (!pins.value.includes(key)) setPins([...pins.value, key]);
          },
        },
        () => [
          h(
            'div',
            { class: 'richtext-kit-toolbar__groups' },
            withDividers([
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
              pinned.map((entry) =>
                h(
                  'span',
                  {
                    key: `pin-${entry.key}`,
                    class: 'richtext-kit-toolbar__pinned',
                    draggable: props.pinnable,
                    title: entry.label,
                    onDragstart: startDrag(entry.key),
                  },
                  [
                    h(entry.control),
                    h(
                      'button',
                      {
                        type: 'button',
                        class: 'richtext-kit-toolbar__unpin',
                        'aria-label': t('editor.more.unpin'),
                        title: t('editor.more.unpin'),
                        onClick: () => unpin(entry.key),
                      },
                      '×'
                    ),
                  ]
                )
              ),
              [...((slots.default?.() ?? []) as VNode[])],
            ])
          ),
          showMore
            ? h(
                'div',
                {
                  class: [
                    'richtext-kit-toolbar-more',
                    dropTarget.value === 'panel' ? 'richtext-kit-toolbar-more--drop' : null,
                  ],
                  onDragover: accept('panel'),
                  onDrop: (event: DragEvent) => {
                    const key = dragKey(event);
                    dropTarget.value = null;
                    if (!key || !props.pinnable) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setPins(pins.value.filter((item) => item !== key));
                  },
                },
                [
                  h(RichTextToolbarMore, { label: t('editor.more'), width: '620px' }, () => [
                    ...panelGroups.map((group) =>
                      h(
                        RichTextToolbarMoreGroup,
                        { key: group.label, label: group.label, columns: 3 },
                        () =>
                          group.entries.map((entry) =>
                            h(
                              'div',
                              {
                                key: entry.key,
                                class: 'richtext-kit-toolbar__row',
                                draggable: props.pinnable,
                                onDragstart: startDrag(entry.key),
                              },
                              [
                                h(RichTextToolbarMoreRow, { label: entry.label }, () =>
                                  h(entry.control)
                                ),
                              ]
                            )
                          )
                      )
                    ),
                    props.pinnable && pinned.length
                      ? h(
                          RichTextToolbarMoreGroup,
                          { label: t('editor.more.pinned'), columns: 3 },
                          () =>
                            pinned.map((entry) =>
                              h(
                                'div',
                                { key: entry.key, class: 'richtext-kit-toolbar__pinned-row' },
                                [
                                  h(RichTextToolbarMoreRow, { label: entry.label }, () =>
                                    h(entry.control)
                                  ),
                                  h(
                                    'button',
                                    {
                                      type: 'button',
                                      class: 'richtext-kit-toolbar__unpin-row',
                                      'aria-label': t('editor.more.unpin'),
                                      title: t('editor.more.unpin'),
                                      onClick: () => unpin(entry.key),
                                    },
                                    [h(PinOff, { size: 14, 'aria-hidden': 'true' })]
                                  ),
                                ]
                              )
                            )
                        )
                      : null,
                    props.pinnable
                      ? h('span', { class: 'richtext-kit-toolbar__hint' }, t('editor.more.pinHint'))
                      : null,
                  ]),
                ]
              )
            : null,
        ]
      );
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
