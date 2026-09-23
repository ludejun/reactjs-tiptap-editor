import { useEditorState } from '@tiptap/react';

import { readTableOfContents } from '@/extensions/TableOfContents/toc';

import type { TableOfContentsItem } from '@/extensions/TableOfContents/toc';
import type { Editor } from '@tiptap/core';

export { scrollToTableOfContentsItem } from '@/extensions/TableOfContents/toc';
export type { TableOfContentsItem } from '@/extensions/TableOfContents/toc';

/**
 * Reactive list of headings collected by the `TableOfContents` extension.
 * Returns plain data (no DOM or ProseMirror nodes) so it is cheap to compare
 * and safe to render anywhere, e.g. in a sidebar outside the editor.
 */
export function useTableOfContents(editor: Editor | null): TableOfContentsItem[] {
  return (
    useEditorState({
      editor,
      selector: ({ editor: instance }) => readTableOfContents(instance),
    }) ?? []
  );
}
