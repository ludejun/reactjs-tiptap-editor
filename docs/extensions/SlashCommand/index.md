---
description: SlashCommand

next:
  text: Strike
  link: /extensions/Strike/index.md
---

# Slash Command

Open an insertion menu by typing `/` in the document.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'richkit';
import { SlashCommand, SlashCommandList } from 'richkit/slashcommand';
import { Heading } from 'richkit/heading';
import 'richkit/style.css';

const extensions = [Document, Paragraph, Text, Heading, SlashCommand];

export default function SlashCommandExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <SlashCommandList />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

Register `SlashCommand` and mount `SlashCommandList` inside the provider. The component supplies the command list; the extension handles the trigger and popup. Type `/` in an empty paragraph, filter the list, and choose an item. Register the extensions used by the commands you offer.

## Supply your own command list

Use `commandList` on `SlashCommandList` to replace the default groups. Each group has a `name`, `title`, and `commands` array. A command receives the editor and the range containing the slash query.

```tsx
import { SlashCommandList } from 'richkit/slashcommand';

export function CustomSlashCommands() {
  return (
    <SlashCommandList
      commandList={[
        {
          name: 'insert',
          title: 'Insert',
          commands: [
            {
              name: 'greeting',
              label: 'Greeting',
              description: 'Insert a short greeting',
              aliases: ['hello'],
              action: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).insertContent('<p>Hello!</p>').run();
              },
            },
          ],
        },
      ]}
    />
  );
}
```

Mount `CustomSlashCommands` in place of the default `SlashCommandList`. Removing `range` prevents the typed slash query from remaining in the document. If an action calls a feature-specific command, register that feature too. Use `shouldBeHidden: (editor) => boolean` to omit a command when its prerequisites are unavailable.

Set `hiddenUntilSearched: true` to keep a command out of the menu until the reader types something matching its label or aliases. It is for entries that are worth having but not worth the space at rest — the default list uses it for headings 4 to 6, so that Table and Code block are not pushed below the fold.

## Default list

The default groups are _Format_ (paragraph, headings 1 to 3, bullet, numbered and task lists, quote) and _Insert_ (table, code block, image, divider, columns, toggle list, video, table of contents), plus an _AI_ entry at the top when the AI extension is registered. Headings 4 to 6 appear once searched.

An omitted or empty `commandList` uses the default list. The command-list store is currently shared across editor instances, so mounting different lists in multiple editors can overwrite one another.
