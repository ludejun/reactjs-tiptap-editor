interface Item {
  value: string;
  label: string;
  action: () => void;
}
import { Fragment } from 'react';

import {
  ActionButton,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { FormatLineHeight as FormatLineHeightIcon } from '@/components/icons/LineHeight';
import { LineHeight } from '@/extensions/LineHeight/LineHeight';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ LineHeight: FormatLineHeightIcon });

export function RichTextLineHeight() {
  const buttonProps = useButtonProps<{
    icon?: string;
    tooltip?: string;
    items?: Item[];
    isActive?: () => Item | boolean;
  }>(LineHeight.name);

  const {
    tooltip = undefined,
    items,
    icon,
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { editorDisabled, dataState } = useActive(isActive);

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
          tooltip={tooltip}
        >
          <IconComponent
            className='richtext-ml-1 richtext-size-3 richtext-text-zinc-500'
            name='MenuDown'
          />
        </ActionButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='richtext-min-w-24'>
        {items?.map((item, index) => {
          return (
            <Fragment key={`line-height-${index}`}>
              <DropdownMenuCheckboxItem
                checked={
                  item.value === (typeof dataState === 'object' ? dataState?.value : undefined)
                }
                onClick={() => item?.action()}
              >
                {item.label}
              </DropdownMenuCheckboxItem>

              {item.value === 'Default' && <DropdownMenuSeparator />}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
