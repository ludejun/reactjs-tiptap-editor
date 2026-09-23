import { ReactNodeViewRenderer } from '@tiptap/react';

import { NodeViewTableOfContents } from '@/extensions/TableOfContents/components/NodeViewTableOfContents';
import {
  TableOfContentsCore,
  TableOfContentsNodeCore,
} from '@/extensions/TableOfContents/TableOfContents';

export * from '@/extensions/TableOfContents/TableOfContents';

/** `TableOfContentsNodeCore` with the React node view: the live heading list. */
export const TableOfContentsNode = /* @__PURE__ */ TableOfContentsNodeCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(NodeViewTableOfContents);
  },
});

/** `TableOfContentsCore` registering the React `TableOfContentsNode`. */
export const TableOfContents = /* @__PURE__ */ TableOfContentsCore.extend({
  addExtensions() {
    return [
      TableOfContentsNode.configure({
        HTMLAttributes: this.options.HTMLAttributes,
      }),
    ];
  },
});
