import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { type NodeSelection } from '@tiptap/pm/state';
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ClipboardIcon,
  Columns2Icon,
  CopyIcon,
  GripVerticalIcon,
  IndentDecreaseIcon,
  IndentIncreaseIcon,
  PaintRollerIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { ColumnAddLeft as ColumnAddLeftIcon } from '@/components/icons/ColumnAddLeft';
import { ColumnAddRight as ColumnAddRightIcon } from '@/components/icons/ColumnAddRight';
import { DeleteColumn as DeleteColumnIcon } from '@/components/icons/DeleteColumn';
import { registerIcons } from '@/components/icons/icons';
import { Clear } from '@/extensions/Clear';
import { Column, ColumnNode, MultipleColumnNode } from '@/extensions/Column';
import { Indent } from '@/extensions/Indent';
import { TextAlign } from '@/extensions/TextAlign';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';
import { IndentProps, setNodeIndentMarkup } from '@/utils/indent';

import type {} from '@tiptap/extension-paragraph';
import type { Node } from '@tiptap/pm/model';
import type { Editor } from '@tiptap/react';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({
  AlignCenter: AlignCenterIcon,
  AlignLeft: AlignLeftIcon,
  AlignRight: AlignRightIcon,
  Clipboard: ClipboardIcon,
  ColumnAddLeft: ColumnAddLeftIcon,
  ColumnAddRight: ColumnAddRightIcon,
  Columns: Columns2Icon,
  Copy: CopyIcon,
  DeleteColumn: DeleteColumnIcon,
  Grip: GripVerticalIcon,
  IndentDecrease: IndentDecreaseIcon,
  IndentIncrease: IndentIncreaseIcon,
  PaintRoller: PaintRollerIcon,
  Plus: PlusIcon,
  Trash2: Trash2Icon,
});

/** Height of the handle row: two 32px action buttons side by side. */
const HANDLE_HEIGHT = 32;

/**
 * Vertical offset that lines the handle up with the block's first line.
 *
 * The plugin pins the handle to the block's top edge, so on a 26px paragraph it
 * sat below the caret and on a 36px heading above it. Centring it on the first
 * line box fixes both. Tall blocks (images, tables, code) keep the handle near
 * the top, which is what every other editor does.
 */
function firstLineOffset(element: HTMLElement | null): number {
  if (!element) {
    return 0;
  }

  const style = getComputedStyle(element);
  const height = element.getBoundingClientRect().height;
  const lineHeight = Number.parseFloat(style.lineHeight);
  const paddingTop = Number.parseFloat(style.paddingTop) || 0;
  const firstLine = Math.min(Number.isFinite(lineHeight) ? lineHeight : height, height);

  return paddingTop + (firstLine - HANDLE_HEIGHT) / 2;
}

