import { useMemo, useRef, useState } from 'react';

import {
  Button,
  Checkbox,
  IconComponent,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  useToast,
} from '@/components';
import { ImageCropper } from '@/extensions/Image/components/ImageCropper';
import { DEFAULT_OPTIONS, getImageInsertNodeName, Image } from '@/extensions/Image/Image';
import { rememberUploadedImage } from '@/extensions/Image/imageLifecycle';
import { useExtension } from '@/hooks/useExtension';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';
import { validateFiles } from '@/utils/validateFile';

/** "image/jpeg" -> "JPEG", ".webp" -> "WEBP", "image/*" -> null. */
function mimeToLabel(accept: string): string | null {
  if (accept.endsWith('/*')) {
    return null;
  }

  const raw = accept.startsWith('.') ? accept.slice(1) : accept.split('/').pop();

  return raw ? raw.replace(/^x-/, '').toUpperCase() : null;
}

/** How many formats the hint lists before it gives up and says "and more". */
const HINT_FORMAT_LIMIT = 4;

function acceptedFormatLabels(acceptMimes: string[]): string[] {
  const labels = acceptMimes.map(mimeToLabel).filter((label): label is string => !!label);

  // JPG and JPEG are the same thing to anyone reading this line.
  return [...new Set(labels.map((label) => (label === 'JPG' ? 'JPEG' : label)))];
}

function formatFileSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Math.round(bytes / (1024 * 1024))} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

export interface ImageSourcePickerProps {
  /** Lets the host hide its dialog while the cropper is open. */
  onCropOpenChange: (open: boolean) => void;
  /** Called once an image has been inserted, so the host can close. */
  onDone: () => void;
}

/**
 * Body of the "add an image" dialog, shared by the toolbar button and the slash
 * command so the two cannot drift apart.
 */
