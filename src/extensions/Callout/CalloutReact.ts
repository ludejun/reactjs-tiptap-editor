import { ReactNodeViewRenderer } from '@tiptap/react';

import { CalloutCore } from '@/extensions/Callout/Callout';
import { NodeViewCallout } from '@/extensions/Callout/components/NodeViewCallout/NodeViewCallout';

export * from '@/extensions/Callout/Callout';

/** `CalloutCore` with the React node view: type icon and colour, title, body. */
export const Callout = /* @__PURE__ */ CalloutCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewCallout);
  },
});
