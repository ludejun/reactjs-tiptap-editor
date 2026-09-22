import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

import type { EditorView } from '@tiptap/pm/view';

export interface RichPasteOptions {
  /**
   * Turn Word's bulleted and numbered paragraphs into real lists. Word does
   * not put `<ul>`/`<ol>` on the clipboard: every item is a paragraph with a
   * `mso-list` style and a literal bullet character in front.
   */
  wordLists: boolean;
  /**
   * Paste from a code editor (VS Code, Sublime, Xcode…) as a code block. Those
   * editors copy one coloured `<span>` per token inside a monospace,
   * `white-space: pre` container, which would otherwise land as paragraphs of
   * coloured text.
   */
  codeBlocks: boolean;
  /**
   * Guesses the language of a pasted code block from its text. Receives the
   * plain text and returns a language name the code block understands; return
   * an empty string for "unknown". Defaults to no guess.
   */
  detectLanguage?: (code: string) => string;
}

const MONOSPACE =
  /monospace|menlo|monaco|consolas|courier|fira ?code|jetbrains ?mono|source ?code ?pro|sf ?mono|cascadia|ubuntu ?mono|dejavu ?sans ?mono|droid ?sans ?mono|roboto ?mono|ibm ?plex ?mono|inconsolata|hack\b/i;

/** Whether pasted HTML is a code editor's rendering of a snippet. */
export function isCodeEditorHtml(html: string): boolean {
  if (!html || /<(p|h[1-6]|table|ul|ol|blockquote|img)[\s>]/i.test(html)) {
    return false;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const roots = Array.from(doc.body.children).filter((el) => el.tagName !== 'META');
  const root = roots.length === 1 ? roots[0] : null;

  if (!root || !(root instanceof HTMLElement)) {
    return false;
  }

  const style = root.getAttribute('style') ?? '';
  const pre = root.tagName === 'PRE' || /white-space:\s*pre(?!-line)/i.test(style);
  const mono = MONOSPACE.test(style);

  // JetBrains puts the styles on a <pre>; VS Code on a <div> with `white-space:
  // pre` and the editor font. Either way the tokens are coloured spans.
  return (pre || mono) && root.querySelector('span[style*="color"]') !== null;
}

function markerIsOrdered(marker: string): boolean {
  return /^\s*(\d+|[a-zA-Z]|[ivxlcIVXLC]+)\s*[.)]/.test(marker);
}

/**
 * Word list paragraphs look like
 * `<p class=MsoListParagraph style='mso-list:l0 level2 lfo1'><!--[if !supportLists]-->
 * <span style='font-family:Symbol'>·<span>&nbsp;</span></span><!--[endif]-->Text</p>`.
 * Returns the marker text and strips the marker from the paragraph.
 */
function extractWordMarker(paragraph: Element): string {
  let marker = '';
  let inMarker = false;
  const remove: ChildNode[] = [];

  for (const node of Array.from(paragraph.childNodes)) {
    if (node.nodeType === Node.COMMENT_NODE) {
      const data = (node as Comment).data;

      if (/\[if\s+!supportLists\]/i.test(data)) inMarker = true;
      remove.push(node);
      if (/\[endif\]/i.test(data)) {
        inMarker = false;
        break;
      }
      continue;
    }

    if (inMarker) {
      marker += node.textContent ?? '';
      remove.push(node);
    }
  }

  if (!marker) {
    // Some Word builds skip the conditional comments and only flag the span.
    const ignored = paragraph.querySelector(
      '[style*="mso-list:Ignore"], [style*="mso-list: Ignore"]'
    );

    if (ignored) {
      marker = ignored.textContent ?? '';
      remove.push(ignored);
    }
  }

  remove.forEach((node) => node.parentNode?.removeChild(node));

  return marker;
}

