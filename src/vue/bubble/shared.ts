/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { ref, watch } from 'vue';

import { useEditorInstance, useEditorState } from '../context';

/** The floating card every bubble menu draws its buttons in; same classes as React. */
export const BUBBLE_CLASS =
  'richtext-flex richtext-items-center richtext-gap-2 richtext-rounded-md !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md richtext-outline-none';

/** Floating UI options shared by the bubble menus. */
export const BUBBLE_OPTIONS = { placement: 'bottom', offset: 8, flip: true } as const;

/**
 * The provided editor, whether it is editable, and a key that changes with
 * the editor instance. `BubbleMenu` registers its plugin on mount with the
 * editor it is given, so the menu is re-keyed when the editor is replaced.
 */
export function useBubbleEditor() {
  const editor = useEditorInstance();
  const editable = useEditorState((current) => current.isEditable, false);
  const key = ref(0);

  watch(editor, () => {
    key.value += 1;
  });

  return { editor, editable, key };
}
