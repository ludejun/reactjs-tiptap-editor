/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import {
  NodeViewContent,
  NodeViewWrapper,
  VueNodeViewRenderer,
  nodeViewProps,
} from '@tiptap/vue-3';
import { Check, ChevronDown, Copy, Search, Trash2 } from 'lucide-vue-next';
import { defineComponent, h, onBeforeUnmount, ref, watch } from 'vue';

import { CodeBlockCore } from '@/extensions/CodeBlock/CodeBlock';
import { guessLanguage } from '@/extensions/CodeBlock/detect-language';
import { LIST_LANG, languageLabel } from '@/extensions/CodeBlock/languages';

import { useLocale } from '../context';

const AUTO_VALUE = '__auto__';
const COPIED_FEEDBACK_MS = 1500;

const toolbarButtonClass =
  'richtext-flex richtext-items-center richtext-justify-center richtext-rounded richtext-border-none richtext-bg-transparent richtext-p-1 richtext-text-[var(--shj-numbers)] richtext-transition-colors hover:richtext-text-[var(--shj-fg)] focus-visible:richtext-text-[var(--shj-fg)]';

const optionClass =
  'richtext-flex richtext-w-full richtext-items-center richtext-gap-3 richtext-rounded-sm !richtext-border-none !richtext-bg-transparent richtext-py-1.5 richtext-pl-2 richtext-pr-10 richtext-text-left richtext-text-sm richtext-text-foreground !richtext-outline-none richtext-transition-colors hover:!richtext-bg-accent';

/**
 * Same DOM and classes as the React `NodeViewCodeBlock`: the code with a
 * line-number gutter, and a hover toolbar with the language picker, copy and
 * delete. The picker is a positioned menu rather than a popover library.
 */
