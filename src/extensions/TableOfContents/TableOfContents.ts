import { Node, mergeAttributes } from '@tiptap/core';
import {
  TableOfContents as TiptapTableOfContents,
  getHierarchicalIndexes,
} from '@tiptap/extension-table-of-contents';

import type { GeneralOptions } from '@/types';
import type { TableOfContentsOptions as TiptapTableOfContentsOptions } from '@tiptap/extension-table-of-contents';

export type {
  TableOfContentData,
  TableOfContentDataItem,
} from '@tiptap/extension-table-of-contents';
export { getHierarchicalIndexes, getLinearIndexes } from '@tiptap/extension-table-of-contents';
export * from '@/extensions/TableOfContents/toc';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContentsNode: {
      /**
       * Insert a table of contents block at the current selection.
       */
      insertTableOfContents: () => ReturnType;
    };
  }
}

export interface TableOfContentsNodeOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface TableOfContentsOptions
  extends TiptapTableOfContentsOptions, GeneralOptions<TableOfContentsOptions> {
  /**
   * HTML attributes applied to the table of contents block.
   */
  HTMLAttributes: Record<string, unknown>;
}

/**
 * Block node for the headings collected by the `tableOfContents` extension,
 * without a node view: it renders an empty `div.table-of-contents` through
 * `renderHTML`. `TableOfContentsCore` registers it; the React and Vue packages
 * extend it with the live list.
 */
export const TableOfContentsNodeCore =
  /* @__PURE__ */ Node.create<TableOfContentsNodeOptions>({
    name: 'tableOfContentsNode',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addOptions() {
      return {
        HTMLAttributes: {
          class: 'table-of-contents',
        },
      };
    },

    parseHTML() {
      return [{ tag: 'div[data-type="table-of-contents"]' }];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          'data-type': 'table-of-contents',
        }),
      ];
    },

    addCommands() {
      return {
        insertTableOfContents:
          () =>
          ({ commands }) => {
            return commands.insertContent({ type: this.name });
          },
      };
    },
  });

/**
 * Tracks headings in the document and exposes them through
 * `editor.storage.tableOfContents.content`. Also registers the
 * `tableOfContentsNode` block so a table of contents can be inserted into the
 * document. Framework-free: the React package extends it with the live node
 * view as `TableOfContents`; the Vue layer does the same.
 */
export const TableOfContentsCore =
  /* @__PURE__ */ TiptapTableOfContents.extend<TableOfContentsOptions>({
    // @ts-expect-error
    addOptions() {
      return {
        ...this.parent?.(),
        getIndex: getHierarchicalIndexes,
        HTMLAttributes: {
          class: 'table-of-contents',
        },
        button: ({ editor, t }) => ({
          componentProps: {
            action: () => editor.chain().focus().insertTableOfContents().run(),
            isActive: () => editor.isActive(TableOfContentsNodeCore.name) || false,
            disabled: false,
            icon: 'TableOfContents',
            tooltip: t('editor.tableofcontents.tooltip'),
          },
        }),
      };
    },

    addExtensions() {
      return [
        TableOfContentsNodeCore.configure({
          HTMLAttributes: this.options.HTMLAttributes,
        }),
      ];
    },
  });
