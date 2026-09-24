import { Node, findParentNode, mergeAttributes } from '@tiptap/core';

import type { ButtonViewParams, GeneralOptions } from '@/types';

/** The built-in notice kinds and the colour each one is painted with. */
export const NOTICE_TYPES = [
  { value: 'info', color: '#1f6feb' },
  { value: 'success', color: '#1a7f37' },
  { value: 'warning', color: '#bf8700' },
  { value: 'tip', color: '#8250df' },
] as const;

export type NoticeType = (typeof NOTICE_TYPES)[number]['value'];

export const DEFAULT_NOTICE_TYPE: NoticeType = 'info';

/** `type`, falling back to `info` for anything the list does not know. */
export function getNoticeType(type: string | null | undefined): NoticeType {
  return NOTICE_TYPES.some((item) => item.value === type)
    ? (type as NoticeType)
    : DEFAULT_NOTICE_TYPE;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    notice: {
      /** Wrap the selected blocks in a notice (or turn the current paragraph into one). */
      setNotice: (type?: NoticeType) => ReturnType;
      /** Same type again removes the notice; another type changes it; nothing yet wraps. */
      toggleNotice: (type?: NoticeType) => ReturnType;
      /** Change the type of the notice around the selection. */
      updateNotice: (type: NoticeType) => ReturnType;
      /** Lift the blocks out of the notice around the selection. */
      unsetNotice: () => ReturnType;
    };
  }
}

export interface NoticeOptions extends GeneralOptions<NoticeOptions> {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * A coloured box with an icon, holding ordinary editable blocks: the "Info /
 * Success / Warning / Tip notice" of most document editors. Everything is
 * rendered by `renderHTML` and the stylesheet, so the saved HTML shows the
 * same box anywhere the stylesheet is loaded and no node view is needed.
 *
 * Saved as `<div class="notice" data-type="warning">…blocks…</div>`.
 */
export const Notice = /* @__PURE__ */ Node.create<NoticeOptions>({
  name: 'notice',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'notice',
      },
      button: ({ editor, t }: ButtonViewParams<NoticeOptions>) => ({
        componentProps: {
          items: NOTICE_TYPES.map(({ value }) => ({
            type: value,
            title: t(`editor.notice.${value}`),
            action: () => editor.chain().focus().toggleNotice(value).run(),
            isActive: () => editor.isActive('notice', { type: value }),
          })),
          isActive: () => editor.isActive('notice'),
          disabled: !editor.can().setNotice(),
          icon: 'Notice',
          tooltip: t('editor.notice.tooltip'),
        },
      }),
    };
  },

  addAttributes() {
    return {
      type: {
        default: DEFAULT_NOTICE_TYPE,
        parseHTML: (element) => getNoticeType(element.getAttribute('data-type')),
        renderHTML: (attributes) => ({ 'data-type': getNoticeType(attributes.type) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div.notice' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      setNotice:
        (type = DEFAULT_NOTICE_TYPE) =>
        ({ commands }) =>
          commands.wrapIn(this.name, { type }),
      toggleNotice:
        (type = DEFAULT_NOTICE_TYPE) =>
        ({ editor, commands }) => {
          if (!editor.isActive(this.name)) return commands.wrapIn(this.name, { type });
          if (editor.isActive(this.name, { type })) return commands.lift(this.name);

          return commands.updateAttributes(this.name, { type });
        },
      updateNotice:
        (type) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { type }),
      unsetNotice:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter on an empty last line leaves the box, the way lists end.
      Enter: ({ editor }) => {
        const { selection } = editor.state;
        const { $from, empty } = selection;

        if (!empty) return false;

        const notice = findParentNode((node) => node.type.name === this.name)(selection);

        if (!notice || $from.depth !== notice.depth + 1 || $from.parent.content.size > 0) {
          return false;
        }

        if ($from.index(notice.depth) !== notice.node.childCount - 1) return false;

        return editor.commands.lift(this.name);
      },
    };
  },
});