function wordListLevel(paragraph: Element): number {
  const match = /mso-list:[^;"']*level(\d+)/i.exec(paragraph.getAttribute('style') ?? '');

  return match ? Math.max(1, Number(match[1])) : 1;
}

/** Word's list id (`l0`, `l1`…): two adjacent lists carry different ids. */
function wordListId(paragraph: Element): string {
  const match = /mso-list:\s*(l\d+)/i.exec(paragraph.getAttribute('style') ?? '');

  return match ? match[1].toLowerCase() : '';
}

function isWordListParagraph(el: Element | null): el is HTMLElement {
  return (
    !!el &&
    el.tagName === 'P' &&
    (/MsoListParagraph/i.test(el.className) || /mso-list:/i.test(el.getAttribute('style') ?? ''))
  );
}

/** Rebuilds runs of Word list paragraphs as nested `<ul>`/`<ol>` lists. */
export function transformWordLists(html: string): string {
  if (!/mso-list|MsoListParagraph/i.test(html)) {
    return html;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const paragraphs = Array.from(doc.body.querySelectorAll('p')).filter(isWordListParagraph);

  if (!paragraphs.length) {
    return html;
  }

  let index = 0;

  while (index < paragraphs.length) {
    // One run: consecutive sibling paragraphs of the same Word list. A bulleted
    // list directly followed by a numbered one has a different list id.
    const run = [paragraphs[index]];
    const listId = wordListId(paragraphs[index]);

    while (
      index + 1 < paragraphs.length &&
      paragraphs[index + 1].previousElementSibling === paragraphs[index] &&
      wordListId(paragraphs[index + 1]) === listId
    ) {
      run.push(paragraphs[++index]);
    }
    index++;

    const stack: { level: number; list: HTMLElement }[] = [];
    let root: HTMLElement | null = null;

    for (const paragraph of run) {
      const level = wordListLevel(paragraph);
      const marker = extractWordMarker(paragraph);

      while (stack.length && stack[stack.length - 1].level > level) {
        stack.pop();
      }

      if (!stack.length || stack[stack.length - 1].level < level) {
        const list = doc.createElement(markerIsOrdered(marker) ? 'ol' : 'ul');
        const parentItem = stack.length ? stack[stack.length - 1].list.lastElementChild : null;

        if (parentItem) {
          parentItem.appendChild(list);
        } else if (root) {
          // A deeper level with no parent item: keep it in the same root.
          root.appendChild(list);
        } else {
          root = list;
        }

        stack.push({ level, list });
      }

      const item = doc.createElement('li');
      const text = doc.createElement('p');

      // Keep inline marks; drop Word's own paragraph attributes.
      while (paragraph.firstChild) {
        text.appendChild(paragraph.firstChild);
      }

      item.appendChild(text);
      stack[stack.length - 1].list.appendChild(item);
    }

    if (root) {
      run[0].replaceWith(root);
      run.slice(1).forEach((paragraph) => paragraph.remove());
    }
  }

  return doc.body.innerHTML;
}

function pasteCodeBlock(view: EditorView, text: string, language: string): boolean {
  const { schema, selection } = view.state;
  const codeBlock = schema.nodes.codeBlock;

  if (!codeBlock) {
    return false;
  }

  const code = text.replace(/\r\n?/g, '\n').replace(/\n+$/, '');

  if (!code.includes('\n')) {
    // One line is a snippet, not a block: inline code if the schema has it.
    const mark = schema.marks.code;
    const node = schema.text(code, mark ? [mark.create()] : undefined);

    view.dispatch(view.state.tr.replaceSelectionWith(node, false).scrollIntoView());

    return true;
  }

  const attrs = language ? { language } : undefined;
  const node = codeBlock.create(attrs, schema.text(code));
  const tr = view.state.tr.replaceSelectionWith(node);

  if (selection.$from.parent.type.spec.code) {
    return false;
  }

  view.dispatch(tr.scrollIntoView());

  return true;
}

/**
 * Cleans up the two pastes the browser gets wrong: Word's fake lists and code
 * copied from a code editor. Everything else (web pages, Excel, Google Docs,
 * Word inline formatting) already comes through the schema intact.
 */
export const RichPaste = /* @__PURE__ */ Extension.create<RichPasteOptions>({
  name: 'richPaste',

  addOptions() {
    return {
      wordLists: true,
      codeBlocks: true,
      detectLanguage: undefined,
    };
  },

  addProseMirrorPlugins() {
    const options = this.options;

    return [
      new Plugin({
        key: new PluginKey('richPaste'),
        props: {
          transformPastedHTML(html) {
            return options.wordLists ? transformWordLists(html) : html;
          },
          handlePaste(view, event) {
            if (!options.codeBlocks || !event.clipboardData) {
              return false;
            }

            // Inside a code block the default paste already keeps the text.
            if (view.state.selection.$from.parent.type.spec.code) {
              return false;
            }

            const html = event.clipboardData.getData('text/html');
            const text = event.clipboardData.getData('text/plain');

            if (!text || !isCodeEditorHtml(html)) {
              return false;
            }

            return pasteCodeBlock(view, text, options.detectLanguage?.(text) ?? '');
          },
        },
      }),
    ];
  },
});
