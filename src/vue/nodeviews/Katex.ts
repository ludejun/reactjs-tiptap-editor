/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { defineComponent, h, ref, shallowRef, watch } from 'vue';

import { KatexCore } from '@/extensions/Katex/Katex';
import { loadKatex } from '@/extensions/Katex/katex-loader';
import { safeJSONParse } from '@/utils/json';

import type { KatexLoader, KatexRenderer } from '@/extensions/Katex/katex-loader';

function decode(value: unknown) {
  const text = typeof value === 'string' ? value : '';
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

/**
 * Same DOM as the React `KatexNodeView`: the formula rendered by KaTeX, loaded
 * through the extension's `loadKatex` option (or `import('katex')`), with the
 * raw text as the placeholder while loading and as the fallback on a bad
 * formula, and a retry button if KaTeX itself fails to load.
 */
export const KatexNodeView = defineComponent({
  name: 'KatexNodeView',
  props: nodeViewProps,
  setup(props) {
    const renderer = shallowRef<KatexRenderer | null>(null);
    const failed = ref(false);
    const attempt = ref(0);
    let generation = 0;

    const load = () => {
      const current = ++generation;
      const loader = props.extension.options.loadKatex as KatexLoader | undefined;

      renderer.value = null;
      failed.value = false;
      void loadKatex(loader)
        .then((instance) => {
          if (current === generation) renderer.value = instance;
        })
        .catch(() => {
          if (current === generation) failed.value = true;
        });
    };

    watch([() => props.extension.options.loadKatex, attempt], load, { immediate: true });

    return () => {
      const text = decode(props.node.attrs.text);
      const macros = decode(props.node.attrs.macros);
      const wrap = (children: unknown[]) =>
        h(NodeViewWrapper, { as: 'span', style: { display: 'inline-block' } }, () => children);

      if (!text.trim()) {
        return wrap([h('span', { contenteditable: 'false' }, 'Not enter a formula')]);
      }

      if (failed.value) {
        return wrap([
          h('span', { contenteditable: 'false', role: 'alert' }, [
            `${text} `,
            h(
              'button',
              {
                type: 'button',
                onClick: () => {
                  attempt.value += 1;
                },
              },
              'Retry formula'
            ),
          ]),
        ]);
      }

      let html: string | null = null;

      if (renderer.value) {
        try {
          html = renderer.value.renderToString(text, {
            macros: safeJSONParse<NonNullable<import('katex').KatexOptions['macros']>>(macros),
          });
        } catch {
          html = null;
        }
      }

      // Invalid formulas and loading placeholders are text, never untrusted HTML.
      return wrap([
        html === null
          ? h(
              'span',
              { contenteditable: 'false', 'aria-busy': renderer.value ? 'false' : 'true' },
              text
            )
          : h('span', { contenteditable: 'false', innerHTML: html }),
      ]);
    };
  },
});

/** `KatexCore` with the Vue node view: the rendered formula. */
export const Katex = /* @__PURE__ */ KatexCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(KatexNodeView);
  },
});
