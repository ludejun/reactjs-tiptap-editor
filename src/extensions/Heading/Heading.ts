import { Heading as TiptapHeading } from '@tiptap/extension-heading';
import { Plugin, PluginKey, Selection } from '@tiptap/pm/state';

import { HEADINGS } from '@/constants';

import type { GeneralOptions } from '@/types';
import type { HeadingOptions as TiptapHeadingOptions } from '@tiptap/extension-heading';
import type {} from '@tiptap/extension-paragraph';

export * from '@/extensions/Heading/components/RichTextHeading';

export interface HeadingOptions extends TiptapHeadingOptions, GeneralOptions<HeadingOptions> {}

export const Heading = /* @__PURE__ */ TiptapHeading.extend<HeadingOptions>({
  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      levels: HEADINGS.filter((level) => level !== 'Paragraph'),
      button({ editor, extension, t }) {
        const levels = ['Paragraph' as const, ...(extension.options?.levels || [])];

        const items = levels.map((level) => {
          const isDefault = level === 'Paragraph';

          return {
            action: () => {
              if (isDefault) {
                const currentActiveLevel = levels.find((lvl) =>
                  editor.isActive('heading', { level: lvl })
                );
                if (currentActiveLevel && currentActiveLevel !== 'Paragraph') {
                  editor.commands.toggleHeading({ level: currentActiveLevel });
                }
                return;
              }
              editor.commands.toggleHeading({ level });
            },
            isActive: () => {
              if (isDefault) {
                return false;
              }

              return editor.isActive('heading', { level }) || false;
            },
            disabled:
              level === 'Paragraph'
                ? !editor.can().setParagraph()
                : !editor.can().toggleHeading({ level }),
            title: isDefault
              ? t('editor.paragraph.tooltip')
              : t(`editor.heading.h${level}.tooltip`),
            level,
            shortcutKeys: (level === 'Paragraph'
              ? undefined
              : extension.options.shortcutKeys?.[level]) ?? ['alt', 'mod', `${level}`],
            default: isDefault,
          };
        });

        const disabled = items.filter((k) => k.disabled).length === items.length;

        return {
          // component: HeadingButton,
          componentProps: {
            tooltip: t('editor.heading.tooltip'),
            disabled,
            items,
            icon: 'MenuDown',
            isActive: () => {
              const find = items?.find((k) => k.isActive());

              if (find && !find.default) {
                return find;
              }
              const item = {
                title: t('editor.paragraph.tooltip'),
                level: 0,
                isActive: () => false,
              };
              return item;
            },
            levels,
          },
        };
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      ...(this.parent?.() ?? []),
      new Plugin({
        key: new PluginKey('headingGapClick'),
        props: {
          handleDOMEvents: {
            /**
             * A heading carries a large top margin, and a click in that margin
             * hits the editor root rather than any block. The browser then
             * resolves it to the nearest text, which is the end of the block
             * above — so the caret lands in the wrong paragraph. Clicks in the
             * gap go to the start of the block below instead, the block the
             * margin belongs to.
             */
            mousedown(view, event) {
              if (event.target !== view.dom || event.button !== 0) {
                return false;
              }

              for (const child of Array.from(view.dom.children)) {
                const rect = child.getBoundingClientRect();

                if (rect.bottom > event.clientY) {
                  if (rect.top <= event.clientY) {
                    // Inside a block's own box: ProseMirror knows better.
                    return false;
                  }

                  const pos = view.posAtDOM(child, 0);
                  const selection = Selection.near(view.state.doc.resolve(pos), 1);

                  view.dispatch(view.state.tr.setSelection(selection));
                  view.focus();
                  event.preventDefault();

                  return true;
                }
              }

              return false;
            },
          },
        },
      }),
    ];
  },
});
