/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { ChevronDown, MoreHorizontal } from 'lucide-vue-next';
import {
  defineComponent,
  h,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType,
  type VNodeChild,
} from 'vue';

/**
 * Toolbar building blocks in Vue. They share the stylesheet with the React
 * controls (same `richtext-` classes), so a Vue toolbar looks like the React
 * one. Menus are plain positioned elements rather than a popover library, so
 * the Vue layer adds no UI dependency beyond the icons.
 */

const BUTTON =
  'richtext-inline-flex richtext-h-8 richtext-min-w-8 richtext-items-center richtext-justify-center richtext-gap-1 richtext-rounded-md richtext-border-0 richtext-bg-transparent richtext-px-1.5 richtext-text-sm richtext-text-foreground richtext-transition-colors hover:richtext-bg-accent disabled:richtext-pointer-events-none disabled:richtext-opacity-40 aria-pressed:richtext-bg-accent aria-expanded:richtext-bg-accent';

export const RichTextToolbar = defineComponent({
  name: 'RichTextToolbar',
  setup(_, { slots }) {
    return () =>
      h(
        'div',
        {
          role: 'toolbar',
          class:
            'richtext-flex richtext-flex-wrap richtext-items-center richtext-gap-0.5 richtext-border-0 richtext-border-b richtext-border-solid richtext-border-border richtext-bg-background richtext-px-2 richtext-py-1.5',
        },
        slots.default?.()
      );
  },
});

export const RichTextToolbarDivider = defineComponent({
  name: 'RichTextToolbarDivider',
  setup() {
    return () =>
      h('div', {
        'aria-hidden': 'true',
        class: 'richtext-mx-1 richtext-h-5 richtext-w-px richtext-shrink-0 richtext-bg-border',
      });
  },
});

export const RichTextToolbarButton = defineComponent({
  name: 'RichTextToolbarButton',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, default: undefined },
    label: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup(props, { emit, slots }) {
    return () =>
      h(
        'button',
        {
          type: 'button',
          class: BUTTON,
          title: props.tooltip || props.label,
          'aria-label': props.tooltip || props.label,
          'aria-pressed': props.active ? 'true' : undefined,
          disabled: props.disabled,
          // Keep the editor's selection: the toolbar never takes focus.
          onMousedown: (event: MouseEvent) => event.preventDefault(),
          onClick: () => emit('click'),
        },
        [
          props.icon ? h(props.icon, { size: 16, 'aria-hidden': 'true' }) : null,
          props.label ? h('span', props.label) : null,
          slots.default?.(),
        ]
      );
  },
});

export interface DropdownItem {
  value: string;
  label: string;
  active?: boolean;
  disabled?: boolean;
  /** Optional preview drawn before the label (a divider style, a heading size). */
  render?: () => VNodeChild;
}

/** A trigger and a list of items; closes on outside click and Escape. */
export const RichTextDropdown = defineComponent({
  name: 'RichTextDropdown',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, default: undefined },
    label: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    items: { type: Array as PropType<DropdownItem[]>, required: true },
    disabled: { type: Boolean, default: false },
    width: { type: String, default: '12rem' },
  },
  emits: ['select'],
  setup(props, { emit }) {
    const open = ref(false);
    const root = ref<HTMLElement | null>(null);

    const onPointerDown = (event: PointerEvent) => {
      if (!root.value?.contains(event.target as Node)) open.value = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') open.value = false;
    };

    watch(open, (value) => {
      if (value) {
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
      } else {
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeyDown);
      }
    });
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    });

    return () =>
      h('div', { class: 'richtext-relative', ref: root }, [
        h(
          'button',
          {
            type: 'button',
            class: BUTTON,
            title: props.tooltip || props.label,
            'aria-label': props.tooltip || props.label,
            'aria-haspopup': 'menu',
            'aria-expanded': open.value ? 'true' : 'false',
            disabled: props.disabled,
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onClick: () => {
              open.value = !open.value;
            },
          },
          [
            props.icon ? h(props.icon, { size: 16, 'aria-hidden': 'true' }) : null,
            props.label
              ? h('span', { class: 'richtext-max-w-32 richtext-truncate' }, props.label)
              : null,
            h(ChevronDown, { size: 12, class: 'richtext-text-zinc-500', 'aria-hidden': 'true' }),
          ]
        ),
        open.value
          ? h(
              'div',
              {
                role: 'menu',
                class:
                  'richtext-absolute richtext-left-0 richtext-top-9 richtext-z-50 richtext-flex richtext-max-h-72 richtext-flex-col richtext-gap-0.5 richtext-overflow-y-auto richtext-rounded-md richtext-border richtext-border-solid richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md',
                style: { minWidth: props.width },
              },
              props.items.map((item) =>
                h(
                  'button',
                  {
                    type: 'button',
                    role: 'menuitemradio',
                    key: item.value,
                    'aria-checked': item.active ? 'true' : 'false',
                    disabled: item.disabled,
                    class:
                      'richtext-flex richtext-w-full richtext-items-center richtext-gap-3 richtext-rounded-sm richtext-border-0 richtext-bg-transparent richtext-px-2 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground hover:richtext-bg-accent disabled:richtext-opacity-40 aria-checked:richtext-bg-accent/60',
                    onMousedown: (event: MouseEvent) => event.preventDefault(),
                    onClick: () => {
                      open.value = false;
                      emit('select', item.value);
                    },
                  },
                  [item.render?.(), h('span', { class: 'richtext-truncate' }, item.label)]
                )
              )
            )
          : null,
      ]);
  },
});

