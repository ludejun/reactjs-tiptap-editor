/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { defineComponent, h } from 'vue';

import { DividerCore } from '@/extensions/Divider/Divider';

import { useLocale } from './context';

import type { DividerOptions, DividerVariantOption } from '@/extensions/Divider/Divider';

export * from '@/extensions/Divider/Divider';

function variantLabel(option: DividerVariantOption, t: (key: string) => string) {
  if (option.label) return option.label;
  const key = `editor.divider.variant.${option.value}`;
  const label = t(key);

  return label === key ? String(option.value) : label;
}

/** Same DOM as the React node view, so the shared stylesheet applies unchanged. */
export const DividerNodeView = defineComponent({
  name: 'DividerNodeView',
  props: nodeViewProps,
  setup(props) {
    const { t } = useLocale();

    return () => {
      const { variant, label } = props.node.attrs as { variant: string; label: string | null };
      const variants = (props.extension.options as DividerOptions).variants;
      const option = variants.find((item) => item.value === variant);
      const editable = !!option?.editable && props.editor.isEditable;
      const showLabel = editable || (label && variant !== 'line');
      const placeholder = t('editor.divider.label.placeholder');

      const labelNode = !showLabel
        ? null
        : editable
          ? h('input', {
              class: 'divider__label',
              'aria-label': placeholder,
              placeholder,
              size: Math.max(1, (label ?? '').length || placeholder.length),
              value: label ?? '',
              onInput: (event: Event) =>
                props.updateAttributes({ label: (event.target as HTMLInputElement).value || null }),
              onKeydown: (event: KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === 'Escape') {
                  event.preventDefault();
                  (event.currentTarget as HTMLInputElement).blur();
                  const pos = props.getPos();

                  if (typeof pos === 'number')
                    props.editor.commands.focus(pos + props.node.nodeSize);
                }
              },
            })
          : h('span', { class: 'divider__label' }, label ?? '');

      const picker =
        props.selected && props.editor.isEditable && variants.length > 1
          ? h(
              'div',
              { class: 'divider__picker', contenteditable: 'false', role: 'radiogroup' },
              variants.map((item) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'radio',
                    key: item.value,
                    class: ['divider__pick', `divider__pick--${item.value}`],
                    'aria-checked': item.value === variant ? 'true' : 'false',
                    'aria-label': variantLabel(item, t),
                    title: variantLabel(item, t),
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: () =>
                      props.updateAttributes({
                        variant: item.value,
                        label: item.editable ? label : null,
                      }),
                  },
                  [
                    h('span', { class: ['divider divider-preview', `divider--${item.value}`] }, [
                      h('hr'),
                      item.editable || item.value === 'number'
                        ? [
                            h(
                              'span',
                              { class: 'divider__label' },
                              item.value === 'number' ? '1' : 'Aa'
                            ),
                            h('hr'),
                          ]
                        : null,
                    ]),
                  ]
                )
              )
            )
          : null;

      return h(
        NodeViewWrapper,
        {
          class: [
            'divider',
            `divider--${variant}`,
            { 'divider--selected': props.selected, 'divider--empty': editable && !label },
          ],
          'data-variant': variant,
          role: 'separator',
          'aria-label': t('editor.divider.tooltip'),
        },
        () => [h('hr'), labelNode, showLabel ? h('hr') : null, picker]
      );
    };
  },
});

/** `DividerCore` with the Vue node view: style picker and editable caption. */
export const Divider = /* @__PURE__ */ DividerCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(DividerNodeView);
  },
});
