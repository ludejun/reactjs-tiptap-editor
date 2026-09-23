import { ALargeSmallIcon } from 'lucide-react';
import React, { Fragment, useMemo } from 'react';

import {
  ActionButton,
  ActionMenuButton,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { FontSize } from '@/extensions/FontSize/FontSize';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useLocale } from '@/locales';

import type { ButtonViewReturnComponentProps } from '@/types';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ FontSize: ALargeSmallIcon });

export interface Item {
  title: string;
  isActive: NonNullable<ButtonViewReturnComponentProps['isActive']>;
  action?: ButtonViewReturnComponentProps['action'];
  style?: React.CSSProperties;
  disabled?: boolean;
  divider?: boolean;
  default?: boolean;
}

export interface RichTextFontSizeProps {
  /**
   * Render as an icon button instead of a trigger showing the current size.
   *
   * The wide trigger earns its space in a main toolbar, where reading the
   * current size at a glance is the point. In a menu of named rows it is the
   * one control that does not line up with the rest, so this matches the shape
   * of `RichTextLineHeight`.
   */
  compact?: boolean;
}

export function RichTextFontSize({ compact = false }: RichTextFontSizeProps = {}) {
  const { t } = useLocale();
  const buttonProps = useButtonProps<{
    icon?: string;
    tooltip?: string;
    items?: Item[];
    isActive?: () => Item | boolean;
  }>(FontSize.name);

  const {
    icon = undefined,
    tooltip = undefined,
    items = [],
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { disabled, dataState } = useActive(isActive);

  const title = useMemo(() => {
    return (
      (typeof dataState === 'object' ? dataState?.title : undefined) ||
      t('editor.fontSize.default.tooltip')
    );
  }, [dataState]);

  if (!buttonProps) {
    return <></>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {compact ? (
          <ActionButton
            customClass='!richtext-w-12 richtext-h-12'
            disabled={disabled}
            icon='FontSize'
            tooltip={tooltip}
          >
            <IconComponent
              className='richtext-ml-1 richtext-size-3 richtext-text-zinc-500'
              name='MenuDown'
            />
          </ActionButton>
        ) : (
          <ActionMenuButton disabled={disabled} icon={icon} title={title} tooltip={tooltip} />
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent className='richtext-max-h-96 richtext-w-32 richtext-overflow-y-auto'>
        {items?.map((item, index) => {
          return (
            <Fragment key={`font-size-${index}`}>
              <DropdownMenuCheckboxItem checked={title === item.title} onClick={item.action}>
                <div className='richtext-ml-1 richtext-h-full'>{item.title}</div>
              </DropdownMenuCheckboxItem>

              {item.title === t('editor.fontSize.default.tooltip') && <DropdownMenuSeparator />}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
