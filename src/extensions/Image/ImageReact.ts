import { ReactNodeViewRenderer } from '@tiptap/react';

import { isImageCaptionEvent, isInsideImageCaption } from '@/extensions/Image/caption';
import ImageView from '@/extensions/Image/components/ImageView';
import { ImageBlockCore, ImageCore } from '@/extensions/Image/Image';

export * from '@/extensions/Image/Image';

const nodeViewOptions = {
  // Hand every event inside the caption input back to the input. Without
  // this ProseMirror treats a click there as selecting the image (so the
  // next keystroke replaces it) and swallows the keys themselves.
  stopEvent: isImageCaptionEvent,
  ignoreMutation: ({ mutation }: { mutation: { target: Node } }) =>
    isInsideImageCaption(mutation.target),
};

/** `ImageBlockCore` with the React node view: resize handles, caption, rotation. */
export const ImageBlock = /* @__PURE__ */ ImageBlockCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView, nodeViewOptions);
  },
});

/** `ImageCore` with the React node views for the inline and block images. */
export const Image = /* @__PURE__ */ ImageCore.extend({
  addExtensions() {
    return [ImageBlock.configure(this.options)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageView, nodeViewOptions);
  },
});
