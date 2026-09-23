import { ExternalLinkIcon, PencilIcon, UnlinkIcon } from 'lucide-react';
import React from 'react';

import { ActionButton } from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { useLocale } from '@/locales';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ ExternalLink: ExternalLinkIcon, Pencil: PencilIcon, Unlink: UnlinkIcon });

interface IPropsLinkViewBlock {
  editor: import('@tiptap/core').Editor;
  link: string;
  onClear?: () => void;
  onEdit?: () => void;
}

function LinkViewBlock(props: IPropsLinkViewBlock) {
  const { t } = useLocale();

  return (
    <div className='richtext-flex richtext-flex-nowrap'>
      <ActionButton
        disabled={!props?.link}
        icon='ExternalLink'
        tooltip={t('editor.link.open.tooltip')}
        tooltipOptions={{ sideOffset: 15 }}
        action={() => {
          window.open(props?.link, '_blank');
        }}
      />

      <ActionButton
        icon='Pencil'
        tooltip={t('editor.link.edit.tooltip')}
        tooltipOptions={{ sideOffset: 15 }}
        action={() => {
          props?.onEdit?.();
        }}
      />

      <ActionButton
        icon='Unlink'
        tooltip={t('editor.link.unlink.tooltip')}
        tooltipOptions={{ sideOffset: 15 }}
        action={() => {
          props?.onClear?.();
        }}
      />
    </div>
  );
}

export default LinkViewBlock;
