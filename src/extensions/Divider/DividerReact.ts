import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeViewDivider } from '@/extensions/Divider/components/NodeViewDivider';
import { DividerCore } from '@/extensions/Divider/Divider';

export * from '@/extensions/Divider/Divider';
export * from '@/extensions/Divider/components/RichTextDivider';

/** `DividerCore` with the React node view: style picker, editable caption. */
export const Divider = /* @__PURE__ */ DividerCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewDivider);
  },
});
