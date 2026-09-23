---
description: Bubble Menu

next:
  text: Internationalization
  link: /guide/internationalization.md
---

# Bubble Menu

Bubble menus provide actions near selected text or a selected node. They are separate React components: register the corresponding extensions, then mount the menus inside the same `RichTextProvider` as the document.

Importing a menu does not mount it, and mounting a menu does not register its extension.

## Add a text selection menu

This example uses the packages from [Getting Started](/guide/getting-started). Select a word in the editor to show the menu:

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'sparkwrite';
import { Bold, RichTextBold } from 'sparkwrite/bold';
import { Italic, RichTextItalic } from 'sparkwrite/italic';
import { RichTextBubbleText } from 'sparkwrite/bubble/text';
import 'sparkwrite/style.css';

const extensions = [Document, Paragraph, Text, Bold, Italic];

export default function BubbleMenuExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Select a few words to format them.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextBubbleText
        buttonBubble={
          <>
            <RichTextBold />
            <RichTextItalic />
          </>
        }
      />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

`buttonBubble` replaces the default text controls with your own React content. Each control still needs its corresponding extension. Omit the prop to use the library's default text menu; register the formatting and block features you intend to offer there.

A regular toolbar and a bubble menu can coexist. Both operate on the same editor instance.

## Add a node menu

For images, register `Image` in the existing extension array and mount `RichTextBubbleImage` under the provider. Select an inserted image to show its controls. Follow the same pattern for the other supported nodes:

| Menu component             | Required feature                                        | Purpose                         |
| -------------------------- | ------------------------------------------------------- | ------------------------------- |
| `RichTextBubbleText`       | Text and the formatting extensions used by its controls | Format selected text.           |
| `RichTextBubbleLink`       | [Link](/extensions/Link/)                               | Edit a hovered link.            |
| `RichTextBubbleImage`      | [Image](/extensions/Image/)                             | Edit a selected image.          |
| `RichTextBubbleVideo`      | [Video](/extensions/Video/)                             | Edit a selected video.          |
| `RichTextBubbleTable`      | [Table](/extensions/Table/)                             | Table actions, on right click.  |
| `RichTextBubbleIframe`     | [Iframe](/extensions/Iframe/)                           | Edit an embedded frame.         |
| `RichTextBubbleImageGif`   | [ImageGif](/extensions/ImageGif/)                       | Edit a selected GIF.            |
| `RichTextBubbleDrawer`     | [Drawer](/extensions/Drawer/)                           | Edit a drawing node.            |
| `RichTextBubbleExcalidraw` | [Excalidraw](/extensions/Excalidraw/)                   | Edit an Excalidraw node.        |
| `RichTextBubbleMermaid`    | [Mermaid](/extensions/Mermaid/)                         | Edit a diagram node.            |
| `RichTextBubbleTwitter`    | [Twitter](/extensions/Twitter/)                         | Manage a post embed.            |
| `RichTextBubbleCallout`    | [Callout](/extensions/Callout/)                         | Edit a callout.                 |
| `RichTextBubbleKatex`      | [Katex](/extensions/Katex/)                             | Edit a mathematical expression. |

All menu components in this table are exported from `sparkwrite/bubble`. Mount each menu once per editor and only include the menus your editor needs.

`RichTextBubbleTable` is the odd one out: despite the name it mounts a context
menu rather than a bubble, so the table actions appear where you right-click
inside a table instead of hovering over the document while the caret is in a cell.

Two blocks deliberately have no bubble menu:

- **Code blocks** render their own toolbar (language, copy, delete) in the block's top-right corner, revealed on hover. It ships with the `CodeBlock` extension, so nothing needs mounting.
- **Columns** expose their actions through `RichTextBubbleMenuDragHandle`, under the block menu of any block inside a column. Mount the drag handle to get them.

## Individual imports

Use these public subpaths to make feature dependencies explicit. The existing `/bubble` entry remains supported. Import only the components you mount.

| Component                      | Subpath after `sparkwrite` |
| ------------------------------ | -------------------------- |
| `RichTextBubbleText`           | `/bubble/text`             |
| `RichTextBubbleMenuDragHandle` | `/bubble/drag-handle`      |
| `RichTextAIImprove`            | `/bubble/ai`               |
| `RichTextBubbleCallout`        | `/bubble/callout`          |
| `RichTextBubbleDrawer`         | `/bubble/drawer`           |
| `RichTextBubbleExcalidraw`     | `/bubble/excalidraw`       |
| `RichTextBubbleIframe`         | `/bubble/iframe`           |
| `RichTextBubbleKatex`          | `/bubble/katex`            |
| `RichTextBubbleLink`           | `/bubble/link`             |
| `RichTextBubbleMermaid`        | `/bubble/mermaid`          |
| `RichTextBubbleTable`          | `/bubble/table`            |
| `RichTextBubbleTwitter`        | `/bubble/twitter`          |
| `RichTextBubbleImage`          | `/bubble/media`            |
| `RichTextBubbleVideo`          | `/bubble/media`            |
| `RichTextBubbleImageGif`       | `/bubble/media`            |

`/bubble/media` exports the Image, Video, and ImageGif menus together. `RichTextAIImprove` is an AI control; see [AI](/extensions/AI/). The text bubble does not require KaTeX or Yjs. The drag handle still brings collaboration-related dependencies through Tiptap, even in an editor without collaboration.

## Block drag handle

`RichTextBubbleMenuDragHandle` provides a handle for moving document blocks and a block action menu. It does not move the bubble menu itself.

```tsx
import { RichTextBubbleMenuDragHandle } from 'sparkwrite/bubble/drag-handle';

// Mount inside your existing RichTextProvider.
<RichTextBubbleMenuDragHandle />;
```

## Slash commands

`SlashCommandList` supplies the slash command list and is not a text-selection bubble menu. Mount it inside the provider and register `SlashCommand` to enable `/` commands. See [Slash Command](/extensions/SlashCommand/).

## Troubleshooting

If a menu does not appear, confirm that the editor is editable, its matching extension is registered, and the appropriate content is selected. A collapsed text cursor does not show the text-selection menu. Check clipping or stacking styles in your host layout if a menu appears behind another element.
