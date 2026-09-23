---
description: FontSize

next:
  text: FormatPainter
  link: /extensions/FormatPainter/index.md
---

# Font Size

Choose the font size used by selected text.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). Install `@tiptap/extension-text-style` at the same version as your other Tiptap packages. This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'ai-sparkwrite-editor';
import { FontSize, RichTextFontSize } from 'ai-sparkwrite-editor/fontsize';
import { TextStyle } from '@tiptap/extension-text-style';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, TextStyle, FontSize];

export default function FontSizeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextFontSize />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

Register `TextStyle`. Configure `fontSizes` with CSS sizes such as `14px` or objects such as `{ name: "Large", value: "24px" }`. Use `editor.chain().focus().setFontSize("18px").run()` or `unsetFontSize()` from your own controls.

## Compact variant

`<RichTextFontSize compact />` renders an icon button instead of a trigger
showing the current size. The wide trigger earns its space in a main toolbar,
where reading the size at a glance is the point; in a menu of named rows it is
the one control that will not line up, so the compact form matches the shape of
`RichTextLineHeight`.

## Configuration

```ts
import { FontSize } from 'ai-sparkwrite-editor/fontsize';

FontSize.configure({
  fontSizes: ['Default', '14px', '18px', { name: 'Large', value: '24px' }],
});
```

Use this configured extension in place of the unconfigured one in `extensions`.