export function ImageSourcePicker({ onCropOpenChange, onDone }: ImageSourcePickerProps) {
  const { t } = useLocale();
  const { toast } = useToast();

  const editor = useEditorInstance();
  const extension = useExtension(Image.name);

  const [isUploading, setIsUploading] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [link, setLink] = useState('');
  const [alt, setAlt] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const defaultInline = extension?.options.defaultInline || false;
  const [imageInline, setImageInline] = useState(defaultInline);

  const uploadOptions = useMemo(() => extension?.options || DEFAULT_OPTIONS, [extension]);

  const dropzoneHint = useMemo(() => {
    const labels = acceptedFormatLabels(uploadOptions.acceptMimes ?? []);
    const size = formatFileSize(uploadOptions.maxSize ?? DEFAULT_OPTIONS.maxSize);

    if (!labels.length) {
      return t('editor.imageUpload.dropzoneHint', { formats: 'JPEG, PNG, GIF', size });
    }

    if (labels.length > HINT_FORMAT_LIMIT) {
      return t('editor.imageUpload.dropzoneHintMore', {
        formats: labels.slice(0, HINT_FORMAT_LIMIT).join(', '),
        size,
      });
    }

    return t('editor.imageUpload.dropzoneHint', { formats: labels.join(', '), size });
  }, [uploadOptions.acceptMimes, uploadOptions.maxSize, t]);

  function resetForm() {
    setAlt('');
    setLink('');
    setImageInline(defaultInline);
  }

  function finish() {
    resetForm();
    onDone();
  }

  async function uploadFiles(files: File[]) {
    if (!editor || editor.isDestroyed || files.length === 0 || isUploading) {
      return;
    }

    const validFiles = validateFiles(files, {
      acceptMimes: uploadOptions?.acceptMimes,
      maxSize: uploadOptions?.maxSize,
      t,
      toast,
      onError: uploadOptions.onError,
    });

    if (validFiles.length <= 0) {
      return;
    }

    setIsUploading(true);

    try {
      const selected = uploadOptions?.multiple ? validFiles : validFiles.slice(0, 1);

      const srcs = await Promise.all(
        selected.map(async (file) =>
          uploadOptions.upload ? await uploadOptions.upload(file) : URL.createObjectURL(file)
        )
      );

      if (uploadOptions.upload) {
        srcs.forEach((src) => rememberUploadedImage(editor, src));
      }

      insertImages(srcs);
      finish();
    } catch (error) {
      console.error('Error uploading image', error);

      if (uploadOptions.onError) {
        uploadOptions.onError({ type: 'upload', message: t('editor.upload.error') });
      } else {
        toast({ variant: 'destructive', title: t('editor.upload.error') });
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function onFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files ?? []);

    await uploadFiles(files);
    event.target.value = '';
  }

  /**
   * All the images go in as one `insertContent` call.
   *
   * Calling `setImageInline` once per file only ever produced a single image:
   * each insert leaves the new node selected, so the next one replaced it.
   */
  function insertImages(srcs: string[]) {
    const nodeName = getImageInsertNodeName(editor.state, imageInline, Image.name);

    const nodes = srcs.map((src) => ({
      type: nodeName,
      attrs: { src, inline: imageInline, alt },
    }));

    editor.chain().focus().insertContent(nodes).run();
  }

  function onLinkSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();

    insertImages([link]);
    finish();
  }

  function onDrop(event: React.DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsDraggingOver(false);

    void uploadFiles(Array.from(event.dataTransfer.files ?? []));
  }

  /**
   * Inline placement and alt text apply to both sources, so they live outside
   * the tabs: keeping them in each panel made the dialog jump on every switch.
   */
  const sharedFields = (
    <div className='richtext-mt-4 richtext-space-y-3 richtext-border-t richtext-border-border richtext-pt-4'>
      <div className='richtext-flex richtext-items-center richtext-gap-2'>
        <Checkbox
          checked={imageInline}
          id='richtext-image-inline'
          onCheckedChange={(value) => setImageInline(value as boolean)}
        />

        <Label className='richtext-cursor-pointer' htmlFor='richtext-image-inline'>
          {t('editor.link.dialog.inline')}
        </Label>
      </div>

      {uploadOptions.enableAlt && (
        <div className='richtext-space-y-1.5'>
          <Label
            className='richtext-flex richtext-items-baseline richtext-gap-2'
            htmlFor='richtext-image-alt'
          >
            {t('editor.imageUpload.altOptional')}

            <span className='richtext-text-xs richtext-font-normal richtext-text-muted-foreground'>
              {t('editor.imageUpload.altHint')}
            </span>
          </Label>

          <Input
            id='richtext-image-alt'
            onChange={(event) => setAlt(event.currentTarget.value)}
            type='text'
            value={alt}
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      <Tabs
        activationMode='manual'
        defaultValue={
          uploadOptions.resourceImage === 'both' || uploadOptions.resourceImage === 'upload'
            ? 'upload'
            : 'link'
        }
      >
        {uploadOptions.resourceImage === 'both' && (
          <TabsList className='richtext-grid richtext-w-full richtext-grid-cols-2'>
            <TabsTrigger value='upload'>{t('editor.image.dialog.tab.upload')}</TabsTrigger>

            <TabsTrigger value='link'>{t('editor.image.dialog.tab.url')}</TabsTrigger>
          </TabsList>
        )}

        {/* A shared minimum height: the two panels differ a lot in size and the
          dialog resized under the pointer on every tab switch. */}
        <div className='richtext-min-h-[130px]'>
          <TabsContent value='upload'>
            <button
              className={cn(
                'richtext-flex richtext-w-full richtext-flex-col richtext-items-center richtext-justify-center richtext-gap-1 richtext-rounded-md !richtext-border !richtext-border-dashed !richtext-border-border richtext-bg-transparent richtext-px-4 richtext-py-6 richtext-text-center richtext-transition-colors hover:!richtext-border-primary/60 hover:richtext-bg-accent/40 disabled:richtext-cursor-not-allowed disabled:richtext-opacity-60',
                isDraggingOver && '!richtext-border-primary richtext-bg-accent/60'
              )}
              disabled={isUploading}
              onClick={() => fileInput.current?.click()}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={onDrop}
              type='button'
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingOver(true);
              }}
            >
              {isUploading ? (
                <>
                  <IconComponent className='richtext-animate-spin' name='Loader' />

                  <span className='richtext-text-sm richtext-text-muted-foreground'>
                    {t('editor.imageUpload.uploading')}
                  </span>
                </>
              ) : (
                <>
                  <IconComponent className='richtext-text-muted-foreground' name='ImageUp' />

                  <span className='richtext-text-sm richtext-text-foreground'>
                    {isDraggingOver
                      ? t('editor.imageUpload.dropzoneActive')
                      : t('editor.imageUpload.dropzone')}
                  </span>

                  <span className='richtext-text-xs richtext-text-muted-foreground'>
                    {dropzoneHint}
                  </span>
                </>
              )}
            </button>

            <div className='richtext-mt-1 richtext-flex richtext-justify-center'>
              <ImageCropper
                alt={alt}
                disabled={isUploading}
                editor={editor}
                imageInline={imageInline}
                onOpenChange={onCropOpenChange}
                onClose={() => {
                  onCropOpenChange(false);
                  finish();
                }}
              />
            </div>

            <input
              accept={uploadOptions.acceptMimes.join(',') || 'image/*'}
              multiple={uploadOptions.multiple}
              onChange={onFileInputChange}
              ref={fileInput}
              style={{ display: 'none' }}
              type='file'
            />
          </TabsContent>

          <TabsContent value='link'>
            <form onSubmit={onLinkSubmit}>
              <div className='richtext-flex richtext-items-center richtext-gap-2'>
                <Input
                  autoFocus
                  onChange={(event) => setLink(event.currentTarget.value)}
                  placeholder='https://'
                  required
                  type='url'
                  value={link}
                />

                <Button type='submit'>{t('editor.image.dialog.button.apply')}</Button>
              </div>

              <p className='richtext-mt-2 richtext-text-xs richtext-text-muted-foreground'>
                {t('editor.imageUpload.linkHint')}
              </p>
            </form>
          </TabsContent>
        </div>
      </Tabs>

      {sharedFields}
    </>
  );
}
