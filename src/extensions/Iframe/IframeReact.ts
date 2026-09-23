import { ReactNodeViewRenderer } from '@tiptap/react';

import IframeNodeView from '@/extensions/Iframe/components/IframeNodeView';
import { IframeCore } from '@/extensions/Iframe/Iframe';

export * from '@/extensions/Iframe/Iframe';

/** `IframeCore` with the React node view: URL prompt and resizable frame. */
export const Iframe = /* @__PURE__ */ IframeCore.extend({
  addNodeView() {
    return ReactNodeViewRenderer(IframeNodeView);
  },
});
