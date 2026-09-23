/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { ChevronDown, MoreHorizontal, X } from 'lucide-vue-next';
import {
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  type Component,
  type PropType,
  type Ref,
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

/**
 * Closes a menu, popover or dialog on a pointer press outside `root` and on
 * Escape, while `open` is true. Listeners are only attached while open.
 */
export function useDismiss(
  open: Ref<boolean>,
  root: Ref<HTMLElement | null>,
  close: () => void = () => {
    open.value = false;
  }
) {
  const onPointerDown = (event: PointerEvent) => {
    if (!root.value?.contains(event.target as Node)) close();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
    }
  };
  const detach = () => {
    document.removeEventListener('pointerdown', onPointerDown, true);
    document.removeEventListener('keydown', onKeyDown, true);
  };

  watch(
    open,
    (value) => {
      if (value) {
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
      } else {
        detach();
      }
    },
    { immediate: true }
  );
  onBeforeUnmount(detach);
}

/**
 * Positions a panel under its trigger with `position: fixed`, so it escapes
 * any `overflow` container it is rendered in (a scrollable menu, a clipped
 * card). The side it hangs from flips when it would run past the viewport
 * edge; `preferred` is read each time the panel opens. Scrolling closes it.
 */
export function useAnchoredPanel(
  open: Ref<boolean>,
  trigger: Ref<HTMLElement | null>,
  panel: Ref<HTMLElement | null>,
  preferred: () => 'start' | 'end' = () => 'start',
  close: () => void = () => {
    open.value = false;
  }
) {
  const side = ref<'start' | 'end'>(preferred());
  const anchor = ref<DOMRect | null>(null);
  const onScroll = (event: Event) => {
    if (!(event.target instanceof Node) || !panel.value?.contains(event.target)) close();
  };

  watch(open, (value) => {
    if (!value) {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
      return;
    }
    side.value = preferred();
    anchor.value = trigger.value?.getBoundingClientRect() ?? null;
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    void nextTick(() => {
      const rect = panel.value?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      if (side.value === 'start' && rect.right > window.innerWidth - margin) side.value = 'end';
      else if (side.value === 'end' && rect.left < margin) side.value = 'start';
    });
  });
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll, true);
    window.removeEventListener('resize', close);
  });

  const style = () => {
    const rect = anchor.value;
    if (!rect) return { position: 'fixed' as const };
    return {
      position: 'fixed' as const,
      top: `${rect.bottom + 4}px`,
      left: side.value === 'start' ? `${rect.left}px` : 'auto',
      right: side.value === 'end' ? `${window.innerWidth - rect.right}px` : 'auto',
      maxWidth: 'calc(100vw - 16px)',
      maxHeight: `${Math.max(120, window.innerHeight - rect.bottom - 12)}px`,
    };
  };

  return { side, style };
}

/**
 * Keeps an absolutely positioned panel on screen: once it is rendered, the
 * side it hangs from flips when it would run past the viewport edge. Returns
 * the current side; `preferred` is used each time the panel opens.
 */
export function useFlip(
  open: Ref<boolean>,
  panel: Ref<HTMLElement | null>,
  preferred: () => 'start' | 'end' = () => 'start'
): Ref<'start' | 'end'> {
  const side = ref<'start' | 'end'>(preferred());

  watch(open, (value) => {
    if (!value) return;
    side.value = preferred();
    void nextTick(() => {
      const rect = panel.value?.getBoundingClientRect();
      if (!rect) return;
      const margin = 8;
      if (side.value === 'start' && rect.right > window.innerWidth - margin) side.value = 'end';
      else if (side.value === 'end' && rect.left < margin) side.value = 'start';
    });
  });

  return side;
}

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
    const panel = ref<HTMLElement | null>(null);
    const { style } = useAnchoredPanel(open, root, panel);

    useDismiss(open, root);

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
                ref: panel,
                role: 'menu',
                class:
                  'richtext-z-50 richtext-flex richtext-max-h-72 richtext-flex-col richtext-gap-0.5 richtext-overflow-y-auto richtext-rounded-md richtext-border richtext-border-solid richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md',
                style: { ...style(), minWidth: props.width },
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
    const panel = ref<HTMLElement | null>(null);
    const side = useFlip(open, panel, () => 'end');

    useDismiss(open, root);

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
                ref: panel,
                class: [
                  'richtext-absolute richtext-top-10 richtext-z-20 richtext-flex richtext-max-h-[70vh] richtext-flex-col richtext-gap-3 richtext-overflow-y-auto richtext-rounded-xl richtext-border richtext-border-solid richtext-border-border richtext-bg-popover richtext-p-3 richtext-text-popover-foreground richtext-shadow-xl',
                  side.value === 'end' ? 'richtext-right-0' : 'richtext-left-0',
                ],
                style: { width: props.width, maxWidth: 'calc(100vw - 16px)' },
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
            { class: 'richtext-flex richtext-min-w-12 richtext-shrink-0 richtext-items-center' },
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

