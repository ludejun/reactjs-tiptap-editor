import type { AIWriteTarget } from './types';

/**
 * A ready-made document-level action for the composer dock and the AI
 * toolbar menu. `key` is the locale key of its label; `prompt` is what is
 * sent, `target` where the answer lands.
 */
export interface AIComposerAction {
  key: string;
  /** Lucide icon name, for layers that render icons by name. */
  icon: string;
  target: AIWriteTarget;
  prompt: string;
  /** Only makes sense with text selected. */
  needsSelection?: boolean;
  /** Only makes sense with some document. */
  needsDocument?: boolean;
}

/**
 * Two names are needed for the browser language. The prompt uses the English
 * name, which models resolve most reliably; menus show the endonym.
 */
export function browserLanguage(): { label: string; name: string } | null {
  const tag = typeof navigator === 'undefined' ? '' : navigator.language;
  if (!tag) return null;
  try {
    const label = new Intl.DisplayNames([tag], { type: 'language' }).of(tag);
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(tag);
    const shown = label ? label.charAt(0).toLocaleUpperCase(tag) + label.slice(1) : tag;
    return { label: shown, name: name ?? tag };
  } catch {
    return { label: tag, name: tag };
  }
}

/**
 * What the AI can do with the whole document, in the order people reach for
 * them: keep going, then get an overview, then polish.
 */
export const AI_COMPOSER_ACTIONS: AIComposerAction[] = [
  {
    key: 'editor.ai.compose.continue',
    icon: 'PenLine',
    target: 'end',
    needsDocument: true,
    prompt:
      'Continue writing the document from where it ends: two or three paragraphs (or list items, if it ends in a list) in the same voice, structure and language. Return only the new text.',
  },
  {
    key: 'editor.ai.compose.summarize',
    icon: 'ListTree',
    target: 'start',
    needsDocument: true,
    prompt:
      'Write a short summary of the document: a level-2 heading "Summary" followed by one paragraph or three to five bullet points, in the document’s language. Return only the summary.',
  },
  {
    key: 'editor.ai.compose.outline',
    icon: 'ListOrdered',
    target: 'cursor',
    needsDocument: true,
    prompt:
      'Produce an outline of the document as a nested bullet list of its sections and key points, in the document’s language. Return only the outline.',
  },
  {
    key: 'editor.ai.compose.title.suggest',
    icon: 'Heading1',
    target: 'start',
    needsDocument: true,
    prompt:
      'Suggest a concise, specific title for the document, in its language, as a level-1 heading. Return only the heading.',
  },
  {
    key: 'editor.ai.compose.tasks',
    icon: 'ListTodo',
    target: 'end',
    needsDocument: true,
    prompt:
      'Extract every action item, decision or open question from the document as a Markdown task list (`- [ ] item`), in the document’s language, under a level-2 heading "Action items". Return only that section.',
  },
  {
    key: 'editor.ai.compose.grammar',
    icon: 'SpellCheck',
    target: 'document',
    needsDocument: true,
    prompt:
      'Correct spelling, grammar and punctuation in the whole document. Keep every heading, list, table, code block, link and image exactly as it is; change only the wording that is wrong. Return the complete corrected document.',
  },
  {
    key: 'editor.ai.compose.translate',
    icon: 'Languages',
    target: 'document',
    needsDocument: true,
    prompt:
      'Translate the whole document into {language}. Keep the structure and formatting. Return the complete translated document.',
  },
];

/** Fills `{language}` in a translate prompt with the browser language. */
export function composerPrompt(action: AIComposerAction, language?: string): string {
  const target = language ?? browserLanguage()?.name ?? 'English';
  return action.prompt.replace('{language}', target);
}
