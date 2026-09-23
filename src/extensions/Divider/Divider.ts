import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import type { ButtonViewParams, GeneralOptions } from '@/types';
import type { DOMOutputSpec, TagParseRule } from '@tiptap/pm/model';

/** Built-in looks. Hosts can add their own with `variants` and CSS. */
export const DIVIDER_VARIANTS = [
  'line',
  'dashed',
  'dotted',
  'double',
  'short',
  'dots',
  'stars',
  'text',
  'number',
] as const;

export type DividerVariant = (typeof DIVIDER_VARIANTS)[number] | (string & {});

export interface DividerAttributes {
  /** One of `DIVIDER_VARIANTS`, or a custom name styled by the host. */
  variant: DividerVariant;
  /**
   * Text shown in the middle of a `text` divider. For `number` dividers this
   * is the ordinal, kept up to date by the extension.
   */
  label: string | null;
}

export interface DividerVariantOption {
  value: DividerVariant;
  /** Menu label; defaults to the built-in translation for known variants. */
  label?: string;
  /** Whether the user can type a label into it. */
  editable?: boolean;
}

export interface DividerOptions extends GeneralOptions<DividerOptions> {
  HTMLAttributes: Record<string, unknown>;
  /** Variants offered in the toolbar and the picker; order is menu order. */
  variants: DividerVariantOption[];
  /** Variant inserted by the toolbar button, `/divider` and the shortcut. */
  defaultVariant: DividerVariant;
  /**
   * Overrides the saved HTML. Return a ProseMirror `DOMOutputSpec`; pair it
   * with `parseRules` so the same markup is read back.
   */
  renderDivider?: (attrs: DividerAttributes) => DOMOutputSpec;
  /** Extra parse rules, tried before the built-in ones. */
  parseRules?: TagParseRule[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    divider: {
      /** Inserts a divider at the selection. */
      setDivider: (attrs?: Partial<DividerAttributes>) => ReturnType;
      /** Changes the selected divider. */
      updateDivider: (attrs: Partial<DividerAttributes>) => ReturnType;
    };
  }
}

const NUMBERED = 'number';

/**
 * The divider without a node view: renders through `renderHTML`, so it works
 * with any Tiptap binding (Vue, plain ProseMirror). The React package extends
 * it with an interactive node view as `Divider`.
 */
export const DividerCore = /* @__PURE__ */ Node.create<DividerOptions>({
  name: 'divider',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {},
      variants: DIVIDER_VARIANTS.map((value) => ({
        value,
        editable: value === 'text',
      })),
      defaultVariant: 'line',
      button: ({ editor, t, extension }: ButtonViewParams<DividerOptions>) => ({
        componentProps: {
          action: (variant?: DividerVariant) =>
            editor.chain().focus().setDivider({ variant }).run(),
          disabled: !editor.can().setDivider(),
          icon: 'SeparatorHorizontal',
          shortcutKeys: extension.options.shortcutKeys ?? ['mod', 'alt', 'S'],
          tooltip: t('editor.divider.tooltip'),
          variants: extension.options.variants,
        },
      }),
    };
  },

  addAttributes() {
    return {
      variant: {
        default: this.options.defaultVariant,
        parseHTML: (element) => element.getAttribute('data-variant') || 'line',
        renderHTML: (attrs) => ({ 'data-variant': attrs.variant }),
      },
      label: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute('data-label') ??
          element.querySelector('.divider__label')?.textContent ??
          null,
        renderHTML: (attrs) => (attrs.label ? { 'data-label': attrs.label } : {}),
      },
    };
  },

  parseHTML() {
    return [
      ...(this.options.parseRules ?? []),
      { tag: 'div[data-type="divider"]' },
      // Documents saved before this extension existed.
      { tag: 'div[data-type="horizontalRule"]', attrs: { variant: 'line' } },
      { tag: 'hr', attrs: { variant: 'line' } },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const attrs = node.attrs as DividerAttributes;

    if (this.options.renderDivider) {
      return this.options.renderDivider(attrs);
    }

    // An <hr> stays inside so the rule still shows where the stylesheet is
    // not loaded, in exported Word files, and in feeds that strip classes.
    const label = attrs.label && attrs.variant !== 'line' ? attrs.label : null;
    const children: DOMOutputSpec[] = label
      ? [['hr'], ['span', { class: 'divider__label' }, label], ['hr']]
      : [['hr']];

    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': this.name,
        class: `divider divider--${attrs.variant}`,
        role: 'separator',
      }),
      ...children,
    ];
  },

  renderText() {
    return '\n---\n';
  },

  // Markdown export: captions have no markdown form, so every variant is a rule.
  renderMarkdown: () => '---\n\n',

  addCommands() {
    return {
      setDivider:
        (attrs = {}) =>
        ({ chain, state }) => {
          const variant = attrs.variant ?? this.options.defaultVariant;
          const label = attrs.label ?? null;
          const { $from } = state.selection;
          // Inserting inside an empty paragraph replaces it, like Notion and
          // Google Docs do; otherwise the divider goes after the current block.
          const replaceEmpty = $from.parent.type.name === 'paragraph' && !$from.parent.content.size;

          return chain()
            .insertContent(
              [
                { type: this.name, attrs: { variant, label } },
                // A paragraph to keep typing in, unless one already follows.
                ...(replaceEmpty ? [] : [{ type: 'paragraph' }]),
              ],
              { updateSelection: true }
            )
            .run();
        },
      updateDivider:
        (attrs) =>
        ({ state, tr, dispatch }) => {
          const { selection } = state;
          const node =
            'node' in selection ? (selection as { node: { type: { name: string } } }).node : null;

          if (!node || node.type.name !== this.name) {
            return false;
          }

          if (dispatch) {
            tr.setNodeMarkup(selection.from, undefined, {
              ...state.doc.nodeAt(selection.from)?.attrs,
              ...attrs,
            });
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-s': () => this.editor.commands.setDivider(),
    };
  },

  addProseMirrorPlugins() {
    const name = this.name;

    return [
      new Plugin({
        key: new PluginKey('dividerNumbering'),
        /**
         * `number` dividers show their position among their kind, so moving or
         * deleting one renumbers the rest. The ordinal is stored as `label` so
         * saved HTML and exports carry it too.
         */
        appendTransaction(transactions, _old, state) {
          if (!transactions.some((tr) => tr.docChanged)) {
            return null;
          }

          const tr = state.tr;
          let index = 0;
          let changed = false;

          state.doc.descendants((node, pos) => {
            if (node.type.name !== name || node.attrs.variant !== NUMBERED) {
              return;
            }

            const label = String(++index);

            if (node.attrs.label !== label) {
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, label });
              changed = true;
            }
          });

          return changed ? tr : null;
        },
      }),
    ];
  },
});
