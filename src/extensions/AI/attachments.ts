import { translate } from '@/locales/store';

import type { AIAttachment, AIOptions } from './types';

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function formatAttachmentSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${Math.round(bytes / (1024 * 1024))} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

type AttachmentOptions = Pick<
  AIOptions,
  'enableImageInput' | 'enableFileInput' | 'imageMimes' | 'fileMimes' | 'maxAttachmentSize'
>;

/** Whether the options allow any attachment at all. */
export function canAttach(options: AttachmentOptions): boolean {
  return options.enableImageInput !== false || options.enableFileInput !== false;
}

/** The `accept` value for a file picker honouring the options. */
export function attachmentAccept(options: AttachmentOptions): string {
  return [
    ...(options.enableImageInput !== false ? (options.imageMimes ?? []) : []),
    ...(options.enableFileInput !== false ? (options.fileMimes ?? []) : []),
  ].join(',');
}

/** Files from a drop, a paste or a file picker; `null` when there are none. */
export function filesOf(transfer: DataTransfer | null | undefined): File[] {
  if (!transfer) return [];
  const files = Array.from(transfer.files ?? []);
  if (files.length) return files;
  return Array.from(transfer.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile())
    .filter((file): file is File => !!file);
}

/**
 * Turns picked files into attachments the way the AI panel does: images are
 * kept as data URLs, text files are read as text, anything else or anything
 * too large is refused with a translated message in `errors`. Files already
 * in `current` are skipped.
 */
export async function readAttachments(
  files: File[],
  options: AttachmentOptions,
  current: AIAttachment[] = []
): Promise<{ attachments: AIAttachment[]; error: string }> {
  const imageInput = options.enableImageInput !== false;
  const fileInput = options.enableFileInput !== false;
  const maxSize = options.maxAttachmentSize ?? 4 * 1024 * 1024;
  const attachments: AIAttachment[] = [];
  let error = '';

  for (const file of files) {
    const isImage = imageInput && file.type.startsWith('image/');
    const isFile = fileInput && (options.fileMimes ?? []).includes(file.type);

    if (!isImage && !isFile) {
      error = translate('editor.ai.error.fileType', { name: file.name });
      continue;
    }

    if (file.size > maxSize) {
      error = translate('editor.ai.error.fileTooBig', {
        name: file.name,
        size: formatAttachmentSize(maxSize),
      });
      continue;
    }

    const id = `${file.name}-${file.size}-${file.lastModified}`;
    if (current.some((item) => item.id === id) || attachments.some((item) => item.id === id))
      continue;

    attachments.push({
      id,
      name: file.name,
      mediaType: file.type,
      dataUrl: await readAsDataUrl(file),
      kind: isImage ? 'image' : 'file',
      text: isImage ? undefined : await file.text(),
    });
  }

  return { attachments, error };
}
