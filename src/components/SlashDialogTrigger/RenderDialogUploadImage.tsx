import { useState } from 'react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ImageSourcePicker } from '@/extensions/Image/components/ImageSourcePicker';
import { useLocale } from '@/locales';

import type { UploadDialogProps } from './SlashDialogTrigger';

export function RenderDialogUploadImage({ open, onOpenChange: setOpen }: UploadDialogProps) {
  const { t } = useLocale();

  const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);

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
      <DialogContent className={isCropDialogOpen ? 'richtext-hidden' : undefined}>
        <DialogTitle>{t('editor.image.dialog.title')}</DialogTitle>

        <ImageSourcePicker onCropOpenChange={setIsCropDialogOpen} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
