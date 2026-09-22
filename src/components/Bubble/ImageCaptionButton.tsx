import { useEditorState } from '@tiptap/react';

import { ActionButton } from '@/components/ActionButton';
import { Image, ImageBlock } from '@/extensions/Image';
import { useLocale } from '@/locales';

import type { Editor } from '@tiptap/core';

/**
 * Position of this image among the ones that already carry a caption, so a new
 * caption continues the numbering rather than restarting it. The text is a
 * plain editable string afterwards — nothing renumbers behind the user's back.
 */
function nextFigureNumber(editor: Editor): number {
  const imagePos = editor.state.selection.from;
  let seen = 0;

  editor.state.doc.descendants((node, pos) => {
    if (
      node.type.name === ImageBlock.name &&
      pos < imagePos &&
      typeof node.attrs.caption === 'string'
    ) {
      seen += 1;
    }
  });

  return seen + 1;
}

/**
 * Adds or removes the caption of the selected image.
 *
 * Its label and state track the selection, so it reads the editor itself
 * instead of taking a snapshot from the bubble's memoised item list.
 */
export function ImageCaptionButton({
  editor,
  disabled,
}: {
  // The bubble's item list types every component's props loosely and supplies
  // the editor at render time, so accept it as optional here.
  editor?: Editor | null;
  disabled?: boolean;
}) {
  const { t } = useLocale();

  const state = useEditorState({
    editor: editor ?? null,
    selector: ({ editor }) => {
      if (!editor) {
        return { isBlockImage: false, hasCaption: false };
      }

      const isBlockImage = editor.isActive(ImageBlock.name);
      const attrs = isBlockImage
        ? editor.getAttributes(ImageBlock.name)
        : editor.getAttributes(Image.name);

      return {
        isBlockImage,
        hasCaption: typeof attrs.caption === 'string',
      };
    },
  });

  if (!editor || !state) {
    return null;
  }

  return (
    <ActionButton
      action={() => {
        if (state.hasCaption) {
          editor
            .chain()
            .focus(undefined, { scrollIntoView: false })
            .updateImage({ caption: null })
            .run();
          return;
        }

        // No `.focus()` here: the caption input focuses itself once it mounts,
        // and pulling focus back into the editor would take it away again.
        editor
          .chain()
          .updateImage({
            caption: t('editor.image.caption.default', { number: nextFigureNumber(editor) }),
          })
          .run();
      }}
      dataState={state.hasCaption}
      // Only block images have somewhere to put a caption.
      disabled={disabled || !state.isBlockImage}
      icon='ImageCaption'
      tooltip={state.hasCaption ? t('editor.image.caption.remove') : t('editor.image.caption.add')}
    />
  );
}
