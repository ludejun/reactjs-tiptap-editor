import { isActive } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import {
  BetweenHorizonalEndIcon,
  BetweenHorizonalStartIcon,
  BetweenVerticalEndIcon,
  BetweenVerticalStartIcon,
  CornerDownLeftIcon,
  TableCellsMergeIcon,
  TableCellsSplitIcon,
  Trash2Icon,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { DeleteColumn as DeleteColumnIcon } from '@/components/icons/DeleteColumn';
import { DeleteRow as DeleteRowIcon } from '@/components/icons/DeleteRow';
import { registerIcons } from '@/components/icons/icons';
import { Table } from '@/extensions/Table';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { getShortcutKeys } from '@/utils/plateform';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({
  BetweenHorizonalEnd: BetweenHorizonalEndIcon,
  BetweenHorizonalStart: BetweenHorizonalStartIcon,
  BetweenVerticalEnd: BetweenVerticalEndIcon,
  BetweenVerticalStart: BetweenVerticalStartIcon,
  CornerDownLeft: CornerDownLeftIcon,
  DeleteColumn: DeleteColumnIcon,
  DeleteRow: DeleteRowIcon,
  TableCellsMerge: TableCellsMergeIcon,
  TableCellsSplit: TableCellsSplitIcon,
  Trash2: Trash2Icon,
});

interface RichTextBubbleTableProps {
  hiddenActions?: string[];
}

interface MenuPosition {
  x: number;
  y: number;
}

/**
 * Table actions, opened with a right click inside the table.
 *
 * A caret-triggered bubble menu sat on top of the document the whole time the
 * cursor was in a cell; every other editor puts these behind a context menu.
 */
function RichTextBubbleTable({ hiddenActions = [] }: RichTextBubbleTableProps) {
  const { t } = useLocale();

  const editable = useEditableEditor();
  const editor = useEditorInstance();

  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);

  const can = useEditorState({
    editor,
    selector: ({ editor }) => {
      const commands = editor.can();
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
      };
    },
  });

  useEffect(() => {
    if (!editable) {
      return;
    }

    const dom = editor.view.dom;

    const onContextMenu = (event: MouseEvent) => {
      const cell = (event.target as HTMLElement | null)?.closest?.('td, th');

      if (!cell || !dom.contains(cell)) {
        return;
      }

      // Move the caret into the cell that was right-clicked, otherwise the
      // commands below would act on wherever the caret happened to be. A
      // multi-cell selection is kept as is.
      const posAtPointer = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });

      if (posAtPointer && !isActive(editor.view.state, Table.name)) {
        editor.commands.setTextSelection(posAtPointer.pos);
      } else if (posAtPointer && editor.state.selection.empty) {
        editor.commands.setTextSelection(posAtPointer.pos);
      }

      event.preventDefault();
      setMenuPosition({ x: event.clientX, y: event.clientY });
    };

    dom.addEventListener('contextmenu', onContextMenu);

    return () => dom.removeEventListener('contextmenu', onContextMenu);
  }, [editor, editable]);

  const isHidden = (key: string) => hiddenActions.includes(key);

  const run = useCallback(
    (command: () => void) => () => {
      command();
      setMenuPosition(null);
    },
    []
  );

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setMenuPosition(null);
    }
  }, []);

  if (!editable) {
    return <></>;
  }

  const items = [
    {
      key: 'addColumnBefore',
      icon: 'BetweenHorizonalEnd',
      label: t('editor.table.menu.insertColumnBefore'),
      disabled: !can.addColumnBefore,
      action: () => editor.chain().focus().addColumnBefore().run(),
    },
    {
      key: 'addColumnAfter',
      icon: 'BetweenHorizonalStart',
      label: t('editor.table.menu.insertColumnAfter'),
      disabled: !can.addColumnAfter,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      key: 'deleteColumn',
      icon: 'DeleteColumn',
      label: t('editor.table.menu.deleteColumn'),
      disabled: !can.deleteColumn,
      action: () => editor.chain().focus().deleteColumn().run(),
    },
    { key: 'separator-rows', separator: true },
    {
      key: 'addRowAbove',
      icon: 'BetweenVerticalEnd',
      label: t('editor.table.menu.insertRowAbove'),
      disabled: !can.addRowBefore,
      action: () => editor.chain().focus().addRowBefore().run(),
    },
    {
      key: 'addRowBelow',
      icon: 'BetweenVerticalStart',
      label: t('editor.table.menu.insertRowBelow'),
      disabled: !can.addRowAfter,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      key: 'deleteRow',
      icon: 'DeleteRow',
      label: t('editor.table.menu.deleteRow'),
      disabled: !can.deleteRow,
      action: () => editor.chain().focus().deleteRow().run(),
    },
    { key: 'separator-cells', separator: true },
    {
      key: 'mergeCells',
      icon: 'TableCellsMerge',
      label: t('editor.table.menu.mergeCells'),
      disabled: !can.mergeCells,
      action: () => editor.chain().focus().mergeCells().run(),
    },
    {
      key: 'splitCells',
      icon: 'TableCellsSplit',
      label: t('editor.table.menu.splitCells'),
      disabled: !can.splitCell,
      action: () => editor.chain().focus().splitCell().run(),
    },
    { key: 'separator-table', separator: true },
    {
      key: 'insertParagraphAfterTable',
      icon: 'CornerDownLeft',
      label: t('editor.table.menu.insertParagraphAfterTable'),
      disabled: false,
      // Shown so the shortcut is discoverable; the label reads ⌘ on a Mac
      // and Ctrl elsewhere.
      shortcut: getShortcutKeys(['mod', 'Enter']),
      action: () => editor.chain().focus().insertParagraphAfterTable().run(),
    },
    {
      key: 'deleteTable',
      icon: 'Trash2',
      label: t('editor.table.menu.deleteTable'),
      disabled: !can.deleteTable,
      destructive: true,
      action: () => editor.chain().focus().deleteTable().run(),
    },
  ] as const;

  return (
    <DropdownMenu onOpenChange={onOpenChange} open={!!menuPosition}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className='richtext-pointer-events-none richtext-fixed richtext-size-0'
          style={{ left: menuPosition?.x ?? 0, top: menuPosition?.y ?? 0 }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='richtext-w-52' side='bottom' sideOffset={0}>
        {items.map((item) => {
          if ('separator' in item) {
            return <DropdownMenuSeparator key={item.key} />;
          }

          if (isHidden(item.key)) {
            return null;
          }

          return (
            <DropdownMenuItem
              className={
                'destructive' in item && item.destructive
                  ? 'richtext-flex richtext-gap-3 focus:richtext-bg-red-400/30 focus:richtext-text-red-500'
                  : 'richtext-flex richtext-gap-3'
              }
              disabled={item.disabled}
              key={item.key}
              onClick={run(item.action)}
            >
              <IconComponent name={item.icon} />

              <span>{item.label}</span>

              {'shortcut' in item && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { RichTextBubbleTable };
