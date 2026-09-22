import {
  DOMParser as ProseMirrorDOMParser,
  DOMSerializer,
  Fragment,
  Slice,
} from '@tiptap/pm/model';
import { marked } from 'marked';

import type { Editor } from '@tiptap/core';

/**
 * marked writes `- [x]` items as `<li><input type="checkbox" checked>`; the
 * editor's task list wants `data-type` markers instead.
 */
function taskListMarkup(html: string): string {
  if (!/<input[^>]*type="checkbox"/i.test(html)) {
    return html;
  }

  const doc = new window.DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');

  for (const list of Array.from(doc.body.querySelectorAll('ul'))) {
    const items = Array.from(list.children).filter((el) => el.tagName === 'LI');
    const boxes = items.map((li) => li.querySelector(':scope > input[type="checkbox"]'));

    if (!items.length || boxes.some((box) => !box)) {
      continue;
    }

    list.setAttribute('data-type', 'taskList');
    items.forEach((li, index) => {
      const box = boxes[index] as HTMLInputElement;

      li.setAttribute('data-type', 'taskItem');
      li.setAttribute('data-checked', box.checked ? 'true' : 'false');
      box.remove();
    });
  }

  return doc.body.innerHTML;
}

/** GitHub-flavoured markdown to HTML. Synchronous; no extensions. */
export function markdownToHTML(markdown: string): string {
  return taskListMarkup(
    marked.parse(markdown, { gfm: true, breaks: false, async: false }) as string
  );
}

/**
 * Model output as editor content. The HTML goes through the editor's own
 * schema, so only nodes and marks the editor knows survive — a table becomes
 * the editor's table, a fenced block its code block, and anything else
 * (scripts, unknown tags, event attributes) is dropped.
 */
export function markdownToFragment(editor: Editor, markdown: string): Fragment {
  const body = new window.DOMParser().parseFromString(
    `<body>${markdownToHTML(markdown)}</body>`,
    'text/html'
  ).body;

  return ProseMirrorDOMParser.fromSchema(editor.schema).parse(body).content;
}

/**
 * A slice that fits where the selection is: a single paragraph merges into the
 * paragraph being edited, anything with block structure replaces whole blocks.
 */
export function markdownToSlice(editor: Editor, markdown: string): Slice {
  const fragment = markdownToFragment(editor, markdown);
  const inline = fragment.childCount === 1 && fragment.firstChild?.type.name === 'paragraph';

  return new Slice(fragment, inline ? 1 : 0, inline ? 1 : 0);
}

/**
 * Static HTML of the content exactly as the editor would save it — same
 * classes, same structure — for a preview that looks like the document.
 */
export function markdownToPreviewHTML(editor: Editor, markdown: string): string {
  const container = document.createElement('div');

  container.appendChild(
    DOMSerializer.fromSchema(editor.schema).serializeFragment(markdownToFragment(editor, markdown))
  );

  return container.innerHTML;
}
