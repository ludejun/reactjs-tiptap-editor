import { Extension } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { ReactRenderer } from '@tiptap/react';

import { AIPanel } from './AIPanel';
import { markdownToSlice } from './markdown';

import type { AIOptions, AIPanelComponentProps } from './types';

export type {
  AIOptions,
  AIProtocol,
  AIMessage,
  AIRequest,
  AIResultContext,
  AIPanelComponentProps,
} from './types';
export {
  markdownToFragment,
  markdownToHTML,
  markdownToPreviewHTML,
  markdownToSlice,
} from './markdown';

import { aiPluginKey, type AISession } from './state';
export { aiPluginKey } from './state';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      openAI: (prompt?: string) => ReturnType;
      closeAI: () => ReturnType;
      /** Replaces the AI range with `markdown`, parsed through the editor schema. */
      applyAI: (markdown: string) => ReturnType;
    };
  }
}

export const AI = Extension.create<AIOptions>({
  name: 'ai',
  addOptions() {
    return {
      protocol: 'openai',
      apiKey: '',
      baseURL: '',
      model: '',
      maxTokens: 2048,
      headers: {},
      generate: null,
      stream: true,
      systemPrompt:
        'You are a writing assistant inside a text editor. Follow the user’s instructions. Reply in the user’s language. Return only the final text, without commentary or HTML/Markdown formatting.',
      enableImageInput: true,
      enableFileInput: true,
      imageMimes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      fileMimes: ['text/plain', 'text/markdown', 'text/csv', 'application/json'],
      maxAttachmentSize: 1024 * 1024 * 4, // 4MB
      // Most widely spoken first, so the common choice is at the top.
      // Empty: "Translate" targets the reader's browser language. Set a list to
      // get a submenu of fixed targets instead.
      translateLanguages: [],
    };
  },
  addCommands() {
    return {
      openAI:
        (prompt) =>
        ({ editor, tr, dispatch }) => {
          if (!editor.isEditable || !tr.selection.$from.parent.isTextblock) return false;
          if (dispatch)
            tr.setMeta(aiPluginKey, {
              from: tr.selection.from,
              to: tr.selection.to,
              prompt,
            });
          return true;
        },
      closeAI:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch) tr.setMeta(aiPluginKey, null);
          return true;
        },
      applyAI:
        (markdown) =>
        ({ editor, state, tr, dispatch }) => {
          const range = aiPluginKey.getState(state);
          if (!editor.isEditable || !range || !markdown.trim()) return false;
          if (dispatch) {
            // Parsed through the schema: headings, lists, tables and code
            // blocks become real nodes; anything the schema does not know,
            // including any markup the model may have produced, is dropped.
            tr.replaceRange(range.from, range.to, markdownToSlice(editor, markdown));
            tr.setMeta(aiPluginKey, null).scrollIntoView();
          }
          return true;
        },
    };
  },
  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;
    let mount: HTMLElement | null = null;
    return [
      new Plugin<AISession | null>({
        key: aiPluginKey,
        state: {
          init: () => null,
          apply(tr, previous) {
            const action = tr.getMeta(aiPluginKey);
            if (action !== undefined) return action;
            // A document edit invalidates the preview, including remote collaborative edits.
            return tr.docChanged ? null : previous;
          },
        },
        props: {
          decorations(state) {
            const range = aiPluginKey.getState(state);
            if (!range) return DecorationSet.empty;
            const $pos = state.doc.resolve(range.to);
            const decorations: Decoration[] = [];
            if (range.from !== range.to) {
              decorations.push(
                Decoration.inline(range.from, range.to, {
                  class: 'richtext-ai-selection',
                })
              );
            } else if ($pos.depth) {
              decorations.push(
                Decoration.node($pos.before(), $pos.after(), {
                  class:
                    $pos.parent.content.size === 0
                      ? 'richtext-ai-empty-anchor'
                      : 'richtext-ai-selection',
                })
              );
            }
            // A block widget participates in editor layout but is excluded from its
            // document/HTML/history. Long previews push following content down.
            decorations.push(
              Decoration.widget(
                $pos.depth ? $pos.after() : range.to,
                () => {
                  mount = editor.view.dom.ownerDocument.createElement('div');
                  mount.className = 'richtext-ai-mount';
                  mount.contentEditable = 'false';
                  return mount;
                },
                {
                  key: 'ai-panel',
                  side: -1,
                  stopEvent: () => true,
                  ignoreSelection: true,
                }
              )
            );
            return DecorationSet.create(state.doc, decorations);
          },
        },
        view(view) {
          let renderer: ReactRenderer<unknown, AIPanelComponentProps> | null = null;
          const Panel = options.components?.Panel ?? AIPanel;
          let current: AISession | null = null;
          function destroy() {
            renderer?.destroy();
            renderer?.element.remove();
            renderer = null;
          }
          function update() {
            const next = editor.isEditable ? (aiPluginKey.getState(view.state) ?? null) : null;
            if (next === current) return;
            current = next;
            destroy();
            if (!next) return;
            renderer = new ReactRenderer(Panel, {
              editor,
              props: {
                editor,
                options,
                initialPrompt: next.prompt,
                selectedText: view.state.doc.textBetween(next.from, next.to, '\n'),
                close: () => {
                  editor.commands.closeAI();
                  editor.commands.focus();
                },
                apply: (markdown: string) => {
                  if (editor.commands.applyAI(markdown)) editor.commands.focus();
                },
              },
            });
            mount?.appendChild(renderer.element);
          }
          return { update, destroy };
        },
      }),
    ];
  },
});
