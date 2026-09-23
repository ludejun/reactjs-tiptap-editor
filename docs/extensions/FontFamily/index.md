---
description: FontFamily

next:
  text: FontSize
  link: /extensions/FontSize/index.md
---

# Font Family

Choose the font family used by selected text.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). Install `@tiptap/extension-text-style` at the same version as your other Tiptap packages. This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { FontFamily, RichTextFontFamily } from 'ai-sparkwrite-editor/fontfamily';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontFamily];

export default function FontFamilyExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextFontFamily />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

Register `TextStyle`. `fontFamilyList` controls the choices in the dropdown, but does not download fonts. Load web fonts in your application CSS, or choose fonts available on the reader’s device.

A plain string is used as both the label and the CSS value. A `{ name, value }`
entry separates them, which is what a cross-platform stack needs: the menu can
stay readable while the value lists one face per platform.

## Non-Latin scripts

Arial, Georgia, Times and the rest of the Latin defaults carry no Han,
Devanagari or Bengali glyphs, so applying one to Chinese or Hindi text changes
nothing visible — the browser substitutes a default face. The default list
therefore ends with the entries in `SCRIPT_FONT_FAMILY_LIST`:

| Script     | Entries                          |
| ---------- | -------------------------------- |
| Chinese    | 微软雅黑, 苹方, 黑体, 宋体, 楷体 |
| Japanese   | ゴシック体, 明朝体               |
| Korean     | 맑은 고딕                        |
| Devanagari | देवनागरी                         |
| Bengali    | বাংলা                            |

Each is named after the font readers know and resolves to a stack, so the
choice lands on that face where it exists and on the closest equivalent
elsewhere — 微软雅黑 gives Microsoft YaHei on Windows and PingFang SC on macOS,
the substitution every word processor has always done.

They are all system fonts by design: a webfont covering Han runs to several
megabytes even subset. To ship one anyway, load it in your CSS and add it to
`fontFamilyList` yourself.

### When they appear

Listing every script at all times buries the Latin fonts for readers who will
never use them. The picker shows a script's entries when **either** the
interface language uses that script **or** the document already contains it —
the document is sampled when the menu opens, so pasting Chinese into an
English-language editor brings the Chinese fonts back straight away. Entries
you add through `fontFamilyList` are never filtered.

The editor's own body text is unaffected by this list — it inherits the font of
the page it is embedded in. `system-ui` already falls back to a sensible CJK
face on every platform, so only an explicit choice needs these entries.

## Configuration

```ts
import { FontFamily } from 'ai-sparkwrite-editor/fontfamily';

FontFamily.configure({
  fontFamilyList: ['Arial', 'Georgia', { name: 'Monospace', value: 'monospace' }],
});
```

Use this configured extension in place of the unconfigured one in `extensions`.
