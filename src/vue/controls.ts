/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Eraser,
  Heading as HeadingIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Redo2,
  SeparatorHorizontal,
  Strikethrough,
  Table as TableIcon,
  TextQuote,
  Underline,
  Undo2,
} from 'lucide-vue-next';
import { defineComponent, h, type Component } from 'vue';

import { DIVIDER_VARIANTS } from '@/extensions/Divider/Divider';

import { useEditorInstance, useEditorState, useLocale } from './context';
import { RichTextDropdown, RichTextToolbarButton, type DropdownItem } from './ui';

import type { DividerVariantOption } from '@/extensions/Divider/Divider';
import type { Editor } from '@tiptap/core';

/**
 * Ready-made controls for the core extensions. Each one reads state from the
 * provided editor and runs the same command the React control runs, so the
 * two toolbars behave identically.
 */

function control(
  name: string,
  options: {
    icon: Component;
    tooltip: string;
    isActive?: (editor: Editor) => boolean;
    canRun?: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
  }
) {
  return defineComponent({
    name,
    setup() {
      const editor = useEditorInstance();
      const { t } = useLocale();
      const state = useEditorState(
        (current) => ({
          active: options.isActive?.(current) ?? false,
          enabled: current.isEditable && (options.canRun?.(current) ?? true),
        }),
        { active: false, enabled: false }
      );

      return () =>
        h(RichTextToolbarButton, {
          icon: options.icon,
          tooltip: t(options.tooltip),
          active: state.value.active,
          disabled: !state.value.enabled,
          onClick: () => editor.value && options.run(editor.value),
        });
    },
  });
}

export const RichTextUndo = control('RichTextUndo', {
  icon: Undo2,
  tooltip: 'editor.undo.tooltip',
  canRun: (e) => e.can().undo(),
  run: (e) => e.chain().focus().undo().run(),
});
export const RichTextRedo = control('RichTextRedo', {
  icon: Redo2,
  tooltip: 'editor.redo.tooltip',
  canRun: (e) => e.can().redo(),
  run: (e) => e.chain().focus().redo().run(),
});
export const RichTextBold = control('RichTextBold', {
  icon: Bold,
  tooltip: 'editor.bold.tooltip',
  isActive: (e) => e.isActive('bold'),
  run: (e) => e.chain().focus().toggleBold().run(),
});
export const RichTextItalic = control('RichTextItalic', {
  icon: Italic,
  tooltip: 'editor.italic.tooltip',
  isActive: (e) => e.isActive('italic'),
  run: (e) => e.chain().focus().toggleItalic().run(),
});
export const RichTextUnderline = control('RichTextUnderline', {
  icon: Underline,
  tooltip: 'editor.underline.tooltip',
  isActive: (e) => e.isActive('underline'),
  run: (e) => e.chain().focus().toggleUnderline().run(),
});
export const RichTextStrike = control('RichTextStrike', {
  icon: Strikethrough,
  tooltip: 'editor.strike.tooltip',
  isActive: (e) => e.isActive('strike'),
  run: (e) => e.chain().focus().toggleStrike().run(),
});
export const RichTextCode = control('RichTextCode', {
  icon: Code,
  tooltip: 'editor.code.tooltip',
  isActive: (e) => e.isActive('code'),
  run: (e) => e.chain().focus().toggleCode().run(),
});
export const RichTextClear = control('RichTextClear', {
  icon: Eraser,
  tooltip: 'editor.clear.tooltip',
  run: (e) => e.chain().focus().clearNodes().unsetAllMarks().run(),
});
export const RichTextBlockquote = control('RichTextBlockquote', {
  icon: TextQuote,
  tooltip: 'editor.blockquote.tooltip',
  isActive: (e) => e.isActive('blockquote'),
  run: (e) => e.chain().focus().toggleBlockquote().run(),
});
export const RichTextBulletList = control('RichTextBulletList', {
  icon: List,
  tooltip: 'editor.bulletlist.tooltip',
  isActive: (e) => e.isActive('bulletList'),
  run: (e) => e.chain().focus().toggleBulletList().run(),
});
export const RichTextOrderedList = control('RichTextOrderedList', {
  icon: ListOrdered,
  tooltip: 'editor.orderedlist.tooltip',
  isActive: (e) => e.isActive('orderedList'),
  run: (e) => e.chain().focus().toggleOrderedList().run(),
});
export const RichTextTaskList = control('RichTextTaskList', {
  icon: ListTodo,
  tooltip: 'editor.tasklist.tooltip',
  isActive: (e) => e.isActive('taskList'),
  run: (e) => e.chain().focus().toggleTaskList().run(),
});
export const RichTextTable = control('RichTextTable', {
  icon: TableIcon,
  tooltip: 'editor.table.tooltip',
  isActive: (e) => e.isActive('table'),
  canRun: (e) => e.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
  run: (e) => e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
});

