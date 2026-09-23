import {
  ActionButton,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconComponent,
} from '@/components';
import { variantLabel } from '@/extensions/Divider/components/NodeViewDivider';
import { DividerCore as Divider } from '@/extensions/Divider/Divider';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useLocale } from '@/locales';

import type { DividerVariant, DividerVariantOption } from '@/extensions/Divider/Divider';

/** Toolbar control: a menu of divider styles, each with a live preview. */
export function RichTextDivider() {
  const { t } = useLocale();
  const buttonProps = useButtonProps<{
    icon?: string;
    tooltip?: string;
    shortcutKeys?: string[];
    disabled?: boolean;
    variants?: DividerVariantOption[];
    action?: (variant?: DividerVariant) => void;
  }>(Divider.name);
  const { icon, tooltip, shortcutKeys, variants = [], action } = buttonProps?.componentProps ?? {};
  const { editorDisabled } = useActive(undefined);

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
          shortcutKeys={shortcutKeys}
          tooltip={tooltip}
        >
          <IconComponent
            className='richtext-ml-1 richtext-size-3 richtext-text-zinc-500'
            name='MenuDown'
          />
        </ActionButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='richtext-w-56'>
        {variants.map((item) => (
          <DropdownMenuItem
            className='richtext-flex richtext-items-center richtext-gap-3'
            key={item.value}
            onClick={() => action?.(item.value)}
          >
            <span
              aria-hidden
              className={`divider divider-preview divider--${item.value} richtext-w-16 richtext-shrink-0`}
            >
              <hr />
              {item.editable || item.value === 'number' ? (
                <>
                  <span className='divider__label'>{item.value === 'number' ? '1' : 'Aa'}</span>
                  <hr />
                </>
              ) : null}
            </span>
            <span className='richtext-truncate'>{variantLabel(item, t)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
