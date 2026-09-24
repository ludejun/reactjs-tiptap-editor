/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { Frame, Pencil, X } from 'lucide-vue-next';
import { defineComponent, h, ref, watch } from 'vue';

import { EMBED_KINDS, resolveEmbed, servicesOfKind } from '@/extensions/Iframe/embeds';
import { IframeCore } from '@/extensions/Iframe/Iframe';
import { BRAND_LOGOS, isLightColor, monogramOf } from '@/extensions/Iframe/logos';

import { useLocale } from '../context';

import styles from '@/extensions/Iframe/components/index.module.scss';

const INPUT_CLASS =
  'richtext-flex-1 richtext-h-9 richtext-rounded-md richtext-border richtext-border-solid richtext-border-input richtext-bg-background richtext-px-3 richtext-text-sm richtext-text-foreground richtext-outline-none';
const BUTTON_CLASS =
  'richtext-h-9 richtext-px-3 disabled:richtext-opacity-50 richtext-rounded-md richtext-border-0 richtext-bg-primary richtext-text-sm richtext-font-medium richtext-text-primary-foreground hover:richtext-bg-primary/90';

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
    const { t } = useLocale();
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
      const resolved = resolveEmbed(originalLink.value);
      if (!resolved) return;

      props.editor
        .chain()
        .updateAttributes(IframeCore.name, {
          src: resolved.src,
          service: resolved.service.key,
          // A YouTube frame wants 16:9, a form wants to be tall; keep a size the reader already set.
          height: props.node.attrs.height === 300 ? resolved.height : props.node.attrs.height,
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

    // A service's brand mark, or a monogram on its brand colour when there is no mark.
    const logo = (service: { key: string; name: string; color: string }) =>
      BRAND_LOGOS[service.key]
        ? h('span', {
            role: 'img',
            'aria-label': service.name,
            title: service.name,
            class:
              'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-overflow-hidden richtext-rounded-[5px] richtext-leading-none [&>img]:richtext-size-full [&>img]:richtext-object-contain [&>svg]:richtext-size-full',
            innerHTML: BRAND_LOGOS[service.key],
          })
        : h(
            'span',
            {
              role: 'img',
              'aria-label': service.name,
              title: service.name,
              class:
                'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-items-center richtext-justify-center richtext-rounded-[5px] richtext-text-[11px] richtext-font-bold richtext-leading-none',
              style: {
                background: service.color,
                color: isLightColor(service.color) ? '#1f2937' : '#fff',
              },
            },
            monogramOf(service.name)
          );

    // What the block understands: the recognised services as brand marks, grouped by
    // kind. Once a link is typed, the detected service and its tips take the row.
    const hint = () => {
      const typed = originalLink.value.trim();
      const resolved = typed ? resolveEmbed(typed) : null;
      const body = resolved
        ? h('div', { class: 'richtext-flex richtext-items-center richtext-gap-2' }, [
            logo(resolved.service),
            h(
              'span',
              { class: 'richtext-font-medium richtext-text-foreground' },
              resolved.service.name
            ),
            resolved.service.tips ? h('span', `— ${resolved.service.tips}`) : null,
          ])
        : typed
          ? t('editor.iframe.invalid')
          : h(
              'div',
              { class: 'richtext-flex richtext-flex-wrap richtext-items-center richtext-gap-y-2' },
              EMBED_KINDS.map(({ kind }, index) =>
                h('div', { key: kind, class: 'richtext-flex richtext-items-center' }, [
                  index > 0
                    ? h('span', {
                        'aria-hidden': 'true',
                        class: 'richtext-mx-2.5 richtext-h-4 richtext-w-px richtext-bg-border',
                      })
                    : null,
                  h(
                    'div',
                    { class: 'richtext-flex richtext-items-center richtext-gap-1.5' },
                    servicesOfKind(kind).map((service) => logo(service))
                  ),
                ])
              )
            );

      return h(
        'div',
        {
          class:
            'richtext-mt-2 richtext-min-h-6 richtext-px-0.5 richtext-text-xs richtext-leading-5 richtext-text-muted-foreground',
        },
        [body]
      );
    };

    const prompt = () =>
      h(
        'div',
        {
          class:
            'richtext-my-3 richtext-w-full richtext-rounded-lg richtext-border richtext-border-dashed richtext-border-border richtext-bg-muted/40 richtext-p-3',
          contenteditable: 'false',
        },
        [
          h(
            'div',
            {
              class:
                'richtext-mb-2 richtext-flex richtext-items-center richtext-gap-2 richtext-text-sm richtext-font-medium richtext-text-foreground',
            },
            [
              h(Frame, { size: 16, class: 'richtext-text-muted-foreground' }),
              h('span', t('editor.iframe.tooltip')),
              h(
                'button',
                {
                  type: 'button',
                  title: t('editor.iframe.remove'),
                  'aria-label': t('editor.iframe.remove'),
                  class:
                    'richtext-ml-auto richtext-flex richtext-size-6 richtext-items-center richtext-justify-center richtext-rounded richtext-border-0 richtext-bg-transparent richtext-text-muted-foreground hover:richtext-bg-accent hover:richtext-text-foreground',
                  onMousedown: (event: MouseEvent) => event.preventDefault(),
                  onClick: () => props.deleteNode(),
                },
                [h(X, { size: 16 })]
              ),
            ]
          ),
          h('div', { class: 'richtext-flex richtext-items-center richtext-gap-2' }, [
            h('input', {
              class: INPUT_CLASS,
              type: 'text',
              placeholder: t('editor.iframe.placeholder'),
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
            h(
              'button',
              {
                type: 'button',
                class: BUTTON_CLASS,
                disabled: !resolveEmbed(originalLink.value),
                onClick: confirm,
              },
              t('editor.iframe.insert')
            ),
          ]),
          hint(),
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
