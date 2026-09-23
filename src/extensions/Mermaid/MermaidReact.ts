import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeViewMermaid } from '@/extensions/Mermaid/components/NodeViewMermaid/NodeViewMermaid';
import { MermaidCore } from '@/extensions/Mermaid/Mermaid';

export * from '@/extensions/Mermaid/Mermaid';

/** `MermaidCore` with the React node view: the rendered diagram with resize handles. */
export const Mermaid = /* @__PURE__ */ MermaidCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewMermaid);
  },
});
