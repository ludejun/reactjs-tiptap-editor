---
description: Divider

next:
  text: Drawer
  link: /extensions/Drawer/index.md
---

# Divider

One block, many looks: a plain rule, dashed, dotted, double, a short centred line, three dots, stars, a rule with text in the middle, or a numbered one. Replaces `HorizontalRule`; register one or the other, not both.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'sparkwrite';
import { Divider, RichTextDivider } from 'sparkwrite/divider';
import 'sparkwrite/style.css';

const extensions = [Document, Paragraph, Text, Divider];

export default function DividerExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextDivider />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

The toolbar button opens a menu of styles with a preview of each. `/divider` (also `/hr`) and <kbd>⌘</kbd>/<kbd>Ctrl</kbd> <kbd>⌥</kbd>/<kbd>Alt</kbd> <kbd>S</kbd> insert the `defaultVariant`. Click a divider to select it: a small picker appears above it to switch styles in place.

Two variants are editable:

- **Text** shows an input in the middle of the rule. Type a caption ("Chapter 2", "Part II"); <kbd>Enter</kbd> leaves the input and continues below.
- **Numbered** shows its ordinal among the numbered dividers in the document. Moving or deleting one renumbers the rest; the number is stored in `label` so saved HTML and exports carry it.

Commands:

```ts
editor.chain().focus().setDivider({ variant: 'dashed' }).run();
editor.chain().focus().setDivider({ variant: 'text', label: 'Chapter 2' }).run();
editor.commands.updateDivider({ variant: 'stars' }); // acts on the selected divider
```

## Saved HTML

```html
<div
  data-type="divider"
  data-variant="text"
  data-label="Chapter 2"
  class="divider divider--text"
  role="separator"
>
  <hr />
  <span class="divider__label">Chapter 2</span>
  <hr />
</div>
```

The `<hr>` stays inside so the rule still shows where the stylesheet is not loaded, in Word exports and in feeds that strip classes. Markdown export writes `---`; captions have no markdown form. `<hr>` and the old `<div data-type="horizontalRule">` markup are read back as a `line` divider, so existing documents open unchanged.

## Options

### variants

Type: `{ value: string; label?: string; editable?: boolean }[]`\
Default: the nine built-in variants, `text` editable

The styles offered, in menu order. Remove entries to offer fewer; add your own `value` and style `.divider--<value>` in your CSS. `editable` shows the label input. `label` overrides the menu text (built-in values are translated).

```ts
Divider.configure({
  variants: [
    { value: 'line' },
    { value: 'text', editable: true },
    { value: 'wave', label: 'Wave' }, // styled by your CSS
  ],
});
```

### defaultVariant

Type: `string`\
Default: `'line'`

Inserted by the toolbar button, the slash command and the shortcut.

### renderDivider

Type: `(attrs: { variant: string; label: string | null }) => DOMOutputSpec`\
Default: the markup above

Replaces the saved HTML. Pair it with `parseRules` so the same markup reads back:

```ts
Divider.configure({
  renderDivider: ({ variant, label }) => [
    'hr',
    { class: `sep sep-${variant}`, 'data-label': label ?? '' },
  ],
  parseRules: [
    {
      tag: 'hr.sep',
      getAttrs: (el) => ({
        variant: (el as HTMLElement).className.replace(/.*sep-(\S+).*/, '$1'),
        label: (el as HTMLElement).getAttribute('data-label') || null,
      }),
    },
  ],
});
```

### parseRules

Type: `ParseRule[]`\
Default: `[]`

Extra rules tried before the built-in ones.

### shortcutKeys

Type: `string[]`\
Default: `['mod', 'alt', 'S']`

Shortcut labels shown by the controls. See [keyboard shortcut configuration](/guide/toolbar#keyboard-shortcuts) to change actual key bindings.
