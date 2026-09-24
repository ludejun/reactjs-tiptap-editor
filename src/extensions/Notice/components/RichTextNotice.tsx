import {
  CircleCheckIcon,
  InfoIcon,
  MegaphoneIcon,
  StarIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import React from 'react';

import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { Notice, type NoticeType } from '@/extensions/Notice/Notice';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

import type { ButtonViewReturnComponentProps } from '@/types';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({
  Notice: MegaphoneIcon,
  NoticeInfo: InfoIcon,
  NoticeSuccess: CircleCheckIcon,
  NoticeWarning: TriangleAlertIcon,
  // A star, like the icon painted in the box itself.
  NoticeTip: StarIcon,
});

/** Icon name, colour and a text-colour class per notice type, shared with the bubble menu.
 *  The classes are spelled out so Tailwind generates them. */
export const NOTICE_ICONS: Record<NoticeType, { icon: string; color: string; className: string }> =
  {
    info: { icon: 'NoticeInfo', color: '#1f6feb', className: '!richtext-text-[#1f6feb]' },
    success: { icon: 'NoticeSuccess', color: '#1a7f37', className: '!richtext-text-[#1a7f37]' },
    warning: { icon: 'NoticeWarning', color: '#bf8700', className: '!richtext-text-[#bf8700]' },
    tip: { icon: 'NoticeTip', color: '#8250df', className: '!richtext-text-[#8250df]' },
  };

export interface NoticeItem {
  type: NoticeType;
  title: string;
  action?: ButtonViewReturnComponentProps['action'];
  isActive: () => boolean;
}

/** A dropdown of the notice types; picking one wraps the selection or retypes the notice. */
export function RichTextNotice() {
  const buttonProps = useButtonProps<{
    icon?: string;
    tooltip?: string;
    items?: NoticeItem[];
    isActive?: () => boolean;
  }>(Notice.name);

  const {
    icon = undefined,
    tooltip = undefined,
    items = [],
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { dataState, editorDisabled } = useActive(isActive);

  if (!buttonProps) {
    return <></>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={editorDisabled}>
        <ActionButton
          customClass='!richtext-w-12 richtext-h-12'
          disabled={editorDisabled}
          icon={icon}
          isActive={() => dataState === false}
          tooltip={tooltip}
        >
          <IconComponent
            className='richtext-ml-1 richtext-size-3 richtext-text-zinc-500'
            name='MenuDown'
          />
        </ActionButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='start' className='richtext-min-w-36'>
        {items.map((item) => {
          const look = NOTICE_ICONS[item.type];

          return (
            <DropdownMenuItem
              className='richtext-flex richtext-items-center richtext-gap-2'
              key={item.type}
              onClick={item.action}
            >
              <span className='richtext-flex' style={{ color: look.color }}>
                <IconComponent className='richtext-size-4' name={look.icon} />
              </span>
              <span>{item.title}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