/**
 * A toolbar button that opens a small panel below it — the link editor, a
 * URL field, a colour palette. The slot receives `{ close }`; the panel also
 * closes on outside click and Escape. `open` is emitted each time it opens so
 * the content can read the editor state fresh.
 */
export const RichTextPopover = defineComponent({
  name: 'RichTextPopover',
  props: {
    icon: { type: [Object, Function] as PropType<Component>, default: undefined },
    label: { type: String, default: '' },
    tooltip: { type: String, default: '' },
    active: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    width: { type: String, default: '18rem' },
    align: { type: String as PropType<'start' | 'end'>, default: 'start' },
  },
  emits: ['open', 'close'],
  setup(props, { emit, slots, expose }) {
    const open = ref(false);
    const root = ref<HTMLElement | null>(null);
    const panel = ref<HTMLElement | null>(null);
    const close = () => {
      if (!open.value) return;
      open.value = false;
      emit('close');
    };
    const { style } = useAnchoredPanel(open, root, panel, () => props.align, close);

    useDismiss(open, root, close);
    expose({ close, open: () => (open.value = true) });

    return () =>
      h('div', { class: 'richtext-relative', ref: root }, [
        h(
          'button',
          {
            type: 'button',
            class: `${BUTTON} richtext-relative`,
            title: props.tooltip || props.label,
            'aria-label': props.tooltip || props.label,
            'aria-haspopup': 'dialog',
            'aria-expanded': open.value ? 'true' : 'false',
            'aria-pressed': props.active && !open.value ? 'true' : undefined,
            disabled: props.disabled,
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onClick: () => {
              if (open.value) close();
              else {
                open.value = true;
                emit('open');
              }
            },
          },
          [
            props.icon ? h(props.icon, { size: 16, 'aria-hidden': 'true' }) : null,
            props.label ? h('span', props.label) : null,
            slots.trigger?.(),
          ]
        ),
        open.value
          ? h(
              'div',
              {
                ref: panel,
                role: 'dialog',
                'aria-label': props.tooltip || props.label,
                class: 'richtext-vue-popover',
                style: { ...style(), width: props.width },
                // The editor must not see keys typed into the panel's fields.
                onKeydown: (event: KeyboardEvent) => event.stopPropagation(),
              },
              slots.default?.({ close })
            )
          : null,
      ]);
  },
});

/**
 * A modal for the larger editors (image, video, Katex, Mermaid). Rendered in
 * place, not teleported, so the editor's theme variables still apply. Closes
 * on Escape, on the backdrop and through the close button.
 */
export const RichTextDialog = defineComponent({
  name: 'RichTextDialog',
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, default: '' },
    width: { type: String, default: '40rem' },
    closeLabel: { type: String, default: 'Close' },
  },
  emits: ['update:open'],
  setup(props, { emit, slots }) {
    const panel = ref<HTMLElement | null>(null);
    const open = ref(props.open);
    const close = () => emit('update:open', false);

    watch(
      () => props.open,
      (value) => {
        open.value = value;
        if (value) {
          void nextTick(() => {
            const field = panel.value?.querySelector<HTMLElement>(
              'textarea, input:not([type=hidden]):not([type=file]), select, button'
            );
            field?.focus();
          });
        }
      },
      { immediate: true }
    );
    useDismiss(open, panel, close);

    return () =>
      props.open
        ? h(
            'div',
            {
              class: 'richtext-vue-dialog-backdrop',
              onMousedown: (event: MouseEvent) => {
                if (event.target === event.currentTarget) close();
              },
            },
            [
              h(
                'div',
                {
                  ref: panel,
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': props.title,
                  class: 'richtext-vue-dialog richtext-relative',
                  style: { maxWidth: props.width },
                  onKeydown: (event: KeyboardEvent) => event.stopPropagation(),
                },
                [
                  h('div', { class: 'richtext-flex richtext-items-center richtext-gap-2' }, [
                    props.title
                      ? h('h2', { class: 'richtext-vue-dialog__title' }, props.title)
                      : null,
                    h(
                      'button',
                      {
                        type: 'button',
                        class: `${BUTTON} richtext-ml-auto`,
                        'aria-label': props.closeLabel,
                        title: props.closeLabel,
                        onClick: close,
                      },
                      [h(X, { size: 16, 'aria-hidden': 'true' })]
                    ),
                  ]),
                  slots.default?.({ close }),
                  slots.footer
                    ? h('div', { class: 'richtext-vue-dialog__footer' }, slots.footer({ close }))
                    : null,
                ]
              ),
            ]
          )
        : null;
  },
});
