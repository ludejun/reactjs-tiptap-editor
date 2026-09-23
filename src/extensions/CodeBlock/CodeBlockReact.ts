import { ReactNodeViewRenderer } from '@tiptap/react';

import { CodeBlockCore } from '@/extensions/CodeBlock/CodeBlock';
import { NodeViewCodeBlock } from '@/extensions/CodeBlock/components/NodeViewCodeBlock';

export * from '@/extensions/CodeBlock/CodeBlock';

/** `CodeBlockCore` with the React node view: language picker, copy, delete. */
export const CodeBlock = /* @__PURE__ */ CodeBlockCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewCodeBlock);
  },
});
