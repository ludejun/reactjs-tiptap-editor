/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { defineComponent, h, onBeforeUnmount, shallowRef } from 'vue';

import {
  TableOfContentsCore,
  TableOfContentsNodeCore,
} from '@/extensions/TableOfContents/TableOfContents';
import {
  readTableOfContents,
  scrollToTableOfContentsItem,
  tableOfContentsIndexLabel,
} from '@/extensions/TableOfContents/toc';

import { useLocale } from '../context';

/**
 * Same DOM and classes as the React `NodeViewTableOfContents`: the headings the
 * `tableOfContents` extension collects, numbered "1.2.3", each a button that
 * scrolls its heading into view. Re-reads the list after every transaction,
 * since headings elsewhere in the document change it.
 */
export const TableOfContentsNodeView = defineComponent({
  name: 'TableOfContentsNodeView',
  props: nodeViewProps,
  setup(props) {
    const { t } = useLocale();
    const items = shallowRef(readTableOfContents(props.editor));
    const update = () => {
      items.value = readTableOfContents(props.editor);
    };

    props.editor.on('transaction', update);
    onBeforeUnmount(() => props.editor.off('transaction', update));

    return () =>
      h(
        NodeViewWrapper,
        {
          class: ['table-of-contents', { 'is-selected': props.selected }],
          contenteditable: 'false',
          'data-type': 'table-of-contents',
        },
        () => [
          h('p', { class: 'table-of-contents__title' }, t('editor.tableofcontents.title')),
          items.value.length === 0
            ? h('p', { class: 'table-of-contents__empty' }, t('editor.tableofcontents.empty'))
            : h(
                'ul',
                { class: 'table-of-contents__list' },
                items.value.map((item, index) =>
                  h(
                    'li',
                    {
                      key: item.id ?? `${item.pos}`,
                      class: 'table-of-contents__item',
                      style: { '--toc-level': String(item.level) },
                    },
                    [
                      h(
                        'button',
                        {
                          type: 'button',
                          class: ['table-of-contents__link', { 'is-active': item.isActive }],
                          onClick: () => scrollToTableOfContentsItem(props.editor, item),
                        },
                        [
                          h(
                            'span',
                            { class: 'table-of-contents__index' },
                            tableOfContentsIndexLabel(items.value, index)
                          ),
                          h('span', { class: 'table-of-contents__text' }, item.textContent),
                        ]
                      ),
                    ]
                  )
                )
              ),
        ]
      );
  },
});

/** `TableOfContentsNodeCore` with the Vue node view: the live heading list. */
export const TableOfContentsNode = /* @__PURE__ */ TableOfContentsNodeCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(TableOfContentsNodeView);
  },
});

/** `TableOfContentsCore` registering the Vue `TableOfContentsNode`. */
export const TableOfContents = /* @__PURE__ */ TableOfContentsCore.extend({
  addExtensions() {
    return [
      TableOfContentsNode.configure({
        HTMLAttributes: this.options.HTMLAttributes,
      }),
    ];
  },
});
