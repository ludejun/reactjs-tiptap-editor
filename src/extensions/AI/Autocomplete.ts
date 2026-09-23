import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

import { generateAIText } from './client';
import { aiPluginKey } from './state';
import { aiOptionsOf } from './writer';

import type { Editor } from '@tiptap/core';

export interface AIAutocompleteOptions {
  /** Start with suggestions on. `toggleAIAutocomplete()` flips it at runtime. */
  enabled: boolean;
  /** Quiet time after the last keystroke before asking, in milliseconds. */
  delay: number;
  /** The current block needs at least this many characters before asking. */
  minChars: number;
  /** How much text before the caret is sent, in characters. */
  contextChars: number;
  /** Cap on the suggestion length; a phrase, not a paragraph. */
  maxTokens: number;
  /** The instruction sent with the context. */
  prompt: string;
}

export interface AISuggestion {
  /** Where the ghost text sits; the caret position at the time of asking. */
  pos: number;
  text: string;
}

export interface AIAutocompleteState {
  enabled: boolean;
  suggestion: AISuggestion | null;
}

type Action =
  | { type: 'enabled'; enabled: boolean }
  | { type: 'suggestion'; suggestion: AISuggestion | null };

export const aiAutocompleteKey = new PluginKey<AIAutocompleteState>('richtextAIAutocomplete');

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiAutocomplete: {
      /** Turns ghost-text suggestions on or off. */
      toggleAIAutocomplete: (enabled?: boolean) => ReturnType;
      /** Inserts the current suggestion (what Tab does). */
      acceptAISuggestion: () => ReturnType;
      /** Removes the current suggestion (what Escape does). */
      dismissAISuggestion: () => ReturnType;
    };
  }
}

/** Whether the caret is somewhere a continuation makes sense. */
function continuable(state: EditorState, minChars: number): boolean {
  const { $from, empty } = state.selection;
  if (!empty || !$from.parent.isTextblock || $from.parent.type.spec.code) return false;
  if ($from.parentOffset !== $from.parent.content.size) return false;
  return $from.parent.textContent.trim().length >= minChars;
}

/**
 * Copilot-style ghost text: after a pause in typing at the end of a block,
 * the model proposes the next few words in grey. Tab accepts, Escape or any
 * edit discards. Uses the `AI` extension's transport, so it costs nothing to
 * set up beyond registering it.
 */
