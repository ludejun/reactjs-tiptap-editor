import { Node, mergeAttributes } from '@tiptap/core';

import type { ButtonViewParams } from '@/types';
import type { GeneralOptions } from '@/types';

export * from '@/extensions/Callout/calloutTypes';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attrs?: { type?: string; title?: string; body?: string }) => ReturnType;
    };
  }
}

export interface CalloutOptions extends GeneralOptions<CalloutOptions> {
  HTMLAttributes: Record<string, unknown>;
}

function getDatasetAttribute(attribute: string) {
  return (element: HTMLElement) => {
    return element.getAttribute(attribute);
  };
}

/**
 * The callout without a node view: renders through `renderHTML`, so it works
 * with any Tiptap binding. The React package extends it with the coloured
 * node view as `Callout`; the Vue layer does the same.
 */
export const CalloutCore = /* @__PURE__ */ Node.create<CalloutOptions>({
  name: 'callout',
  group: 'block',
  selectable: true,
  atom: true,
  draggable: true,
  inline: false,

  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'callout',
      },
      button: ({ editor, t }: ButtonViewParams<CalloutOptions>) => ({
        componentProps: {
          action: () => {
            return true;
          },
          isActive: () => editor.isActive('callout'),
          disabled: false,
          icon: 'Callout',
          tooltip: t('editor.callout.tooltip'),
        },
      }),
    };
  },

  parseHTML() {
    return [{ tag: 'div.callout' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes((this.options && this.options.HTMLAttributes) || {}, HTMLAttributes),
    ];
  },

  addAttributes() {
    return {
      type: {
        default: '',
        parseHTML: getDatasetAttribute('type'),
      },
      title: {
        default: '',
        parseHTML: getDatasetAttribute('title'),
      },
      body: {
        default: '',
        parseHTML: getDatasetAttribute('body'),
      },
    };
  },

  addCommands() {
    return {
      setCallout:
        (options) =>
        ({ chain }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs: options,
            })
            .run();
        },
    };
  },
});
