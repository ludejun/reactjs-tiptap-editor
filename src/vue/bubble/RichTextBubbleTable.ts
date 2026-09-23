/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import {
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  CornerDownLeft,
  PaintBucket,
  Rows3,
  TableCellsMerge,
  TableCellsSplit,
  Trash2,
} from 'lucide-vue-next';
import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType,
} from 'vue';

import { COLORS_LIST } from '@/constants';
import { getShortcutKeys } from '@/utils/plateform';

import { useEditorState, useLocale } from '../context';
import { colorPalette } from '../controls';
import { useDismiss } from '../ui';

import { useBubbleEditor } from './shared';

import type { Editor } from '@tiptap/core';

interface MenuPosition {
  x: number;
  y: number;
}

const MENU_WIDTH = 260;
const MENU_HEIGHT = 400;

/**
 * Table actions, opened with a right click inside the table. A caret-driven
 * bubble would sit over the document the whole time the cursor is in a cell;
 * every other editor puts these behind a context menu.
 */
export const RichTextBubbleTable = defineComponent({
  name: 'RichTextBubbleTable',
  props: {
    /** Keys of actions to leave out, e.g. `['deleteTable']`. */
    hiddenActions: { type: Array as PropType<string[]>, default: () => [] },
  },
  setup(props) {
    const { t } = useLocale();
    const { editor, editable } = useBubbleEditor();
    const menu = ref<MenuPosition | null>(null);
    const root = ref<HTMLElement | null>(null);
    const open = computed(() => !!menu.value);
    const paletteOpen = ref(false);
    watch(open, (value) => {
      if (!value) paletteOpen.value = false;
    });

    useDismiss(open, root, () => {
      menu.value = null;
    });

    const can = useEditorState(
      (current) => {
        const commands = current.can();
        return {
          addColumnBefore: !!commands.addColumnBefore?.(),
          addColumnAfter: !!commands.addColumnAfter?.(),
          deleteColumn: !!commands.deleteColumn?.(),
          addRowBefore: !!commands.addRowBefore?.(),
          addRowAfter: !!commands.addRowAfter?.(),
          deleteRow: !!commands.deleteRow?.(),
          mergeCells: !!commands.mergeCells?.(),
          splitCell: !!commands.splitCell?.(),
          deleteTable: !!commands.deleteTable?.(),
          cellBackground: !!commands.setTableCellBackground?.('#000000'),
        };
      },
      {
        addColumnBefore: false,
        addColumnAfter: false,
        deleteColumn: false,
        addRowBefore: false,
        addRowAfter: false,
        deleteRow: false,
        mergeCells: false,
        splitCell: false,
        deleteTable: false,
        cellBackground: false,
      }
    );

    let detach: (() => void) | null = null;

    watch(
      editor,
      (current) => {
        detach?.();
        detach = null;
        if (!current) return;
        const dom = current.view.dom;

        const onContextMenu = (event: MouseEvent) => {
          if (!current.isEditable) return;
          const cell = (event.target as HTMLElement | null)?.closest?.('td, th');
          if (!cell || !dom.contains(cell)) return;

          // Move the caret into the cell that was right-clicked, otherwise the
          // commands would act on wherever the caret happened to be. A
          // multi-cell selection is kept as is.
          const pos = current.view.posAtCoords({ left: event.clientX, top: event.clientY });
          if (pos && (!current.isActive('table') || current.state.selection.empty)) {
            current.commands.setTextSelection(pos.pos);
          }

          event.preventDefault();
          menu.value = { x: event.clientX, y: event.clientY };
        };

        dom.addEventListener('contextmenu', onContextMenu);
        detach = () => dom.removeEventListener('contextmenu', onContextMenu);
      },
      { immediate: true }
    );
    onBeforeUnmount(() => detach?.());

    const run = (command: (current: Editor) => void) => () => {
      if (editor.value) command(editor.value);
      menu.value = null;
    };

    return () => {
      const position = menu.value;
      if (!position || !editable.value || !editor.value) return null;

      const items: (
        | { key: string; separator: true }
        | { key: string; palette: true }
        | {
            key: string;
            icon: Component;
            label: string;
            disabled: boolean;
            danger?: boolean;
            shortcut?: string;
            action: (current: Editor) => void;
          }
      )[] = [
        {
          key: 'addColumnBefore',
          icon: BetweenHorizontalEnd,
          label: t('editor.table.menu.insertColumnBefore'),
          disabled: !can.value.addColumnBefore,
          action: (e) => e.chain().focus().addColumnBefore().run(),
        },
        {
          key: 'addColumnAfter',
          icon: BetweenHorizontalStart,
          label: t('editor.table.menu.insertColumnAfter'),
          disabled: !can.value.addColumnAfter,
          action: (e) => e.chain().focus().addColumnAfter().run(),
        },
        {
          key: 'deleteColumn',
          icon: Columns3,
          label: t('editor.table.menu.deleteColumn'),
          disabled: !can.value.deleteColumn,
          action: (e) => e.chain().focus().deleteColumn().run(),
        },
        { key: 'separator-rows', separator: true },
        {
          key: 'addRowAbove',
          icon: BetweenVerticalEnd,
          label: t('editor.table.menu.insertRowAbove'),
          disabled: !can.value.addRowBefore,
          action: (e) => e.chain().focus().addRowBefore().run(),
        },
        {
          key: 'addRowBelow',
          icon: BetweenVerticalStart,
          label: t('editor.table.menu.insertRowBelow'),
          disabled: !can.value.addRowAfter,
          action: (e) => e.chain().focus().addRowAfter().run(),
        },
        {
          key: 'deleteRow',
          icon: Rows3,
          label: t('editor.table.menu.deleteRow'),
          disabled: !can.value.deleteRow,
          action: (e) => e.chain().focus().deleteRow().run(),
        },
        { key: 'separator-cells', separator: true },
        {
          key: 'mergeCells',
          icon: TableCellsMerge,
          label: t('editor.table.menu.mergeCells'),
          disabled: !can.value.mergeCells,
          action: (e) => e.chain().focus().mergeCells().run(),
        },
        {
          key: 'splitCells',
          icon: TableCellsSplit,
          label: t('editor.table.menu.splitCells'),
          disabled: !can.value.splitCell,
          action: (e) => e.chain().focus().splitCell().run(),
        },
        { key: 'cellBackground', palette: true },
        { key: 'separator-table', separator: true },
        {
          key: 'insertParagraphAfterTable',
          icon: CornerDownLeft,
          label: t('editor.table.menu.insertParagraphAfterTable'),
          disabled: false,
          // Shown so the shortcut is discoverable; reads ⌘ on a Mac, Ctrl elsewhere.
          shortcut: getShortcutKeys(['mod', 'Enter']),
          action: (e) => e.chain().focus().insertParagraphAfterTable().run(),
        },
        {
          key: 'deleteTable',
          icon: Trash2,
          label: t('editor.table.menu.deleteTable'),
          disabled: !can.value.deleteTable,
          danger: true,
          action: (e) => e.chain().focus().deleteTable().run(),
        },
      ];

      return h(
        'div',
        {
          ref: root,
          role: 'menu',
          class: 'richtext-vue-menu',
          style: {
            left: `${Math.max(0, Math.min(position.x, window.innerWidth - MENU_WIDTH))}px`,
            top: `${Math.max(0, Math.min(position.y, window.innerHeight - MENU_HEIGHT))}px`,
          },
        },
        items.map((item) => {
          if ('separator' in item)
            return h('div', { key: item.key, class: 'richtext-vue-menu__separator' });
          if (props.hiddenActions.includes(item.key)) return null;
          if ('palette' in item) {
            // Cell background: the row toggles a palette right under it.
            return h('div', { key: item.key, class: 'richtext-vue-menu__group' }, [
              h(
                'button',
                {
                  type: 'button',
                  role: 'menuitem',
                  class: 'richtext-vue-menu__item',
                  'aria-expanded': paletteOpen.value ? 'true' : 'false',
                  disabled: !can.value.cellBackground,
                  onMousedown: (event: MouseEvent) => event.preventDefault(),
                  onClick: () => {
                    paletteOpen.value = !paletteOpen.value;
                  },
                },
                [
                  h(PaintBucket, { size: 16, 'aria-hidden': 'true' }),
                  h('span', t('editor.table.menu.setCellsBgColor')),
                ]
              ),
              paletteOpen.value
                ? h(
                    'div',
                    { class: 'richtext-vue-menu__palette' },
                    colorPalette(
                      COLORS_LIST,
                      undefined,
                      { reset: t('editor.nofill'), more: t('editor.color.more') },
                      (color, sweeping) => {
                        const current = editor.value;
                        if (!current) return;
                        if (color) current.chain().focus().setTableCellBackground(color).run();
                        else current.chain().focus().unsetTableCellBackground().run();
                        if (!sweeping) menu.value = null;
                      }
                    )
                  )
                : null,
            ]);
          }
          return h(
            'button',
            {
              key: item.key,
              type: 'button',
              role: 'menuitem',
              class: [
                'richtext-vue-menu__item',
                item.danger ? 'richtext-vue-menu__item--danger' : null,
              ],
              disabled: item.disabled,
              onMousedown: (event: MouseEvent) => event.preventDefault(),
              onClick: run(item.action),
            },
            [
              h(item.icon, { size: 16, 'aria-hidden': 'true' }),
              h('span', item.label),
              item.shortcut
                ? h('span', { class: 'richtext-vue-menu__shortcut' }, item.shortcut)
                : null,
            ]
          );
        })
      );
    };
  },
});