/** Everything that does not earn a slot in the top row, shown with labels. */
export const RichTextToolbarMore = defineComponent({
  name: 'RichTextToolbarMore',
  props: {
    label: { type: String, default: 'More' },
    width: { type: String, default: '440px' },
  },
  setup(props, { slots }) {
    const open = ref(false);
    const root = ref<HTMLElement | null>(null);

    const onPointerDown = (event: PointerEvent) => {
      if (!root.value?.contains(event.target as Node)) open.value = false;
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') open.value = false;
    };

    watch(open, (value) => {
      if (value) {
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
      } else {
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeyDown);
      }
    });
    onBeforeUnmount(() => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    });

    return () =>
      h('div', { class: 'richtext-relative', ref: root }, [
        h(
          'button',
          {
            type: 'button',
            class: BUTTON,
            title: props.label,
            'aria-label': props.label,
            'aria-haspopup': 'true',
            'aria-expanded': open.value ? 'true' : 'false',
            onClick: () => {
              open.value = !open.value;
            },
          },
          [h(MoreHorizontal, { size: 16, 'aria-hidden': 'true' })]
        ),
        open.value
          ? h(
              'div',
              {
                class:
                  'richtext-absolute richtext-right-0 richtext-top-10 richtext-z-20 richtext-flex richtext-max-h-[70vh] richtext-flex-col richtext-gap-3 richtext-overflow-y-auto richtext-rounded-xl richtext-border richtext-border-solid richtext-border-border richtext-bg-popover richtext-p-3 richtext-text-popover-foreground richtext-shadow-xl',
                style: { width: props.width },
              },
              slots.default?.()
            )
          : null,
      ]);
  },
});

export const RichTextToolbarMoreGroup = defineComponent({
  name: 'RichTextToolbarMoreGroup',
  props: { label: { type: String, required: true } },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'richtext-flex richtext-flex-col richtext-gap-0.5' }, [
        h(
          'span',
          {
            class:
              'richtext-px-1 richtext-pb-0.5 richtext-text-[11px] richtext-font-medium richtext-uppercase richtext-tracking-wide richtext-text-muted-foreground',
          },
          props.label
        ),
        h(
          'div',
          { class: 'richtext-grid richtext-grid-cols-2 richtext-gap-x-2' },
          slots.default?.()
        ),
      ]);
  },
});

export const RichTextToolbarMoreRow = defineComponent({
  name: 'RichTextToolbarMoreRow',
  props: { label: { type: String, required: true } },
  setup(props, { slots }) {
    const row = ref<HTMLElement | null>(null);

    return () =>
      h(
        'div',
        {
          ref: row,
          class:
            'richtext-flex richtext-min-w-0 richtext-items-center richtext-gap-1.5 richtext-rounded-md richtext-pr-1 hover:richtext-bg-accent/60',
        },
        [
          h(
            'span',
            { class: 'richtext-flex richtext-w-12 richtext-shrink-0 richtext-items-center' },
            slots.default?.()
          ),
          h(
            'span',
            {
              class:
                'richtext-min-w-0 richtext-flex-1 richtext-cursor-default richtext-truncate richtext-text-[13px] richtext-leading-5 richtext-text-foreground',
              title: props.label,
              onClick: () => row.value?.querySelector('button')?.click(),
            },
            props.label
          ),
        ]
      );
  },
});