export function RichTextBubbleMenuDragHandle() {
  const editor = useEditorInstance();
  const editable = useEditableEditor();

  const { t } = useLocale();
  const [currentNode, setCurrentNode] = useState<import('@tiptap/pm/model').Node | null>(null);
  const [currentNodePos, setCurrentNodePos] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [handleOffset, setHandleOffset] = useState(0);

  const hasTextAlignExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === TextAlign.name
  );
  const hasIndentExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === Indent.name
  );
  const hasClearExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === Clear.name
  );
  const hasColumnExtension = editor?.extensionManager?.extensions?.some(
    (ext) => ext?.name === Column.name
  );

  // Column actions read the selection, so they need a text position inside the
  // hovered column. Resolve it from the drag handle's node instead of relying on
  // wherever the caret happens to be.
  const columnSelectionPos = useMemo(() => {
    if (!hasColumnExtension || currentNodePos < 0) {
      return null;
    }

    const { doc } = editor.state;

    if (currentNodePos > doc.content.size) {
      return null;
    }

    const $pos = doc.resolve(currentNodePos);

    for (let depth = $pos.depth; depth >= 0; depth--) {
      if ($pos.node(depth).type.name === ColumnNode.name) {
        return $pos.start(depth);
      }
    }

    // Hovering the columns wrapper itself: fall back to its first column.
    if (doc.nodeAt(currentNodePos)?.type.name === MultipleColumnNode.name) {
      return currentNodePos + 2;
    }

    return null;
  }, [editor, currentNodePos, hasColumnExtension]);

  function runColumnCommand(command: 'addColBefore' | 'addColAfter' | 'deleteCol') {
    if (columnSelectionPos === null) {
      return;
    }

    const chain = editor
      .chain()
      .setMeta('hideDragHandle', true)
      .setTextSelection(columnSelectionPos);

    if (command === 'addColBefore') {
      chain.addColBefore();
    } else if (command === 'addColAfter') {
      chain.addColAfter();
    } else {
      chain.deleteCol();
    }

    chain.run();
  }

  function resetTextFormatting() {
    const chain = editor.chain();
    chain.setNodeSelection(currentNodePos).unsetAllMarks();
    if (currentNode?.type.name !== 'paragraph') {
      chain.setParagraph();
    }
    chain.run();
  }
  function copyNodeToClipboard() {
    editor.chain().focus().setNodeSelection(currentNodePos).run();
    document.execCommand('copy');
  }
  function duplicateNode() {
    editor.commands.setNodeSelection(currentNodePos);
    const { $anchor } = editor.state.selection;
    const selectedNode = $anchor.node(1) || (editor.state.selection as NodeSelection).node;
    editor
      .chain()
      .setMeta('hideDragHandle', true)
      .insertContentAt(currentNodePos + (currentNode?.nodeSize || 0), selectedNode.toJSON())
      .run();
  }
  function setTextAlign(alignments: string) {
    editor.commands.setTextAlign(alignments);
  }
  function increaseIndent() {
    const indentTr = setNodeIndentMarkup(editor.state.tr, currentNodePos, 1);
    indentTr.setMeta('hideDragHandle', true);
    if (editor.view.dispatch) editor.view.dispatch(indentTr);
  }
  function decreaseIndent() {
    const tr = setNodeIndentMarkup(editor.state.tr, currentNodePos, -1);
    if (editor.view.dispatch) editor.view.dispatch(tr);
  }

  function deleteNode() {
    editor
      .chain()
      .setMeta('hideDragHandle', true)
      .setNodeSelection(currentNodePos)
      .deleteSelection()
      .run();
  }

  const handleNodeChange = useCallback(
    (data: { node: Node | null; editor: Editor; pos: number }) => {
      if (data.node) {
        setCurrentNode(data.node);
      }
      setCurrentNodePos(data.pos);

      const dom = data.pos >= 0 ? data.editor.view.nodeDOM(data.pos) : null;
      // `Node` is the ProseMirror one in this module, so narrow via `Element`.
      const element =
        dom instanceof HTMLElement ? dom : dom instanceof Element ? dom.parentElement : null;

      setHandleOffset(firstLineOffset(element));
      // Nudge the editor so the other bubble menus reposition against the block
      // now under the pointer.
      requestAnimationFrame(() => {
        // This fires on every mouse move onto another block, so it must not
        // take focus. `hasFocus()` is false both when the reader has clicked
        // away from the editor and when a node view's own input holds focus
        // (the image caption), and pulling focus back in either case is wrong.
        if (!data.editor.view.hasFocus()) {
          return;
        }

        // Without `scrollIntoView: false` this scrolls the caret back into
        // view, so hovering a block after scrolling elsewhere yanks the page.
        data.editor.commands.focus(null, { scrollIntoView: false });
      });
    },
    []
  );

  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentNodePos !== -1) {
      const currentNodeSize = currentNode?.nodeSize || 0;
      const insertPos = currentNodePos + currentNodeSize;
      const currentNodeIsEmptyParagraph =
        currentNode?.type.name === 'paragraph' && currentNode?.content?.size === 0;
      const focusPos = currentNodeIsEmptyParagraph ? currentNodePos + 2 : insertPos + 2;
      editor
        .chain()
        .command(({ dispatch, tr, state }) => {
          if (dispatch) {
            if (currentNodeIsEmptyParagraph) {
              tr.insertText('/', currentNodePos, currentNodePos + 1);
            } else {
              tr.insert(
                insertPos,
                state.schema.nodes.paragraph.create(null, [state.schema.text('/')])
              );
            }

            return dispatch(tr);
          }

          return true;
        })
        .focus(focusPos)
        .run();
    }
  };

  useEffect(() => {
    if (menuOpen) {
      editor.commands.setMeta('lockDragHandle', true);
    } else {
      editor.commands.setMeta('lockDragHandle', false);
    }

    return () => {
      editor.commands.setMeta('lockDragHandle', false);
    };
  }, [menuOpen]);

  const handleMenuOpenChange = (open: boolean) => {
    if (!editable) {
      return;
    }
    setMenuOpen(open);
  };

  return (
    <DragHandle
      className='richtext-transition-all richtext-duration-200 richtext-ease-out'
      editor={editor}
      onNodeChange={handleNodeChange}
      pluginKey={'RichTextBubbleMenuDragHandle'}
    >
      <div
        className='richtext-flex richtext-items-center richtext-gap-0.5'
        style={{ transform: `translateY(${handleOffset}px)` }}
      >
        <ActionButton
          action={handleAdd}
          disabled={!editable}
          icon='Plus'
          tooltip={t('editor.draghandle.insertBlock')}
        />

        <ActionButton
          disabled={!editable}
          icon='Grip'
          tooltip={t('editor.draghandle.grip')}
          action={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMenuOpenChange(!menuOpen);
          }}
        />

        <DropdownMenu onOpenChange={handleMenuOpenChange} open={menuOpen}>
          <DropdownMenuTrigger className='richtext-pointer-events-none' />

          <DropdownMenuContent
            align='start'
            className='richtext-w-48'
            hideWhenDetached
            side='bottom'
            sideOffset={0}
          >
            <DropdownMenuItem
              className='richtext-flex richtext-gap-3 richtext-bg-opacity-10 hover:richtext-bg-red-400 hover:richtext-bg-opacity-20 focus:richtext-bg-red-400 focus:richtext-bg-opacity-30 focus:richtext-text-red-500 dark:hover:richtext-bg-opacity-20 dark:hover:richtext-text-red-500'
              onClick={deleteNode}
            >
              <IconComponent name='Trash2' />

              <span>{t('editor.remove')}</span>
            </DropdownMenuItem>

            {hasClearExtension ? (
              <DropdownMenuItem
                className='richtext-flex richtext-gap-3'
                onClick={resetTextFormatting}
              >
                <IconComponent name='PaintRoller' />

                <span>{t('editor.clear.tooltip')}</span>
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem
              className='richtext-flex richtext-gap-3'
              onClick={copyNodeToClipboard}
            >
              <IconComponent name='Clipboard' />

              <span>{t('editor.copyToClipboard')}</span>
            </DropdownMenuItem>

            <DropdownMenuItem className='richtext-flex richtext-gap-3' onClick={duplicateNode}>
              <IconComponent name='Copy' />

              <span>{t('editor.copy')}</span>
            </DropdownMenuItem>

            {columnSelectionPos !== null ? (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className='richtext-flex richtext-gap-3'>
                    <IconComponent name='Columns' />

                    <span>{t('editor.columns.tooltip')}</span>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        className='richtext-flex richtext-gap-3'
                        onClick={() => runColumnCommand('addColBefore')}
                      >
                        <IconComponent name='ColumnAddLeft' />

                        <span>{t('editor.table.menu.insertColumnBefore')}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className='richtext-flex richtext-gap-3'
                        onClick={() => runColumnCommand('addColAfter')}
                      >
                        <IconComponent name='ColumnAddRight' />

                        <span>{t('editor.table.menu.insertColumnAfter')}</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        className='richtext-flex richtext-gap-3'
                        onClick={() => runColumnCommand('deleteCol')}
                      >
                        <IconComponent name='DeleteColumn' />

                        <span>{t('editor.table.menu.deleteColumn')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </>
            ) : null}

            {hasTextAlignExtension || hasIndentExtension ? <DropdownMenuSeparator /> : null}

            {hasTextAlignExtension ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className='richtext-flex richtext-gap-3'>
                  <IconComponent name='AlignCenter' />

                  <span>{t('editor.textalign.tooltip')}</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className='richtext-flex richtext-gap-3'
                      onClick={() => setTextAlign('left')}
                    >
                      <IconComponent name='AlignLeft' />

                      <span>{t('editor.textalign.left.tooltip')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='richtext-flex richtext-gap-3'
                      onClick={() => setTextAlign('center')}
                    >
                      <IconComponent name='AlignCenter' />

                      <span>{t('editor.textalign.center.tooltip')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='richtext-flex richtext-gap-3'
                      onClick={() => setTextAlign('right')}
                    >
                      <IconComponent name='AlignRight' />

                      <span>{t('editor.textalign.right.tooltip')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ) : null}

            {hasIndentExtension ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className='richtext-flex richtext-gap-3'>
                  <IconComponent name='IndentIncrease' />

                  <span>{t('editor.indent')}</span>
                </DropdownMenuSubTrigger>

                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem
                      className='richtext-flex richtext-gap-3'
                      disabled={currentNode?.attrs?.indent >= IndentProps.max}
                      onClick={increaseIndent}
                    >
                      <IconComponent name='IndentIncrease' />

                      <span>{t('editor.indent.tooltip')}</span>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='richtext-flex richtext-gap-3'
                      disabled={currentNode?.attrs?.indent <= IndentProps.min}
                      onClick={decreaseIndent}
                    >
                      <IconComponent name='IndentDecrease' />

                      <span>{t('editor.outdent.tooltip')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </DragHandle>
  );
}
