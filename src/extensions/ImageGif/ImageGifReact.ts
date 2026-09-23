import { ReactNodeViewRenderer } from '@tiptap/react';

import ImageGifView from '@/extensions/ImageGif/components/ImageGifView';
import { ImageGifCore } from '@/extensions/ImageGif/ImageGif';

export * from '@/extensions/ImageGif/ImageGif';

/** `ImageGifCore` with the React node view: resize handles and selection. */
export const ImageGif = /* @__PURE__ */ ImageGifCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageGifView);
  },
});
