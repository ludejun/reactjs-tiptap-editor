/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { Pencil } from 'lucide-vue-next';
import { defineComponent, h, ref, watch } from 'vue';

import { IframeCore } from '@/extensions/Iframe/Iframe';
import { getServiceSrc } from '@/extensions/Iframe/utils';

import styles from '@/extensions/Iframe/components/index.module.scss';

const INPUT_CLASS =
  'richtext-flex-1 richtext-h-9 richtext-rounded-md richtext-border richtext-border-solid richtext-border-input richtext-bg-background richtext-px-3 richtext-text-sm richtext-text-foreground richtext-outline-none';
const BUTTON_CLASS =
  'richtext-w-[60px] richtext-h-9 richtext-rounded-md richtext-border-0 richtext-bg-primary richtext-text-sm richtext-font-medium richtext-text-primary-foreground hover:richtext-bg-primary/90';

/**
 * Same DOM and classes as the React `IframeNodeView`: a URL prompt until the
 * frame has a source, then the frame in a dashed card that can be resized
 * from its bottom-right corner. While selected, a pencil reopens the prompt
 * so the URL can be changed.
 */
export const IframeNodeView = defineComponent({
  name: 'IframeNodeView',
  props: nodeViewProps,
  setup(props) {
    const originalLink = ref('');
    const editing = ref(false);
    const resizing = ref(false);

    watch(
      () => props.selected,
      (selected) => {
        if (!selected) editing.value = false;
      }
    );

    const confirm = () => {
      if (!originalLink.value) return;

      const urlFormat = getServiceSrc(originalLink.value);

      props.editor
        .chain()
        .updateAttributes(IframeCore.name, {
          src: (typeof urlFormat === 'string' ? urlFormat : urlFormat.src) || originalLink.value,
        })
        .setNodeSelection(props.editor.state.selection.from)
        .focus()
        .run();
      editing.value = false;
    };

    const onResizeStart = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;

      event.preventDefault();
      event.stopPropagation();

      const handle = event.currentTarget as HTMLElement;
      const start = {
        x: event.clientX,
        y: event.clientY,
        width: Number.parseInt(props.node.attrs.width),
        height: Number.parseInt(props.node.attrs.height),
      };
      let size = { width: start.width, height: start.height };

      const onMove = (move: PointerEvent) => {
        size = {
          width: Math.max(100, start.width + (move.clientX - start.x)),
          height: Math.max(60, start.height + (move.clientY - start.y)),
        };
        handle.parentElement!.style.width = `${size.width}px`;
        handle.parentElement!.style.height = `${size.height}px`;
      };
      const onUp = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onUp);
        resizing.value = false;
        // Written once at the end, like `onResizeStop` in the React view.
        props.updateAttributes(size);
      };

      handle.setPointerCapture(event.pointerId);
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onUp);
      resizing.value = true;
    };

    const prompt = () =>
      h(
        'div',
        {
          class:
            'richtext-mx-auto richtext-my-[12px] richtext-flex richtext-max-w-[600px] richtext-items-center richtext-justify-center richtext-gap-[10px] richtext-rounded-[12px] richtext-border richtext-border-solid richtext-border-border richtext-p-[10px]',
          contenteditable: 'false',
        },
        [
          h('input', {
            class: INPUT_CLASS,
            type: 'url',
            placeholder: 'Enter link',
            value: originalLink.value,
            onVnodeMounted: (vnode) => (vnode.el as HTMLInputElement).focus(),
            onInput: (event: Event) => {
              originalLink.value = (event.target as HTMLInputElement).value;
            },
            onKeydown: (event: KeyboardEvent) => {
              event.stopPropagation();
              if (event.key === 'Enter') {
                event.preventDefault();
                confirm();
              }
              if (event.key === 'Escape') {
                event.preventDefault();
                editing.value = false;
              }
            },
            onMousedown: (event: MouseEvent) => event.stopPropagation(),
          }),
          h('button', { type: 'button', class: BUTTON_CLASS, onClick: confirm }, 'OK'),
        ]
      );

    return () => {
      const { src, width, height } = props.node.attrs;
      const isEditable = props.editor.isEditable;

      if (!src) {
        return h(NodeViewWrapper, null, () => [prompt()]);
      }

      return h(NodeViewWrapper, null, () => [
        editing.value ? prompt() : null,
        h(
          'div',
          {
            class: [styles.wrap, 'render-wrapper', 'richtext-relative'],
            style: {
              width: `${Number.parseInt(width)}px`,
              height: `${Number.parseInt(height)}px`,
              maxWidth: '100%',
            },
          },
          [
            h(
              'div',
              {
                class: styles.innerWrap,
                style: { pointerEvents: isEditable ? 'none' : 'auto' },
              },
              [h('iframe', { class: 'richtext-my-[12px]', src })]
            ),
            isEditable && props.selected && !editing.value
              ? h(
                  'button',
                  {
                    type: 'button',
                    class:
                      'richtext-absolute richtext-right-2 richtext-top-2 richtext-flex richtext-size-7 richtext-items-center richtext-justify-center richtext-rounded-md richtext-border richtext-border-solid richtext-border-border richtext-bg-background richtext-text-foreground richtext-shadow-sm hover:richtext-bg-accent',
                    'aria-label': 'Edit link',
                    title: 'Edit link',
                    contenteditable: 'false',
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: () => {
                      originalLink.value = src;
                      editing.value = true;
                    },
                  },
                  [h(Pencil, { size: 14, 'aria-hidden': 'true' })]
                )
              : null,
            isEditable && (props.selected || resizing.value)
              ? h('span', {
                  class:
                    'richtext-absolute richtext-bottom-0 richtext-right-0 richtext-size-3 richtext-cursor-nwse-resize richtext-rounded-tl richtext-bg-primary/60',
                  'aria-hidden': 'true',
                  contenteditable: 'false',
                  onPointerdown: onResizeStart,
                })
              : null,
          ]
        ),
      ]);
    };
  },
});

/** `IframeCore` with the Vue node view: URL prompt and resizable frame. */
export const Iframe = /* @__PURE__ */ IframeCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(IframeNodeView);
  },
});
