import { ReactNodeViewRenderer } from '@tiptap/react';

import { KatexNodeView } from '@/extensions/Katex/components/KatexWrapper';
import { KatexCore } from '@/extensions/Katex/Katex';

export * from '@/extensions/Katex/Katex';

/** `KatexCore` with the React node view: the rendered formula. */
export const Katex = /* @__PURE__ */ KatexCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(KatexNodeView);
  },
});
