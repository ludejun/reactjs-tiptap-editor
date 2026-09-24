import type { Editor, Range } from '@tiptap/core';

export interface CommandList {
  name: string;
  title: string;
  commands: Command[];
}

/** One choice of a command that offers several, drawn as a small icon at the right of its row. */
export interface CommandVariant {
  value: string;
  label: string;
  iconName: string;
  iconColor?: string;
  /** Search words that pick this variant, on top of the command's own aliases. */
  aliases?: string[];
}

export interface Command {
  name: string;
  label: string;
  description?: string;
  aliases?: string[];
  iconName?: string;
  /** CSS colour for `iconName`; the notice entries use their box colour. */
  iconColor?: string;
  iconUrl?: string;
  action: ({ editor, range, variant }: { editor: Editor; range: Range; variant?: string }) => void;
  /**
   * Choices shown as icons at the right of the row (the notice types, say):
   * ←/→ moves between them, Enter or a click inserts the chosen one. Keeps the
   * list one row high instead of one row per choice.
   */
  variants?: CommandVariant[];
  shouldBeHidden?: (editor: Editor) => boolean;
  /**
   * Keep the command out of the menu until the reader types something that
   * matches it. For entries that would otherwise push common blocks below the
   * fold — deep headings, say — without making them unreachable.
   */
  hiddenUntilSearched?: boolean;
  /**
   * Markdown that produces the same block when typed at the start of a line
   * (`#` for a heading, `-` for a list). Shown as a hint next to the entry.
   */
  shortcut?: string;
  isActive?: (editor: Editor) => boolean;
}
