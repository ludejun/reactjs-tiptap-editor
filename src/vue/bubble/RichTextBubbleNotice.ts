/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { findParentNode } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/vue-3/menus';
import { Trash2 } from 'lucide-vue-next';
import { defineComponent, h } from 'vue';

import { NOTICE_TYPES } from '@/extensions/Notice/Notice';

import { useEditorState, useLocale } from '../context';
import { NOTICE_ICONS } from '../controls';
import { RichTextToolbarButton, RichTextToolbarDivider } from '../ui';

import { BUBBLE_CLASS, useBubbleEditor } from './shared';

import type { Editor } from '@tiptap/core';

const PLUGIN_KEY = 'RichTextBubbleNotice';

/** Shown above the notice the caret is in: switch its type, or dissolve it. */
export const RichTextBubbleNotice = defineComponent({
  name: 'RichTextBubbleNotice',
  setup() {
    const { t } = useLocale();
    const { editor, editable, key } = useBubbleEditor();
    const current = useEditorState(
      (e) => (e.isActive('notice') ? String(e.getAttributes('notice').type ?? 'info') : ''),
      ''
    );

    const shouldShow = ({ editor: e }: { editor: Editor }) => e.isActive('notice');

    return () => {
      const e = editor.value;
      if (!e || !editable.value) return null;

      // Anchor to the whole box, not the caret, so the menu keeps still while typing.
      const getReferencedVirtualElement = () => {
        const parent = findParentNode((node) => node.type.name === 'notice')(e.state.selection);
        const dom = parent ? e.view.nodeDOM(parent.pos) : null;
        if (!(dom instanceof HTMLElement)) return null;
        return { getBoundingClientRect: () => dom.getBoundingClientRect() };
      };

      return h(
        BubbleMenu,
        {
          key: key.value,
          editor: e,
          pluginKey: PLUGIN_KEY,
          shouldShow,
          getReferencedVirtualElement,
          options: { placement: 'top-start', offset: 8, flip: true },
        },
        () => [
          h('div', { class: BUBBLE_CLASS }, [
            ...NOTICE_TYPES.map(({ value }) =>
              h(RichTextToolbarButton, {
                key: value,
                icon: NOTICE_ICONS[value].icon,
                tooltip: t(`editor.notice.${value}`),
                active: current.value === value,
                onClick: () => e.chain().focus().updateNotice(value).run(),
              })
            ),
            h(RichTextToolbarDivider),
            h(RichTextToolbarButton, {
              icon: Trash2,
              tooltip: t('editor.notice.remove'),
              onClick: () => e.chain().focus().unsetNotice().run(),
            }),
          ]),
        ]
      );
    };
  },
});
