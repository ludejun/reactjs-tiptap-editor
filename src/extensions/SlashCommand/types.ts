import type { Editor, Range } from '@tiptap/core';

export interface CommandList {
  name: string;
  title: string;
  commands: Command[];
}

export interface Command {
  name: string;
  label: string;
  description?: string;
  aliases?: string[];
  iconName?: string;
  iconUrl?: string;
  action: ({ editor, range }: { editor: Editor; range: Range }) => void;
  shouldBeHidden?: (editor: Editor) => boolean;
  /**
   * Keep the command out of the menu until the reader types something that
   * matches it. For entries that would otherwise push common blocks below the
   * fold — deep headings, say — without making them unreachable.
   */
  hiddenUntilSearched?: boolean;
  isActive?: (editor: Editor) => boolean;
}
