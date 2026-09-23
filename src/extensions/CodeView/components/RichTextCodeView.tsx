import { ActionButton } from '@/components';
import { CodeView as CodeViewIcon } from '@/components/icons/CodeView';
import { Html as HtmlIcon } from '@/components/icons/Html';
import { registerIcons } from '@/components/icons/icons';
import { CodeView } from '@/extensions/CodeView/CodeView';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ CodeView: CodeViewIcon, Html: HtmlIcon });

export function RichTextCodeView() {
  const buttonProps = useButtonProps(CodeView.name);

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
