import { FileIconString } from '@/extensions/Attachment/components/NodeViewAttachment/FileIconString';
import { normalizeFileType } from '@/utils/file';

import type { FileType } from '@/utils/file';
import type { DOMOutputSpec } from '@tiptap/pm/model';

/** The static SVG markup for a file type; the strings are ours, not user input. */
export function getFileTypeIconMarkup(fileType: string | null | undefined): string {
  return FileIconString[normalizeFileType(fileType)];
}

/**
 * The file-type icon as a ProseMirror `DOMOutputSpec`, for `renderHTML` and
 * for any node view that builds DOM rather than JSX.
 */
export function getFileTypeIconSpec(fileType: string | null | undefined): DOMOutputSpec {
  return iconToProseMirror(normalizeFileType(fileType));
}

function iconToProseMirror(typeIcon: FileType) {
  const svgString = FileIconString[typeIcon];

  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = svgDocument.documentElement;

  const iconToReturn: [string, Record<string, string>, ...DOMOutputSpec[]] = [
    'svg',
    {
      ...Array.from(svgElement.attributes).reduce((acc: Record<string, string>, attr: Attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {}),
    },
  ];

  Array.from(svgElement.childNodes).forEach((child) => {
    if (child instanceof Element) {
      const childElement: [string, Record<string, string>, ...string[]] = [
        child.tagName.toLowerCase(),
        Array.from(child.attributes).reduce((acc: Record<string, string>, attr: Attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
      ];

      if (child.textContent) {
        childElement.push(child.textContent);
      }

      iconToReturn.push(childElement);
    }
  });

  return iconToReturn;
}
