import {
  LucideAudioLines,
  LucideFile,
  LucideImage,
  LucideSheet,
  LucideTableProperties,
  LucideVideo,
} from 'lucide-react';

import { ExportPdf } from '@/components/icons/ExportPdf';
import ExportWord from '@/components/icons/ExportWord';
import { getFileTypeIconSpec } from '@/extensions/Attachment/fileIcon';
import { normalizeFileType } from '@/utils/file';

// React components for rendering directly in JSX
const icons = {
  audio: <LucideAudioLines />,
  video: <LucideVideo />,
  file: <LucideFile />,
  image: <LucideImage />,
  pdf: <ExportPdf />,
  word: <ExportWord />,
  excel: <LucideSheet />,
  ppt: <LucideTableProperties />,
};

export function getFileTypeIcon(
  fileType: string,
  forProseMirror: true
): import('@tiptap/pm/model').DOMOutputSpec;
export function getFileTypeIcon(fileType: string, forProseMirror?: false): React.ReactElement;
export function getFileTypeIcon(
  fileType: string,
  forProseMirror = false
): React.ReactElement | import('@tiptap/pm/model').DOMOutputSpec {
  // Return ProseMirror-compatible structure or React component
  if (forProseMirror) {
    return getFileTypeIconSpec(fileType);
  }

  return icons[normalizeFileType(fileType)] || <></>;
}
