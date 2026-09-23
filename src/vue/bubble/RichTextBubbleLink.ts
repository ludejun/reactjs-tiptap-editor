/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { BubbleMenu } from '@tiptap/vue-3/menus';
import { ExternalLink, Pencil, Unlink } from 'lucide-vue-next';
import { defineComponent, h, nextTick, ref, watch } from 'vue';

import { useEditorState, useLocale } from '../context';
import { RichTextLinkForm } from '../controls';
import { RichTextToolbarButton } from '../ui';

import { BUBBLE_CLASS, BUBBLE_OPTIONS, useBubbleEditor } from './shared';

import type { Editor } from '@tiptap/core';

const PLUGIN_KEY = 'RichTextBubbleLink';

/**
 * Shown while the caret is inside a link: the address, open it, edit it
 * (text, address, new tab), or remove the link.
 */
export const RichTextBubbleLink = defineComponent({
  name: 'RichTextBubbleLink',
  setup() {
    const { t } = useLocale();
    const { editor, editable, key } = useBubbleEditor();
    const editing = ref(false);
    const link = useEditorState(
      (current) => ({
        active: current.isActive('link'),
        href: (current.getAttributes('link').href as string | undefined) ?? '',
      }),
      { active: false, href: '' }
    );

    watch(
      () => link.value.active,
      (active) => {
        if (!active) editing.value = false;
      }
    );
    // Switching between the view and the edit card changes the menu's size;
    // the plugin only repositions on editor changes, so ask it to.
    watch(editing, () => {
      void nextTick(() => {
        const current = editor.value;
        if (current && !current.isDestroyed)
          current.view.dispatch(current.state.tr.setMeta(PLUGIN_KEY, 'updatePosition'));
      });
    });

    const shouldShow = ({ editor: current }: { editor: Editor }) => current.isActive('link');

    return () => {
      const current = editor.value;
      if (!current || !editable.value) return null;
      const href = link.value.href;

      return h(
        BubbleMenu,
        {
          key: key.value,
          editor: current,
          pluginKey: PLUGIN_KEY,
          shouldShow,
          options: { ...BUBBLE_OPTIONS },
        },
        () => [
          editing.value
            ? h('div', { class: `${BUBBLE_CLASS} !richtext-p-4 richtext-w-72` }, [
                h(RichTextLinkForm, {
                  editor: current,
                  onDone: () => {
                    editing.value = false;
                  },
                  onCancel: () => {
                    editing.value = false;
                    current.commands.focus();
                  },
                }),
              ])
            : h('div', { class: BUBBLE_CLASS }, [
                h(
                  'a',
                  {
                    href,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    title: href,
                    class:
                      'richtext-max-w-60 richtext-truncate richtext-px-2 richtext-text-sm richtext-text-foreground richtext-underline',
                  },
                  href
                ),
                h(RichTextToolbarButton, {
                  icon: ExternalLink,
                  tooltip: t('editor.link.open.tooltip'),
                  onClick: () => window.open(href, '_blank', 'noopener,noreferrer'),
                }),
                h(RichTextToolbarButton, {
                  icon: Pencil,
                  tooltip: t('editor.link.edit.tooltip'),
                  onClick: () => {
                    // Select the whole link so the form reads and replaces all of it.
                    current.chain().extendMarkRange('link').run();
                    editing.value = true;
                  },
                }),
                h(RichTextToolbarButton, {
                  icon: Unlink,
                  tooltip: t('editor.link.unlink.tooltip'),
                  onClick: () => current.chain().focus().extendMarkRange('link').unsetLink().run(),
                }),
              ]),
        ]
      );
    };
  },
});
