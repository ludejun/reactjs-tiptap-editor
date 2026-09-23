import type { Editor } from '@tiptap/core';

export interface TableOfContentsItem {
  id: string;
  level: number;
  itemIndex: number;
  textContent: string;
  pos: number;
  isActive: boolean;
  isScrolledOver: boolean;
}

/**
 * The headings collected by the `TableOfContents` extension as plain data (no
 * DOM or ProseMirror nodes), so the list is cheap to compare and safe to
 * render anywhere, e.g. in a sidebar outside the editor.
 */
export function readTableOfContents(editor: Editor | null | undefined): TableOfContentsItem[] {
  const content = editor?.storage?.tableOfContents?.content ?? [];

  return content.map((item) => ({
    id: item.id,
    level: item.level,
    itemIndex: item.itemIndex,
    textContent: item.textContent,
    pos: item.pos,
    isActive: item.isActive,
    isScrolledOver: item.isScrolledOver,
  })) as TableOfContentsItem[];
}

/** Walks back through parent headings to produce "1.2.3" style labels. */
export function tableOfContentsIndexLabel(items: TableOfContentsItem[], index: number): string {
  const parts: number[] = [items[index].itemIndex];
  let level = items[index].level;

  for (let i = index - 1; i >= 0 && level > 1; i -= 1) {
    if (items[i].level < level) {
      parts.unshift(items[i].itemIndex);
      level = items[i].level;
    }
  }

  return parts.join('.');
}

/**
 * Move the cursor to a heading and scroll it into view.
 */
export function scrollToTableOfContentsItem(
  editor: Editor,
  item: Pick<TableOfContentsItem, 'pos'>
) {
  const node = editor.state.doc.nodeAt(item.pos);

  if (!node) {
    return;
  }

  editor
    .chain()
    .focus(undefined, { scrollIntoView: false })
    .setTextSelection(item.pos + 1)
    .run();

  const dom = editor.view.nodeDOM(item.pos);

  if (dom instanceof HTMLElement) {
    dom.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
