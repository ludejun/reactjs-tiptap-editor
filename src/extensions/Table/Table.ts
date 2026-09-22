import {
  Table as TiptapTable,
  TableRow,
  TableCell,
  TableHeader,
  type TableCellOptions,
  type TableRowOptions,
  type TableHeaderOptions,
} from '@tiptap/extension-table';
import { Plugin, PluginKey, TextSelection, type Transaction } from '@tiptap/pm/state';

import { TableCellBackground } from './TableCellBackground';

import type { TableCellBackgroundOptions } from './TableCellBackground';
import type { ButtonViewParams } from '@/types';
import type { GeneralOptions } from '@/types';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/**
 * Moves the caret to the block after `table`, adding an empty paragraph when
 * the table is followed by another block that cannot hold a caret, or by
 * nothing at all. Works on `tr` so it can be part of a command chain; with
 * `dispatch` unset it only reports whether it could run.
 */
function caretAfterTable(
  tr: Transaction,
  tablePos: number,
  table: ProseMirrorNode,
  dispatch: ((tr: Transaction) => void) | undefined
): boolean {
  const after = tablePos + table.nodeSize;

  if (after > tr.doc.content.size) {
    return false;
  }

  const next = tr.doc.resolve(after).nodeAfter;

  if (next?.isTextblock) {
    if (dispatch) {
      tr.setSelection(TextSelection.create(tr.doc, after + 1)).scrollIntoView();
    }

    return true;
  }

  const paragraph = tr.doc.type.schema.nodes.paragraph?.createAndFill();

  if (!paragraph) {
    return false;
  }

  if (dispatch) {
    tr.insert(after, paragraph);
    tr.setSelection(TextSelection.create(tr.doc, after + 1)).scrollIntoView();
  }

  return true;
}

/** The innermost table around `pos`, with the position it starts at. */
function tableAround(doc: ProseMirrorNode, pos: number) {
  const $pos = doc.resolve(pos);

  for (let depth = $pos.depth; depth > 0; depth--) {
    const node = $pos.node(depth);

    if (node.type.name === 'table') {
      return { node, pos: $pos.before(depth) };
    }
  }

  return null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableExit: {
      /**
       * Puts the caret in the block after the table the selection is in,
       * inserting an empty paragraph first when there is no such block.
       * `Mod-Enter` and a click beside the table do the same.
       */
      insertParagraphAfterTable: () => ReturnType;
    };
  }
}

export interface TableOptions extends GeneralOptions<TableOptions> {
  HTMLAttributes: Record<string, unknown>;
  resizable: boolean;
  handleWidth: number;
  cellMinWidth: number;
  lastColumnResizable: boolean;
  allowTableNodeSelection: boolean;
  /** options for table rows */
  tableRow: Partial<TableRowOptions>;
  /** options for table headers */
  tableHeader: Partial<TableHeaderOptions>;
  /** options for table cells */
  tableCell: Partial<TableCellOptions>;
  /** options for table cell background */
  tableCellBackground: Partial<TableCellBackgroundOptions>;
}

export * from '@/extensions/Table/components/RichTextTable';

export const Table = /* @__PURE__ */ TiptapTable.extend<TableOptions>({
  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        // Width is left to the stylesheet: a table only grows to what its
        // columns need, and goes full width on narrow screens.
        style: `
          border: 1px solid rgba(125, 125, 125, 0.3);
          border-collapse: separate;
          border-spacing: 0;
        `,
      },
      resizable: true,
      lastColumnResizable: true,
      allowTableNodeSelection: false,

      button: ({ editor, t }: ButtonViewParams<TableOptions>) => ({
        componentProps: {
          isActive: () => editor.isActive('table'),
          icon: 'Table',
          tooltip: t('editor.table.tooltip'),
        },
      }),
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertParagraphAfterTable:
        () =>
        ({ tr, dispatch }) => {
          const table = tableAround(tr.doc, tr.selection.from);

          return table ? caretAfterTable(tr, table.pos, table.node, dispatch) : false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      // A table that ends the document, or is followed by another table, has
      // nowhere to click. This always produces a paragraph under it.
      'Mod-Enter': ({ editor }) => editor.commands.insertParagraphAfterTable(),
    };
  },

  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey('tableClickBelow'),
        props: {
          /**
           * A table only as wide as its columns leaves empty space beside and
           * under it. ProseMirror maps a click there to the nearest position,
           * which is inside the last cell — so the caret appears to be stuck
           * in the table. Treat those clicks as "put the caret after the
           * table", which is what every other editor does.
           */
          handleClick(view, pos, event) {
            const table = tableAround(view.state.doc, pos);

            if (!table) {
              return false;
            }

            const dom = view.nodeDOM(table.pos);
            const element =
              dom instanceof HTMLElement
                ? (dom.closest('table') ?? dom.querySelector('table') ?? dom)
                : null;
            const rect = element?.getBoundingClientRect();

            if (!rect || (event.clientX <= rect.right && event.clientY <= rect.bottom)) {
              return false;
            }

            const tr = view.state.tr;

            if (!caretAfterTable(tr, table.pos, table.node, view.dispatch)) {
              return false;
            }

            view.dispatch(tr);

            return true;
          },
        },
      }),
    ];
  },

  addExtensions() {
    return [
      TableRow.configure(this.options.tableRow),
      TableHeader.configure(this.options.tableHeader),
      TableCell.configure(this.options.tableCell),
      TableCellBackground.configure(this.options.tableCellBackground),
    ];
  },
});