/** Asks for a URL with the browser prompt; a dialog is the host's to add. */
export const RichTextLink = control('RichTextLink', {
  icon: LinkIcon,
  tooltip: 'editor.link.tooltip',
  isActive: (e) => e.isActive('link'),
  run: (e) => {
    if (e.isActive('link')) {
      e.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    const href = window.prompt('URL', 'https://');

    if (href && href !== 'https://') {
      e.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
  },
});

/** Paragraph and the heading levels the Heading extension is configured with. */
export const RichTextHeading = defineComponent({
  name: 'RichTextHeading',
  setup() {
    const editor = useEditorInstance();
    const { t } = useLocale();
    const state = useEditorState(
      (current) => {
        const levels = (current.extensionManager.extensions.find((ext) => ext.name === 'heading')
          ?.options?.levels ?? [1, 2, 3]) as number[];
        const active = levels.find((level) => current.isActive('heading', { level }));

        return { levels, active: active ?? 0, enabled: current.isEditable };
      },
      { levels: [1, 2, 3], active: 0, enabled: false }
    );

    return () => {
      const items: DropdownItem[] = [
        { value: '0', label: t('editor.paragraph.tooltip'), active: state.value.active === 0 },
        ...state.value.levels.map((level) => ({
          value: String(level),
          label: t(`editor.heading.h${level}.tooltip`),
          active: state.value.active === level,
          render: () =>
            h(
              'span',
              { class: 'richtext-w-6 richtext-text-xs richtext-text-muted-foreground' },
              `H${level}`
            ),
        })),
      ];
      const current = items.find((item) => item.active) ?? items[0];

      return h(RichTextDropdown, {
        icon: HeadingIcon,
        label: current.label,
        tooltip: t('editor.heading.tooltip'),
        items,
        disabled: !state.value.enabled,
        onSelect: (value: string) => {
          const level = Number(value);

          if (!editor.value) return;
          if (level === 0) editor.value.chain().focus().setParagraph().run();
          else
            editor.value
              .chain()
              .focus()
              .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
              .run();
        },
      });
    };
  },
});

const ALIGNMENTS = [
  { value: 'left', icon: AlignLeft, key: 'editor.textalign.left.tooltip' },
  { value: 'center', icon: AlignCenter, key: 'editor.textalign.center.tooltip' },
  { value: 'right', icon: AlignRight, key: 'editor.textalign.right.tooltip' },
  { value: 'justify', icon: AlignJustify, key: 'editor.textalign.justify.tooltip' },
];

export const RichTextTextAlign = defineComponent({
  name: 'RichTextTextAlign',
  setup() {
    const editor = useEditorInstance();
    const { t } = useLocale();
    const state = useEditorState(
      (current) => ({
        active: ALIGNMENTS.find((a) => current.isActive({ textAlign: a.value }))?.value ?? 'left',
        enabled: current.isEditable,
      }),
      { active: 'left', enabled: false }
    );

    return () =>
      h(RichTextDropdown, {
        icon: ALIGNMENTS.find((a) => a.value === state.value.active)?.icon ?? AlignLeft,
        tooltip: t('editor.textalign.tooltip'),
        width: '9rem',
        disabled: !state.value.enabled,
        items: ALIGNMENTS.map((a) => ({
          value: a.value,
          label: t(a.key),
          active: state.value.active === a.value,
          render: () => h(a.icon, { size: 14, class: 'richtext-text-muted-foreground' }),
        })),
        onSelect: (value: string) => editor.value?.chain().focus().setTextAlign(value).run(),
      });
  },
});

/** The divider styles the Divider extension is configured with, previewed. */
export const RichTextDivider = defineComponent({
  name: 'RichTextDivider',
  setup() {
    const editor = useEditorInstance();
    const { t } = useLocale();
    const state = useEditorState(
      (current) => {
        const extension = current.extensionManager.extensions.find((ext) => ext.name === 'divider');
        const variants = (extension?.options?.variants as DividerVariantOption[] | undefined) ?? [];

        return { variants, enabled: current.isEditable && !!extension };
      },
      { variants: DIVIDER_VARIANTS.map((value) => ({ value })), enabled: false }
    );

    return () =>
      h(RichTextDropdown, {
        icon: SeparatorHorizontal,
        tooltip: t('editor.divider.tooltip'),
        width: '14rem',
        disabled: !state.value.enabled,
        items: state.value.variants.map((variant) => {
          const key = `editor.divider.variant.${variant.value}`;
          const label = variant.label ?? (t(key) === key ? String(variant.value) : t(key));

          return {
            value: String(variant.value),
            label,
            render: () =>
              h(
                'span',
                {
                  'aria-hidden': 'true',
                  class: `divider divider-preview divider--${variant.value} richtext-w-16 richtext-shrink-0`,
                },
                [
                  h('hr'),
                  variant.editable || variant.value === 'number'
                    ? [
                        h(
                          'span',
                          { class: 'divider__label' },
                          variant.value === 'number' ? '1' : 'Aa'
                        ),
                        h('hr'),
                      ]
                    : null,
                ]
              ),
          };
        }),
        onSelect: (value: string) =>
          editor.value?.chain().focus().setDivider({ variant: value }).run(),
      });
  },
});
