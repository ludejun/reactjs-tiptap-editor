# Customization

Four things every host ends up wanting: its own toolbar menus, its own block types, control over when and how the document is saved, and a way to play a session back. Each has a home in the library.

## Custom menus

The toolbar is composed from React components, so a custom menu is just another component in the row. The library ships the same building blocks the playground uses:

```tsx
import {
  RichTextToolbar,
  RichTextToolbarButton,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
} from 'sparkwrite';
import { RichTextBold } from 'sparkwrite/bold';
import { RichTextTable } from 'sparkwrite/table';

<RichTextToolbar>
  <RichTextBold />
  <RichTextToolbarDivider />
  <RichTextTable />

  {/* Your own action, styled like the built-in controls */}
  <RichTextToolbarButton
    icon='Save'
    tooltip='Save'
    shortcutKeys={['mod', 'S']}
    onClick={() => save(editor)}
  />

  {/* Everything else, with labels instead of tooltips */}
  <RichTextToolbarMore label={t('editor.more')}>
    <RichTextToolbarMoreGroup label={t('editor.slash.insert')}>
      <RichTextToolbarMoreRow label={t('editor.divider.tooltip')}>
        <RichTextDivider />
      </RichTextToolbarMoreRow>
      <RichTextToolbarMoreRow label='Insert signature'>
        <RichTextToolbarButton icon='Pencil' onClick={insertSignature} />
      </RichTextToolbarMoreRow>
    </RichTextToolbarMoreGroup>
  </RichTextToolbarMore>
</RichTextToolbar>;
```

`RichTextToolbarMore` keeps a dropdown opened from inside it (font size, line height…) alive while the panel is up, and clicking a row's label triggers its control. Any `RichText*` control from an extension can sit in a row; so can anything of your own. See [Toolbar](/guide/toolbar) for the conventions on what belongs in the top row.

A custom menu item usually calls a command. For an action the built-in extensions do not have, write a small extension:

```ts
import { Extension } from '@tiptap/core';

export const Signature = Extension.create({
  name: 'signature',
  addCommands() {
    return {
      insertSignature:
        () =>
        ({ chain }) =>
          chain()
            .insertContent('<p>— Ada, ' + new Date().toLocaleDateString() + '</p>')
            .run(),
    };
  },
});
```

## Custom rendering

Two levels, depending on how far you need to go.

**Change how a built-in node looks.** Most nodes carry a `class` or `data-*` hook you can style, and several take render options: `Divider.configure({ renderDivider })` decides the saved HTML, `Image.configure({ HTMLAttributes })` adds attributes, code blocks follow the `CODE_THEME` palette. Styles live behind one root class, `.sparkwrite`, so overriding them needs one more selector than the library uses.

**Add a block of your own.** Any Tiptap node works, and a React node view gives it an interactive editing state. The `Divider` extension is a compact example of the whole pattern — attributes, `parseHTML`/`renderHTML` for the saved form, a node view with an input, a plugin that keeps derived attributes in sync — and `Callout` a simpler one:

```tsx
import { Node, mergeAttributes } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';

const RatingView = ({ node, updateAttributes }) => (
  <NodeViewWrapper className='rating'>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => updateAttributes({ value: n })}
        aria-pressed={n <= node.attrs.value}
      >
        ★
      </button>
    ))}
  </NodeViewWrapper>
);

export const Rating = Node.create({
  name: 'rating',
  group: 'block',
  atom: true,
  addAttributes: () => ({ value: { default: 0 } }),
  parseHTML: () => [{ tag: 'div[data-type="rating"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    'div',
    mergeAttributes(HTMLAttributes, { 'data-type': 'rating' }),
  ],
  addNodeView: () => ReactNodeViewRenderer(RatingView),
});
```

Register it alongside the others, add a `RichTextToolbarButton` that runs `editor.commands.insertContent({ type: 'rating' })`, and a slash entry if you want one (see [SlashCommand](/extensions/SlashCommand/)). `renderHTML` is what `getHTML()` saves, so the saved form is entirely yours.

## Saving

The document is available as HTML (`editor.getHTML()`), JSON (`editor.getJSON()`), plain text, Markdown ([ExportMarkdown](/extensions/ExportMarkdown/)) or Word ([ExportWord](/extensions/ExportWord/)). JSON round-trips exactly; HTML is what most backends store. Autosave is an `onUpdate` with a debounce:

```ts
const editor = useEditor({
  extensions,
  content,
  onUpdate: debounce(({ editor }) => {
    void api.save({ html: editor.getHTML(), json: editor.getJSON() });
  }, 800),
});
```

Two things worth handling at save time:

- **Images.** Uploads happen before the save, so deleted pictures leave files behind. `getImageChanges(editor)` lists what to delete and `markImagesSaved(editor)` records the baseline — see [Image › Uploads and deleted images](/extensions/Image/#uploads-and-deleted-images).
- **Read-only.** `editor.setEditable(false)` during a long save or a replay keeps the document from changing under you.

## Replay

[Recorder](/extensions/Recorder/) records every edit as timestamped ProseMirror steps. Save the recording with the document and `replayRecording(editor, recording, { speed: 4 })` plays the session back — how a text came to be, who changed what in a review, or the exact sequence that triggered a bug.
