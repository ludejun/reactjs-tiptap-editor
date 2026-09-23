import { Extension } from '@tiptap/core';
import { AllSelection, Plugin } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { markdownToSlice } from './markdown';
import { aiPluginKey, type AIAction, type AIState } from './state';

import type { AIOptions, AIPanelComponentProps } from './types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    ai: {
      /** Opens the Ask-AI panel on the selection, or at the caret. */
      openAI: (prompt?: string) => ReturnType;
      closeAI: () => ReturnType;
      /** Replaces the AI range with `markdown`, parsed through the editor schema. */
      applyAI: (markdown: string) => ReturnType;
      /** Shows or hides the composer dock (`RichTextAIComposer`) under the editor. */
      toggleAIComposer: (open?: boolean) => ReturnType;
    };
  }
}

export const DEFAULT_AI_SYSTEM_PROMPT =
  'You are a writing assistant inside a rich-text editor. Follow the user’s instructions. Reply in the user’s language. Return only the final text, formatted as Markdown where structure helps (headings, lists, tables, task lists, code blocks); never add commentary, preamble or explanations.';

/**
 * The framework-free half of the AI extension: the session state, the
 * decorations that mark what AI is working on, the commands, and the
 * keyboard entry points. The panel UI is mounted through `mountPanel`, which
 * the React and Vue extensions supply.
 */
export const AICore = Extension.create<AIOptions>({
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
      systemPrompt: DEFAULT_AI_SYSTEM_PROMPT,
      mountPanel: null,
      enableImageInput: true,
      enableFileInput: true,
      imageMimes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
      fileMimes: ['text/plain', 'text/markdown', 'text/csv', 'application/json'],
      maxAttachmentSize: 1024 * 1024 * 4, // 4MB
      // Empty: "Translate" targets the reader's browser language. Set a list to
      // get a submenu of fixed targets instead.
      translateLanguages: [],
      spaceTrigger: true,
      documentContext: 12000,
    };
  },
  addCommands() {
    return {
      openAI:
        (prompt) =>
        ({ editor, tr, dispatch }) => {
          const { selection } = tr;
          // A caret needs a textblock to anchor the panel; a selection can
          // span anything, including the whole document after Select All.
          if (!editor.isEditable || (selection.empty && !selection.$from.parent.isTextblock))
            return false;
          if (dispatch)
            tr.setMeta(aiPluginKey, {
              type: 'session',
              session: { from: selection.from, to: selection.to, prompt },
            } satisfies AIAction);
          return true;
        },
      closeAI:
        () =>
        ({ tr, dispatch }) => {
          if (dispatch)
            tr.setMeta(aiPluginKey, { type: 'session', session: null } satisfies AIAction);
          return true;
        },
      applyAI:
        (markdown) =>
        ({ editor, state, tr, dispatch }) => {
          const range = aiPluginKey.getState(state)?.session;
          if (!editor.isEditable || !range || !markdown.trim()) return false;
          if (dispatch) {
            // Parsed through the schema: headings, lists, tables and code
            // blocks become real nodes; anything the schema does not know,
            // including any markup the model may have produced, is dropped.
            tr.replaceRange(range.from, range.to, markdownToSlice(editor, markdown));
            tr.setMeta(aiPluginKey, { type: 'session', session: null } satisfies AIAction);
            tr.scrollIntoView();
          }
          return true;
        },
      toggleAIComposer:
        (open) =>
        ({ state, tr, dispatch }) => {
          const current = aiPluginKey.getState(state)?.composer ?? false;
          const next = open ?? !current;
          if (next === current) return true;
          if (dispatch)
            tr.setMeta(aiPluginKey, { type: 'composer', open: next } satisfies AIAction);
          return true;
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      // Notion's entry point: Space on an empty line asks AI.
      Space: ({ editor }) => {
        if (!this.options.spaceTrigger) return false;
        const { $from, empty } = editor.state.selection;
        if (!empty || !$from.parent.isTextblock || $from.parent.content.size > 0) return false;
        if ($from.parent.type.spec.code) return false;
        return editor.commands.openAI();
      },
      'Mod-j': ({ editor }) => editor.commands.toggleAIComposer(),
    };
  },
  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;
    let mount: HTMLElement | null = null;
    return [
      new Plugin<AIState>({
        key: aiPluginKey,
        state: {
          init: () => ({ session: null, writing: null, composer: false }),
          apply(tr, previous) {
            const action = tr.getMeta(aiPluginKey) as AIAction | undefined;
            let next = previous;
            if (action?.type === 'session') next = { ...next, session: action.session };
            else if (action?.type === 'writing') next = { ...next, writing: action.writing };
            else if (action?.type === 'composer') next = { ...next, composer: action.open };

            if (tr.docChanged) {
              // A document edit invalidates the preview, including remote
              // collaborative edits. The span being written moves with the
              // edit instead, unless the writer itself set it just now.
              if (action?.type !== 'session') next = { ...next, session: null };
              if (action?.type !== 'writing' && next.writing) {
                next = {
                  ...next,
                  writing: {
                    from: tr.mapping.map(next.writing.from, -1),
                    to: tr.mapping.map(next.writing.to, 1),
                  },
                };
              }
            }
            return next;
          },
        },
        props: {
          decorations(state) {
            const { session, writing } = aiPluginKey.getState(state) ?? {};
            const decorations: Decoration[] = [];
            if (writing) {
              decorations.push(
                Decoration.inline(writing.from, writing.to, { class: 'richtext-ai-writing' }),
                Decoration.widget(
                  writing.to,
                  () => {
                    const caret = document.createElement('span');
                    caret.className = 'richtext-ai-writing-caret';
                    caret.setAttribute('aria-hidden', 'true');
                    return caret;
                  },
                  { key: 'ai-writing-caret', side: 1, ignoreSelection: true }
                )
              );
            }
            if (!session) {
              return decorations.length
                ? DecorationSet.create(state.doc, decorations)
                : DecorationSet.empty;
            }
            const $pos = state.doc.resolve(session.to);
            if (session.from !== session.to) {
              decorations.push(
                Decoration.inline(session.from, session.to, {
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
                $pos.depth ? $pos.after() : session.to,
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
          let unmount: (() => void) | null = null;
          let current: AIState['session'] = null;
          function destroy() {
            unmount?.();
            unmount = null;
          }
          function update() {
            const next = editor.isEditable
              ? (aiPluginKey.getState(view.state)?.session ?? null)
              : null;
            if (next === current) return;
            current = next;
            destroy();
            if (!next || !mount || !options.mountPanel) return;
            const props: AIPanelComponentProps = {
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
            };
            unmount = options.mountPanel(mount, props);
          }
          return { update, destroy };
        },
      }),
    ];
  },
});

/** Whole-document selection, as produced by Select All. */
export function isAllSelection(selection: unknown): selection is AllSelection {
  return selection instanceof AllSelection;
}
