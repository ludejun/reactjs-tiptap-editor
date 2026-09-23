/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { defineComponent, h, type CSSProperties } from 'vue';

import { MermaidCore } from '@/extensions/Mermaid/Mermaid';

import { selectNode, useImageResize } from './resize';

function cssSize(value: unknown): string | undefined {
  if (typeof value === 'number') return `${value}px`;

  return typeof value === 'string' && value ? value : undefined;
}

/**
 * Same DOM and classes as the React `NodeViewMermaid`. The diagram is stored
 * as an image (`src`, with the Mermaid source in `alt`), so the node view
 * shows that image on a white card and resizes it keeping its ratio; the
 * editing dialog is what runs Mermaid itself.
 */
export const MermaidNodeView = defineComponent({
  name: 'MermaidNodeView',
  props: nodeViewProps,
  setup(props) {
    const select = () => selectNode(props.editor, props.getPos);
    const { resizing, onImageLoad, renderHandles } = useImageResize({
      editor: props.editor,
      getAttrs: () => props.node.attrs,
      onResize: (size) => props.updateAttributes(size),
      onDone: select,
      keepRatio: true,
    });

    return () => {
      const { src, alt, align } = props.node.attrs;
      const width = cssSize(props.node.attrs.width);
      const height = cssSize(props.node.attrs.height);
      const imageMaxStyle: CSSProperties = { width: width === '100%' ? width : undefined };

      return h(
        NodeViewWrapper,
        { class: 'image-view', style: { ...imageMaxStyle, width: '100%', textAlign: align } },
        () => [
          h(
            'div',
            {
              'data-drag-handle': '',
              draggable: 'true',
              class: [
                'image-view__body',
                {
                  'image-view__body--focused': props.selected,
                  'image-view__body--resizing': resizing.value,
                },
              ],
              style: { ...imageMaxStyle, background: '#fff' },
            },
            [
              h('img', {
                class: 'image-view__body__image block',
                src: src || undefined,
                alt: alt || undefined,
                height: 'auto',
                style: { width, height },
                onClick: select,
                onLoad: onImageLoad,
              }),
              props.editor.view.editable && (props.selected || resizing.value)
                ? renderHandles('div')
                : null,
            ]
          ),
        ]
      );
    };
  },
});

/** `MermaidCore` with the Vue node view: the rendered diagram with resize handles. */
export const Mermaid = /* @__PURE__ */ MermaidCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(MermaidNodeView);
  },
});
