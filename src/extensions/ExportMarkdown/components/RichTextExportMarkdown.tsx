import { LoaderCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { ActionButton } from '@/components';
import ExportMarkdownIcon from '@/components/icons/ExportMarkdown';
import { registerIcons } from '@/components/icons/icons';
import { ExportMarkdown } from '@/extensions/ExportMarkdown/ExportMarkdown';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ ExportMarkdown: ExportMarkdownIcon, Loader: LoaderCircleIcon });

export function RichTextExportMarkdown() {
  const buttonProps = useButtonProps(ExportMarkdown.name);
  const [loading, setLoading] = useState(false);

  const {
    icon = undefined,
    tooltip = undefined,
    shortcutKeys = undefined,
    tooltipOptions = {},
    action = undefined,
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { dataState, disabled, update } = useToggleActive(isActive);

  const onAction = async () => {
    if (disabled || loading) return;

    if (action) {
      setLoading(true);
      await action();
      update();
      setLoading(false);
    }
  };

  if (!buttonProps) {
    return <></>;
  }

  return (
    <ActionButton
      action={onAction}
      dataState={dataState}
      disabled={disabled || loading}
      icon={loading ? 'Loader' : icon}
      shortcutKeys={shortcutKeys}
      tooltip={tooltip}
      tooltipOptions={tooltipOptions}
    />
  );
}