export const AIAutocomplete = Extension.create<AIAutocompleteOptions>({
  name: 'aiAutocomplete',
  addOptions() {
    return {
      enabled: true,
      delay: 900,
      minChars: 24,
      contextChars: 1500,
      maxTokens: 48,
      prompt:
        'You complete text inside an editor. Given the text before the caret, write the next few words — at most one short sentence — continuing it naturally in the same language and style. Begin with a space if one is needed. Return only the continuation: no quotes, no commentary, no repetition of the given text.',
    };
  },
  addCommands() {
    return {
      toggleAIAutocomplete:
        (enabled) =>
        ({ state, tr, dispatch }) => {
          const current = aiAutocompleteKey.getState(state)?.enabled ?? false;
          const next = enabled ?? !current;
          if (dispatch)
            tr.setMeta(aiAutocompleteKey, { type: 'enabled', enabled: next } satisfies Action);
          return true;
        },
      acceptAISuggestion:
        () =>
        ({ state, tr, dispatch }) => {
          const suggestion = aiAutocompleteKey.getState(state)?.suggestion;
          if (!suggestion || state.selection.from !== suggestion.pos) return false;
          if (dispatch) {
            tr.insertText(suggestion.text, suggestion.pos);
            tr.setMeta(aiAutocompleteKey, {
              type: 'suggestion',
              suggestion: null,
            } satisfies Action);
            tr.scrollIntoView();
          }
          return true;
        },
      dismissAISuggestion:
        () =>
        ({ state, tr, dispatch }) => {
          if (!aiAutocompleteKey.getState(state)?.suggestion) return false;
          if (dispatch)
            tr.setMeta(aiAutocompleteKey, {
              type: 'suggestion',
              suggestion: null,
            } satisfies Action);
          return true;
        },
    };
  },
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => editor.commands.acceptAISuggestion(),
      Escape: ({ editor }) => editor.commands.dismissAISuggestion(),
    };
  },
  addProseMirrorPlugins() {
    const editor: Editor = this.editor;
    const options = this.options;
    return [
      new Plugin<AIAutocompleteState>({
        key: aiAutocompleteKey,
        state: {
          init: () => ({ enabled: options.enabled, suggestion: null }),
          apply(tr, previous) {
            const action = tr.getMeta(aiAutocompleteKey) as Action | undefined;
            if (action?.type === 'enabled')
              return {
                enabled: action.enabled,
                suggestion: action.enabled ? previous.suggestion : null,
              };
            if (action?.type === 'suggestion')
              return { ...previous, suggestion: action.suggestion };
            // Typing or moving the caret invalidates the suggestion.
            if (previous.suggestion && (tr.docChanged || tr.selectionSet))
              return { ...previous, suggestion: null };
            return previous;
          },
        },
        props: {
          decorations(state) {
            const suggestion = aiAutocompleteKey.getState(state)?.suggestion;
            if (!suggestion || suggestion.pos > state.doc.content.size) return DecorationSet.empty;
            return DecorationSet.create(state.doc, [
              Decoration.widget(
                suggestion.pos,
                () => {
                  const ghost = document.createElement('span');
                  ghost.className = 'richtext-ai-ghost';
                  ghost.setAttribute('aria-hidden', 'true');
                  ghost.textContent = suggestion.text;
                  return ghost;
                },
                {
                  key: `ai-ghost-${suggestion.pos}-${suggestion.text}`,
                  side: 1,
                  ignoreSelection: true,
                }
              ),
            ]);
          },
        },
        view(view) {
          let timer: ReturnType<typeof setTimeout> | null = null;
          let controller: AbortController | null = null;
          const cancel = () => {
            if (timer) clearTimeout(timer);
            timer = null;
            controller?.abort();
            controller = null;
          };
          async function ask() {
            const state = view.state;
            const plugin = aiAutocompleteKey.getState(state);
            const ai = aiOptionsOf(editor);
            if (!plugin?.enabled || !ai || !editor.isEditable || !view.hasFocus()) return;
            if (!continuable(state, options.minChars)) return;
            const pos = state.selection.from;
            const doc = state.doc;
            const before = doc.textBetween(Math.max(0, pos - options.contextChars), pos, '\n\n');
            const active = new AbortController();
            controller = active;
            try {
              const text = await generateAIText(
                { ...ai, maxTokens: options.maxTokens, stream: false },
                {
                  messages: [{ role: 'user', content: `Text before the caret:\n${before}` }],
                  systemPrompt: options.prompt,
                  signal: active.signal,
                }
              );
              const suggestion = text.replace(/\s+$/, '');
              // Stale if anything moved while waiting.
              if (
                active.signal.aborted ||
                view.state.doc !== doc ||
                view.state.selection.from !== pos
              )
                return;
              if (!suggestion || /^["'`]/.test(suggestion)) return;
              view.dispatch(
                view.state.tr.setMeta(aiAutocompleteKey, {
                  type: 'suggestion',
                  suggestion: { pos, text: suggestion },
                } satisfies Action)
              );
            } catch {
              // Suggestions are best effort; a failed one is silently dropped.
            } finally {
              if (controller === active) controller = null;
            }
          }
          return {
            update(_view, previous) {
              const state = view.state;
              const changed = state.doc !== previous.doc || !state.selection.eq(previous.selection);
              if (!changed) return;
              cancel();
              const plugin = aiAutocompleteKey.getState(state);
              if (!plugin?.enabled || plugin.suggestion) return;
              // Only the user's own typing schedules a request, not AI writing.
              if (aiPluginKey.getState(state)?.writing) return;
              if (state.doc !== previous.doc && continuable(state, options.minChars)) {
                timer = setTimeout(() => void ask(), options.delay);
              }
            },
            destroy: cancel,
          };
        },
      }),
    ];
  },
});
