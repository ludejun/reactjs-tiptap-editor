import { useState } from 'react';

import { ActionButton } from '@/components';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageSourcePicker } from '@/extensions/Image/components/ImageSourcePicker';
import { Image } from '@/extensions/Image/Image';
import { useToggleActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useLocale } from '@/locales';

export function RichTextImage() {
  const { t } = useLocale();

  const buttonProps = useButtonProps(Image.name);
  const { icon, tooltip } = buttonProps?.componentProps ?? {};

  const { editorDisabled } = useToggleActive();

  const [open, setOpen] = useState(false);
  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

  if (!buttonProps) {
    return <></>;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          setIsCropDialogOpen(false);
        }
      }}
    >
      <DialogTrigger asChild>
        <ActionButton
          disabled={editorDisabled}
          icon={icon}
          tooltip={tooltip}
          action={() => {
            if (editorDisabled) return;
            setOpen(true);
          }}
        />
      </DialogTrigger>

      <DialogContent className={isCropDialogOpen ? 'richtext-hidden' : undefined}>
        <DialogTitle>{t('editor.image.dialog.title')}</DialogTitle>

        <ImageSourcePicker onCropOpenChange={setIsCropDialogOpen} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
