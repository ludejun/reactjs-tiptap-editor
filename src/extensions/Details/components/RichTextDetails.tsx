import { ListCollapseIcon } from 'lucide-react';

import { ActionButton } from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { Details } from '@/extensions/Details/Details';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ Details: ListCollapseIcon });

export function RichTextDetails() {
  const buttonProps = useButtonProps(Details.name);

  const {
    icon = undefined,
    tooltip = undefined,
    shortcutKeys = undefined,
    tooltipOptions = {},
    action = undefined,
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { dataState, disabled, update } = useToggleActive(isActive);

  const onAction = () => {
    if (disabled) return;

    if (action) {
      action();
      update();
    }
  };

  if (!buttonProps) {
    return <></>;
  }

  return (
    <ActionButton
      action={onAction}
      dataState={dataState}
      disabled={disabled}
      icon={icon}
      shortcutKeys={shortcutKeys}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
    />
  );
}