export const CodeBlockNodeView = defineComponent({
  name: 'CodeBlockNodeView',
  props: nodeViewProps,
  setup(props) {
    const { t } = useLocale();
    const languageOpen = ref(false);
    const query = ref('');
    const copied = ref(false);
    const toolbar = ref<HTMLElement | null>(null);
    const searchInput = ref<HTMLInputElement | null>(null);
    let copyTimer: ReturnType<typeof setTimeout> | undefined;

    const close = () => {
      languageOpen.value = false;
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!toolbar.value?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    watch(languageOpen, (open) => {
      if (open) {
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown);
        requestAnimationFrame(() => searchInput.value?.focus());
      } else {
        query.value = '';
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeyDown);
      }
    });

    onBeforeUnmount(() => {
      clearTimeout(copyTimer);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    });

    const onCopy = () => {
      void navigator.clipboard.writeText(props.node.textContent);
      copied.value = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copied.value = false;
      }, COPIED_FEEDBACK_MS);
    };

    const pick = (value: string) => {
      props.updateAttributes({ language: value === AUTO_VALUE ? null : value });
      close();
    };

    const option = (active: boolean, label: string, onSelect: () => void) =>
      h('button', { type: 'button', class: optionClass, onClick: onSelect }, [
        h('span', { class: '!richtext-min-w-[20px]' }, active ? [h(Check, { size: 16 })] : []),
        h('span', label),
      ]);

    return () => {
      const code = props.node.textContent;
      const explicitLanguage: string | null = props.node.attrs.language || null;

      // With no explicit choice, fall back to what the highlighter itself
      // guessed, so the label matches the colours on screen.
      let detected: string | null = null;

      if (!explicitLanguage) {
        const guess = guessLanguage(code);
        detected = guess === 'plain' ? null : guess;
      }

      const activeLanguage = explicitLanguage ?? detected ?? 'plain';
      const languageClassPrefix = props.extension.options.languageClassPrefix || 'language-';
      const lineCount = code.split('\n').length;

      const needle = query.value.trim().toLowerCase();
      const languages = LIST_LANG.filter(
        (value) =>
          !needle ||
          value.toLowerCase().includes(needle) ||
          languageLabel(value).toLowerCase().includes(needle)
      );
      const autoMatchesQuery =
        !needle ||
        'auto'.includes(needle) ||
        t('editor.codeblock.auto').toLowerCase().includes(needle);

      const menu = !languageOpen.value
        ? null
        : h(
            'div',
            {
              role: 'menu',
              class:
                'richtext-absolute richtext-right-0 richtext-top-full richtext-z-50 richtext-mt-1 richtext-w-[210px] richtext-rounded-md richtext-border richtext-border-solid richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md',
            },
            [
              h('div', { class: 'richtext-relative richtext-mb-1' }, [
                h(Search, {
                  class:
                    'richtext-pointer-events-none richtext-absolute richtext-left-2 richtext-top-1/2 richtext-size-3.5 -richtext-translate-y-1/2 richtext-text-muted-foreground',
                }),
                h('input', {
                  ref: searchInput,
                  class:
                    'richtext-h-7 richtext-w-full richtext-rounded-sm !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-transparent richtext-pl-7 richtext-pr-2 richtext-text-sm richtext-text-foreground !richtext-outline-none',
                  placeholder: t('editor.codeblock.search'),
                  value: query.value,
                  onInput: (event: Event) => {
                    query.value = (event.target as HTMLInputElement).value;
                  },
                  onKeydown: (event: KeyboardEvent) => event.stopPropagation(),
                }),
              ]),
              h('div', { class: 'richtext-max-h-[220px] richtext-overflow-auto' }, [
                autoMatchesQuery
                  ? option(
                      !explicitLanguage,
                      detected
                        ? `${t('editor.codeblock.auto')} · ${languageLabel(detected)}`
                        : t('editor.codeblock.auto'),
                      () => pick(AUTO_VALUE)
                    )
                  : null,
                ...languages.map((value) =>
                  option(explicitLanguage === value, languageLabel(value), () => pick(value))
                ),
                !languages.length && !autoMatchesQuery
                  ? h(
                      'div',
                      {
                        class:
                          'richtext-px-2 richtext-py-3 richtext-text-center richtext-text-sm richtext-text-muted-foreground',
                      },
                      t('editor.codeblock.noResult')
                    )
                  : null,
              ]),
            ]
          );

      return h(NodeViewWrapper, { class: 'richtext-code-block' }, () => [
        h('pre', { class: props.extension.options.HTMLAttributes?.class }, [
          h(NodeViewContent, { as: 'code', class: `${languageClassPrefix}${activeLanguage}` }),
        ]),

        h(
          'div',
          { 'aria-hidden': 'true', class: 'richtext-code-block__gutter', contenteditable: 'false' },
          Array.from({ length: lineCount }, (_, index) => h('span', { key: index }, index + 1))
        ),

        props.editor.isEditable
          ? h(
              'div',
              {
                ref: toolbar,
                class: 'richtext-code-block__toolbar',
                contenteditable: 'false',
                'data-open': languageOpen.value ? 'true' : 'false',
                onMousedown: (event: MouseEvent) => {
                  // Keep the editor's selection, but let the search field take focus.
                  if ((event.target as HTMLElement).tagName !== 'INPUT') event.preventDefault();
                },
              },
              [
                h('div', { class: 'richtext-relative' }, [
                  h(
                    'button',
                    {
                      type: 'button',
                      class: [
                        toolbarButtonClass,
                        'richtext-gap-0.5 richtext-px-1.5 richtext-text-xs',
                      ],
                      'aria-haspopup': 'menu',
                      'aria-expanded': languageOpen.value ? 'true' : 'false',
                      onClick: () => {
                        languageOpen.value = !languageOpen.value;
                      },
                    },
                    [
                      explicitLanguage
                        ? languageLabel(activeLanguage)
                        : `${languageLabel(activeLanguage)} · Auto`,
                      h(ChevronDown, { class: 'richtext-size-3', 'aria-hidden': 'true' }),
                    ]
                  ),
                  menu,
                ]),

                h(
                  'button',
                  {
                    type: 'button',
                    class: toolbarButtonClass,
                    'aria-label': t('editor.copyToClipboard'),
                    title: t('editor.copyToClipboard'),
                    onClick: onCopy,
                  },
                  [copied.value ? h(Check, { size: 14 }) : h(Copy, { size: 14 })]
                ),

                h(
                  'button',
                  {
                    type: 'button',
                    class: toolbarButtonClass,
                    'aria-label': t('editor.delete'),
                    title: t('editor.delete'),
                    onClick: () => props.deleteNode(),
                  },
                  [h(Trash2, { size: 14 })]
                ),
              ]
            )
          : null,
      ]);
    };
  },
});

/** `CodeBlockCore` with the Vue node view: language picker, copy, delete. */
export const CodeBlock = /* @__PURE__ */ CodeBlockCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(CodeBlockNodeView);
  },
});
