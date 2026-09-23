import { LinkIcon } from 'lucide-react';
import { useState } from 'react';

import { ActionButton, IconComponent, Popover, PopoverContent, PopoverTrigger } from '@/components';
import { registerIcons } from '@/components/icons/icons';
import LinkEditBlock from '@/extensions/Link/components/LinkEditBlock';
import { Link } from '@/extensions/Link/Link';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useEditorInstance } from '@/store/editor';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ Link: LinkIcon });

export function RichTextLink() {
  const [open, setOpen] = useState(false);
  const editor = useEditorInstance();
  const buttonProps = useButtonProps(Link.name);

  const { isActive, icon, tooltip, target, action } = buttonProps?.componentProps ?? {};

  const { dataState, editorDisabled, update } = useToggleActive(isActive);

  function onSetLink(link: string, text?: string, openInNewTab?: boolean) {
    if (editorDisabled) return;

    if (action) {
      action({ link, text, openInNewTab });
      setOpen(false);
      update();
    }
  }

  if (!buttonProps) {
    return <></>;
  }

  return (
    <Popover modal onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        asChild
        data-state={dataState ? 'on' : 'off'} // active background control
        disabled={editorDisabled}
      >
        <ActionButton dataState={dataState} disabled={editorDisabled} tooltip={tooltip}>
          <IconComponent name={icon ?? ''} />
        </ActionButton>
      </PopoverTrigger>

      <PopoverContent align='start' className='richtext-w-full' hideWhenDetached side='bottom'>
        <LinkEditBlock editor={editor} onSetLink={onSetLink} open={open} target={target} />
      </PopoverContent>
    </Popover>
  );
}
