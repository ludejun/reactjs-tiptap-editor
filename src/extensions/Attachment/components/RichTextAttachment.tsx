import { PaperclipIcon } from 'lucide-react';

import { ActionButton } from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { AttachmentCore as Attachment } from '@/extensions/Attachment/Attachment';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ Attachment: PaperclipIcon });

export function RichTextAttachment() {
  const buttonProps = useButtonProps(Attachment.name);

  const {
    icon = undefined,
    tooltip = undefined,
    shortcutKeys = undefined,
    tooltipOptions = {},
    action = undefined,
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { editorDisabled, update } = useToggleActive(isActive);

  const onAction = () => {
    if (editorDisabled) return;

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
      disabled={editorDisabled}
      icon={icon}
      shortcutKeys={shortcutKeys}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
    />
  );
}
