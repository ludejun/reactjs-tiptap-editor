import { findParentNode } from '@tiptap/core';
import { BubbleMenu } from '@tiptap/react/menus';
import { Trash2Icon } from 'lucide-react';
import { useCallback } from 'react';

import { ActionButton } from '@/components/ActionButton';
import { registerIcons } from '@/components/icons/icons';
import { RichTextToolbarDivider } from '@/components/Toolbar/RichTextToolbar';
import { NOTICE_ICONS } from '@/extensions/Notice/components/RichTextNotice';
import { NOTICE_TYPES, Notice } from '@/extensions/Notice/Notice';
import { useActive } from '@/hooks/useActive';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { useEditableEditor } from '@/store/store';

import type { Editor } from '@tiptap/core';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ Trash2: Trash2Icon });

const PLUGIN_KEY = 'RichTextBubbleNotice';

/** Shown above the notice the caret is in: switch its type, or dissolve it. */
export function RichTextBubbleNotice() {
  const editable = useEditableEditor();
  const editor = useEditorInstance();
  const { t } = useLocale();
  const { dataState: current } = useActive<string>(() =>
    editor.isActive(Notice.name) ? String(editor.getAttributes(Notice.name).type ?? 'info') : ''
  );

  const shouldShow = useCallback(
    ({ editor: e }: { editor: Editor }) => e.isActive(Notice.name),
    []
  );

  // Anchor to the whole box, not the caret, so the menu keeps still while typing.
  const getReferencedVirtualElement = useCallback(() => {
    const parent = findParentNode((node) => node.type.name === Notice.name)(editor.state.selection);
    const dom = parent ? editor.view.nodeDOM(parent.pos) : null;

    if (!(dom instanceof HTMLElement)) return null;

    return { getBoundingClientRect: () => dom.getBoundingClientRect() };
  }, [editor]);

  if (!editable) {
    return <></>;
  }

  return (
    <BubbleMenu
      className='richtext-z-20'
      editor={editor}
      getReferencedVirtualElement={getReferencedVirtualElement}
      options={{ placement: 'top-start', offset: 8, flip: true }}
      pluginKey={PLUGIN_KEY}
      shouldShow={shouldShow}
    >
      <div className='richtext-flex richtext-items-center richtext-gap-1 richtext-rounded-md !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md richtext-outline-none'>
        {NOTICE_TYPES.map(({ value }) => (
          <ActionButton
            action={() => editor.chain().focus().updateNotice(value).run()}
            customClass={NOTICE_ICONS[value].className}
            icon={NOTICE_ICONS[value].icon}
            isActive={() => current === value}
            key={value}
            tooltip={t(`editor.notice.${value}`)}
          />
        ))}

        <RichTextToolbarDivider />

        <ActionButton
          action={() => editor.chain().focus().unsetNotice().run()}
          icon='Trash2'
          tooltip={t('editor.notice.remove')}
        />
      </div>
    </BubbleMenu>
  );
}
