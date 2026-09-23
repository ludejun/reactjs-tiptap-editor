import { ReactNodeViewRenderer } from '@tiptap/react';

import { AttachmentCore } from '@/extensions/Attachment/Attachment';
import { NodeViewAttachment } from '@/extensions/Attachment/components/NodeViewAttachment/NodeViewAttachment';

export * from '@/extensions/Attachment/Attachment';

/** `AttachmentCore` with the React node view: file picker, upload state, file card. */
export const Attachment = /* @__PURE__ */ AttachmentCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewAttachment);
  },
});
