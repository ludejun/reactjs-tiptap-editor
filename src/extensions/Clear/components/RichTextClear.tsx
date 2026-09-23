import { EraserIcon } from 'lucide-react';

import { ActionButton } from '@/components/ActionButton';
import { registerIcons } from '@/components/icons/icons';
import { Clear } from '@/extensions/Clear/Clear';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ Eraser: EraserIcon });

export function RichTextClear() {
  const buttonProps = useButtonProps(Clear.name);

  const {
    icon = undefined,
    tooltip = undefined,
    shortcutKeys = undefined,
    tooltipOptions = {},
    action = undefined,
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { disabled } = useActive(isActive);

  const onAction = () => {
    if (disabled) return;

    if (action) action();
  };

  if (!buttonProps) {
    return <></>;
  }

  return (
    <ActionButton
      action={onAction}
      disabled={disabled}
      icon={icon}
      shortcutKeys={shortcutKeys}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
    />
  );
}
