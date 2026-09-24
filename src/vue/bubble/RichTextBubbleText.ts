/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { AllSelection, TextSelection } from '@tiptap/pm/state';
import { BubbleMenu } from '@tiptap/vue-3/menus';
import { defineComponent, h, watch } from 'vue';

import { aiPluginKey } from '@/extensions/AI/state';

import { RichTextAIImprove } from '../ai';
import { useEditorState } from '../context';
import {
  RichTextBold,
  RichTextCode,
  RichTextColor,
  RichTextHeading,
  RichTextHighlight,
  RichTextItalic,
  RichTextLink,
  RichTextStrike,
  RichTextTextAlign,
  RichTextUnderline,
} from '../controls';
import { RichTextToolbarDivider } from '../ui';

import { BUBBLE_CLASS, BUBBLE_OPTIONS, useBubbleEditor } from './shared';

import type { Editor } from '@tiptap/core';

const PLUGIN_KEY = 'RichTextBubbleText';

/**
 * The formatting menu over a text selection: AI improve, block type, inline
 * marks, link, colour, highlight and alignment. Put your own buttons in the
 * default slot to replace them. Hidden inside code blocks and while an AI
 * panel is open on the selection.
 */
export const RichTextBubbleText = defineComponent({
  name: 'RichTextBubbleText',
  setup(_, { slots }) {
    const { editor, editable, key } = useBubbleEditor();
    const aiOpen = useEditorState(
      (current) => !!aiPluginKey.getState(current.state)?.session,
      false
    );

    // Opening the AI panel changes neither the selection nor the document, so
    // the bubble plugin would not re-run `shouldShow`; hide it explicitly.
    watch(aiOpen, (open) => {
      const current = editor.value;
      if (open && current && !current.isDestroyed)
        current.view.dispatch(current.state.tr.setMeta(PLUGIN_KEY, 'hide'));
    });

    const shouldShow = ({ editor: current }: { editor: Editor }) => {
      if (aiPluginKey.getState(current.state)?.session) return false;
      // Editing a link selects it; the link card is the one menu wanted then.
      if (current.storage.link?.editing) return false;
      const { selection } = current.view.state;
      const { $from, to } = selection;

      // Code blocks have their own affordances.
      if (current.isActive('codeBlock')) return false;
      // Nothing selected, nothing to format.
      if ($from.pos === to) return false;
      // Select All produces an AllSelection, which deserves the same menu.
      return selection instanceof TextSelection || selection instanceof AllSelection;
    };

    return () =>
      editor.value && editable.value
        ? h(
            BubbleMenu,
            {
              key: key.value,
              editor: editor.value,
              pluginKey: PLUGIN_KEY,
              shouldShow,
              options: { ...BUBBLE_OPTIONS },
            },
            () => [
              h(
                'div',
                { class: BUBBLE_CLASS },
                slots.default
                  ? slots.default()
                  : [
                      h(RichTextAIImprove),
                      h(RichTextHeading),
                      h(RichTextToolbarDivider),
                      h(RichTextBold),
                      h(RichTextItalic),
                      h(RichTextUnderline),
                      h(RichTextStrike),
                      h(RichTextCode),
                      h(RichTextLink),
                      h(RichTextToolbarDivider),
                      h(RichTextColor),
                      h(RichTextHighlight),
                      h(RichTextTextAlign),
                    ]
              ),
            ]
          )
        : null;
  },
});
