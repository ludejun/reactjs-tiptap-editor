import { IndentDecreaseIcon, IndentIncreaseIcon } from 'lucide-react';

import { ActionButton } from '@/components';
import { registerIcons } from '@/components/icons/icons';
import { Indent } from '@/extensions/Indent/Indent';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';

// Icons this module (and its extension's `button()` options) resolves by name.
registerIcons({ IndentDecrease: IndentDecreaseIcon, IndentIncrease: IndentIncreaseIcon });

export interface RichTextIndentProps {
  /** Render one of the two buttons instead of both, for layouts with one control per row. */
  only?: 'indent' | 'outdent';
}

export function RichTextIndent({ only }: RichTextIndentProps = {}) {
  const buttonProps = useButtonProps(Indent.name);

  const { indent, outdent } = buttonProps?.componentProps ?? {};

  const { editorDisabled } = useToggleActive();

  const onActionIndent = () => {
    if (editorDisabled) return;

    if (indent?.action) {
      indent?.action();
    }
  };

  const onActionOutdent = () => {
    if (editorDisabled) return;

    if (outdent?.action) {
      outdent?.action();
    }
  };

  if (!buttonProps) {
    return <></>;
  }

  return (
    <>
      {only !== 'outdent' ? (
        <ActionButton
          action={onActionIndent}
          disabled={editorDisabled}
          icon={indent?.icon}
          shortcutKeys={indent?.shortcutKeys}
          tooltip={indent?.tooltip}
        />
      ) : null}

      {only !== 'indent' ? (
        <ActionButton
          action={onActionOutdent}
          disabled={editorDisabled}
          icon={outdent?.icon}
          shortcutKeys={outdent?.shortcutKeys}
          tooltip={outdent?.tooltip}
        />
      ) : null}
    </>
  );
}
