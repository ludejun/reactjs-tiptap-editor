import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { CircleAlert, Info, Lightbulb, OctagonAlert, TriangleAlert } from 'lucide-vue-next';
import { defineComponent, h } from 'vue';

import { CalloutCore } from '@/extensions/Callout/Callout';
import { getCalloutType } from '@/extensions/Callout/calloutTypes';

import type { CalloutType } from '@/extensions/Callout/calloutTypes';

const ICONS = {
  note: Info,
  tip: Lightbulb,
  important: CircleAlert,
  warning: TriangleAlert,
  caution: OctagonAlert,
} as const;

// The same literal classes as the React node view, so the stylesheet already has them.
const BOX_CLASSES: Record<CalloutType, string> = {
  note: 'richtext-border-[#1f6feb] richtext-bg-[#1f6feb1f]',
  tip: 'richtext-border-[#238636] richtext-bg-[#2386361f]',
  important: 'richtext-border-[#ab7df8] richtext-bg-[#ab7df81f]',
  warning: 'richtext-border-[#d29922] richtext-bg-[#d299221f]',
  caution: 'richtext-border-[#f85149] richtext-bg-[#f851491f]',
};

const HEADER_CLASSES: Record<CalloutType, string> = {
  note: 'richtext-text-[#1f6feb]',
  tip: 'richtext-text-[#238636]',
  important: 'richtext-text-[#ab7df8]',
  warning: 'richtext-text-[#d29922]',
  caution: 'richtext-text-[#f85149]',
};

/** Same DOM and classes as the React `NodeViewCallout`: type icon and colour, title, body. */
export const CalloutNodeView = defineComponent({
  name: 'CalloutNodeView',
  props: nodeViewProps,
  setup(props) {
    return () => {
      const { title = '', body = '' } = props.node.attrs;
      const type = getCalloutType(props.node.attrs.type || 'note').value;

      return h(NodeViewWrapper, null, () => [
        h(
          'div',
          {
            class: [
              'richtext-relative richtext-my-4 richtext-rounded-lg richtext-border richtext-p-4',
              BOX_CLASSES[type],
            ],
          },
          [
            h(
              'div',
              {
                class: [
                  'richtext-mb-2 richtext-flex richtext-items-center richtext-gap-2',
                  HEADER_CLASSES[type],
                ],
              },
              [
                h(ICONS[type], { class: 'richtext-size-5', 'aria-hidden': 'true' }),
                h('span', { class: 'richtext-font-semibold' }, title),
              ]
            ),
            // The body is HTML the host stored on the node, as in the React view.
            body
              ? h('p', {
                  class: 'richtext-whitespace-pre-wrap richtext-pl-[28px]',
                  innerHTML: body,
                })
              : null,
          ]
        ),
      ]);
    };
  },
});

/** `CalloutCore` with the Vue node view: type icon and colour, title, body. */
export const Callout = /* @__PURE__ */ CalloutCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(CalloutNodeView);
  },
});
