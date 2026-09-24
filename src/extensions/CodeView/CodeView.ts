import { Extension } from '@tiptap/core';

import type { GeneralOptions } from '@/types';
import type { Editor } from '@tiptap/core';

export interface CodeViewOptions extends GeneralOptions<CodeViewOptions> {
  isCodeViewMode?: boolean;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    codeView: {
      /**
       * Toggle code view mode
       */
      toggleCodeView: () => ReturnType;
    };
  }
}

export const CodeView = /* @__PURE__ */ Extension.create<CodeViewOptions>({
  name: 'codeView',
  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      button({ editor, t }: { editor: Editor; t: (path: string) => string }) {
        return {
          componentProps: {
            action: () => {
              editor.commands.toggleCodeView();
            },
            isActive: () => {
              //@ts-expect-error
              return editor.storage.codeView.isActive;
            },
            disabled: false,
            icon: 'Html',
            tooltip: t('editor.codeView.tooltip') || 'View HTML Code',
            customClass: 'tiptap-code-view-button',
          },
        };
      },
    };
  },

  addStorage() {
    return {
      isActive: false,
      originalContent: '',
    };
  },

  addCommands() {
    return {
      toggleCodeView:
        () =>
        ({ editor, commands }) => {
          // `commands.setContent` runs inside this command's transaction; calling
          // `editor.commands.setContent` here would dispatch a second transaction
          // against a state that has already moved on ("mismatched transaction").
          const storage = (editor.storage as unknown as Record<string, unknown>).codeView as {
            isActive: boolean;
            originalContent: string;
          };

          if (!storage.isActive) {
            const htmlContent = editor.getHTML();
            storage.originalContent = htmlContent;

            const escapedHtml = htmlContent
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');

            storage.isActive = true;

            return commands.setContent(
              `<div class="tiptap-code-view-wrapper">${escapedHtml}</div>`
            );
          }

          storage.isActive = false;

          return commands.setContent(editor.getText());
        },
    };
  },
});
