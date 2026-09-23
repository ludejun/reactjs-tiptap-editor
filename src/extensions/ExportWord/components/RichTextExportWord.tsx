import { LoaderCircleIcon } from 'lucide-react';
import { useState } from 'react';

import { ActionButton } from '@/components';
import ExportWordIcon from '@/components/icons/ExportWord';
import { registerIcons } from '@/components/icons/icons';
import { ExportWord } from '@/extensions/ExportWord/ExportWord';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ ExportWord: ExportWordIcon, Loader: LoaderCircleIcon });

export function RichTextExportWord() {
  const buttonProps = useButtonProps(ExportWord.name);
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
