import { Node, mergeAttributes, nodeInputRule } from '@tiptap/core';
import { NodeSelection } from '@tiptap/pm/state';

import { getDatasetAttribute } from '@/utils/dom-dataset';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    iframe: {
      /**
       * Add an iframe
       */
      setIframe: (options: {
        src: string;
        /** Service key from `EMBED_SERVICES` (`youtube`, `figma`…); `iframe` for a plain page. */
        service?: string;
        width?: number | string;
        height?: number | string;
      }) => ReturnType;
    };
  }
}

/**
 * The iframe without a node view: renders through `renderHTML`, so it works
 * with any Tiptap binding. The React package extends it with the resizable
 * node view as `Iframe`; the Vue layer does the same.
 */
export const IframeCore = /* @__PURE__ */ Node.create({
  name: 'iframe',
  content: '',
  marks: '',
  group: 'block',
  selectable: true,
  atom: true,
  draggable: true,
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'iframe',
      },
      button: ({
        editor,
        extension,
        t,
      }: {
        editor: import('@tiptap/core').Editor;
        extension: { options: { upload?: (file: File) => Promise<string> } };
        t: (key: string) => string;
      }) => ({
        componentProps: {
          action: (options: { src: string; service?: string }) =>
            editor.commands.setIframe(options),
          upload: extension.options.upload,
          // isActive: () => editor.can().setIframe({}),
          icon: 'Iframe',
          tooltip: t('editor.iframe.tooltip'),
        },
      }),
    };
  },

  addAttributes() {
    return {
      width: {
        default: 600,
        parseHTML: getDatasetAttribute('width'),
      },
      height: {
        default: 300,
        parseHTML: getDatasetAttribute('height'),
      },
      src: {
        default: null,
        parseHTML: getDatasetAttribute('src'),
      },
      /** Which service the frame shows, for styling and labels; `iframe` for a plain page. */
      service: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-service'),
        renderHTML: (attributes) =>
          attributes.service ? { 'data-service': attributes.service } : {},
      },
      defaultShowPicker: {
        default: false,
      },
      frameborder: {
        default: 0,
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['iframe', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setIframe:
        (options) =>
        ({ tr, commands, chain }) => {
          if (tr.selection instanceof NodeSelection && tr.selection.node.type.name === this.name) {
            return commands.updateAttributes(this.name, options);
          }

          const attrs = options || { url: '' };
          // const { selection } = editor.state

          return chain()
            .insertContent({
              type: this.name,
              attrs,
            })
            .run();
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: /^\$iframe\$$/,
        type: this.type,
        getAttributes: () => {
          return { width: '100%' };
        },
      }),
    ];
  },
});
