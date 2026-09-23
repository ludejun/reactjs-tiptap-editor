# Extension Map

Load this before adding imports, toolbar buttons, bubble menus, or extension arrays.

Snapshot: repository 1.0.46 / Tiptap 3. Public paths come from `package.json` exports; names come from source entry points. Installed-version declarations override this map.

## Base Extensions

| Purpose                                          | Import                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Document                                         | `import { Document } from '@tiptap/extension-document';`                                 |
| Text                                             | `import { Text } from '@tiptap/extension-text';`                                         |
| Paragraph                                        | `import { Paragraph } from '@tiptap/extension-paragraph';`                               |
| HardBreak                                        | `import { HardBreak } from '@tiptap/extension-hard-break';`                              |
| ListItem                                         | `import { ListItem } from '@tiptap/extension-list';`                                     |
| TextStyle                                        | `import { TextStyle } from '@tiptap/extension-text-style';`                              |
| Dropcursor, Gapcursor, Placeholder, TrailingNode | `import { Dropcursor, Gapcursor, Placeholder, TrailingNode } from '@tiptap/extensions';` |

## Main Extension Imports

| Feature           | Extension import                         | Toolbar/component import                                                                  |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------- |
| Attachment        | `richkit/attachment`       | `Attachment`, `RichTextAttachment`                                                        |
| Blockquote        | `richkit/blockquote`       | `Blockquote`, `RichTextBlockquote`                                                        |
| Bold              | `richkit/bold`             | `Bold`, `RichTextBold`                                                                    |
| Bullet list       | `richkit/bulletlist`       | `BulletList`, `RichTextBulletList`                                                        |
| Callout           | `richkit/callout`          | `Callout`, `RichTextCallout`                                                              |
| Clear formatting  | `richkit/clear`            | `Clear`, `RichTextClear`                                                                  |
| Code              | `richkit/code`             | `Code`, `RichTextCode`                                                                    |
| Code block        | `richkit/codeblock`        | `CodeBlock`, `RichTextCodeBlock`                                                          |
| Code view         | `richkit/codeview`         | `CodeView`, `RichTextCodeView`                                                            |
| Color             | `richkit/color`            | `Color`, `RichTextColor`                                                                  |
| Column            | `richkit/column`           | `Column`, `ColumnNode`, `MultipleColumnNode`, `RichTextColumn`                            |
| Drawer            | `richkit/drawer`           | `Drawer`, `RichTextDrawer`                                                                |
| Emoji             | `richkit/emoji`            | `Emoji`, `RichTextEmoji`                                                                  |
| Excalidraw        | `richkit/excalidraw`       | `Excalidraw`, `RichTextExcalidraw`                                                        |
| Export PDF        | `richkit/exportpdf`        | `ExportPdf`, `RichTextExportPdf`                                                          |
| Export Word       | `richkit/exportword`       | `ExportWord`, `RichTextExportWord`                                                        |
| Font family       | `richkit/fontfamily`       | `FontFamily`, `RichTextFontFamily`                                                        |
| Font size         | `richkit/fontsize`         | `FontSize`, `RichTextFontSize`                                                            |
| Format painter    | `richkit/formatpainter`    | `FormatPainter`, `RichTextFormatPainter`                                                  |
| Heading           | `richkit/heading`          | `Heading`, `RichTextHeading`                                                              |
| Highlight         | `richkit/highlight`        | `Highlight`, `RichTextHighlight`                                                          |
| History           | `richkit/history`          | `History`, `RichTextUndo`, `RichTextRedo`                                                 |
| Horizontal rule   | `richkit/horizontalrule`   | `HorizontalRule`, `RichTextHorizontalRule`                                                |
| Iframe            | `richkit/iframe`           | `Iframe`, `RichTextIframe`                                                                |
| Image             | `richkit/image`            | `Image`, `RichTextImage`                                                                  |
| Image GIF         | `richkit/imagegif`         | `ImageGif`, `RichTextImageGif`                                                            |
| Import Word       | `richkit/importword`       | `ImportWord`, `RichTextImportWord`                                                        |
| Indent            | `richkit/indent`           | `Indent`, `RichTextIndent`                                                                |
| Italic            | `richkit/italic`           | `Italic`, `RichTextItalic`                                                                |
| KaTeX             | `richkit/katex`            | `Katex`, `RichTextKatex`                                                                  |
| Line height       | `richkit/lineheight`       | `LineHeight`, `RichTextLineHeight`                                                        |
| Link              | `richkit/link`             | `Link`, `RichTextLink`                                                                    |
| Markdown paste    | `richkit/markdownpaste`    | `MarkdownPaste`                                                                           |
| Mention           | `richkit/mention`          | `Mention`                                                                                 |
| Mermaid           | `richkit/mermaid`          | `Mermaid`, `RichTextMermaid`                                                              |
| More mark         | `richkit/moremark`         | `MoreMark`, `RichTextMoreMark`                                                            |
| Ordered list      | `richkit/orderedlist`      | `OrderedList`, `RichTextOrderedList`                                                      |
| Search/replace    | `richkit/searchandreplace` | `SearchAndReplace`, `RichTextSearchAndReplace`                                            |
| Short message     | `richkit/shortmessage`     | `ShortMessage`                                                                            |
| Slash command     | `richkit/slashcommand`     | `SlashCommand`, `SlashCommandList`                                                        |
| Strike            | `richkit/strike`           | `Strike`, `RichTextStrike`                                                                |
| Table             | `richkit/table`            | `Table`, `RichTextTable`                                                                  |
| Task list         | `richkit/tasklist`         | `TaskList`, `RichTextTaskList`                                                            |
| Text align        | `richkit/textalign`        | `TextAlign`, `RichTextAlign`                                                              |
| Text direction    | `richkit/textdirection`    | `TextDirection`, `RichTextTextDirection`                                                  |
| Underline         | `richkit/textunderline`    | `TextUnderline`, `RichTextUnderline`                                                      |
| Twitter           | `richkit/twitter`          | `Twitter`, `RichTextTwitter`                                                              |
| Video             | `richkit/video`            | `Video`, `RichTextVideo`                                                                  |
| AI                | `richkit/ai`               | `AI` (bubble UI: `RichTextAIImprove` from `/bubble/ai`)                                   |
| Details           | `richkit/details`          | `Details`, `DetailsSummary`, `DetailsContent`, `RichTextDetails`                          |
| Table of contents | `richkit/tableofcontents`  | `TableOfContents`, `TableOfContentsNode`, `RichTextTableOfContents`, `useTableOfContents` |
| Export Markdown   | `richkit/exportmarkdown`   | `ExportMarkdown`, `RichTextExportMarkdown`, `getMarkdown`                                 |

For AI endpoint/protocol options, inspect `src/extensions/AI/types.ts` or installed declarations before configuring a backend. For Details/TableOfContents options, inspect their implementation and bundled child extensions rather than registering every exported node.

## Supporting Extensions

- BulletList and OrderedList require ListItem.
- Color, FontFamily, and FontSize use TextStyle.
- Register all three column extensions: Column, ColumnNode, MultipleColumnNode.
- Table registers TableRow, TableHeader, TableCell, and TableCellBackground internally.
- TaskList registers TaskItem internally; Details registers its summary/content nodes; TableOfContents registers its node internally.
- Check for overlaps with StarterKit and existing extensions before adding another registration.

## Non-Extension Imports

| Purpose           | Import                                                                     |
| ----------------- | -------------------------------------------------------------------------- |
| Provider          | `import { RichTextProvider } from 'richkit';`                |
| Styles            | `import 'richkit/style.css';`                                |
| Bubble components | `import { RichTextBubbleText } from 'richkit/bubble/text';`  |
| Locale            | `import { localeActions, useLocale } from 'richkit/locale';` |
| Theme             | `import { themeActions, useTheme } from 'richkit/theme';`    |

## Bubble Components

The compatibility barrel `richkit/bubble` exports the following. Prefer the specific entry point when available to avoid pulling unrelated feature modules into the import graph:

- `RichTextBubbleText`
- `RichTextBubbleLink`
- `RichTextBubbleImage`
- `RichTextBubbleVideo`
- `RichTextBubbleTable`
- `RichTextBubbleIframe`
- `RichTextBubbleImageGif`
- `RichTextBubbleDrawer`
- `RichTextBubbleExcalidraw`
- `RichTextBubbleMermaid`
- `RichTextBubbleTwitter`
- `RichTextBubbleCallout`
- `RichTextBubbleKatex`
- `RichTextBubbleMenuDragHandle`
- `RichTextAIImprove`

| Subpath (after `richkit/`) | Named exports                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `bubble/text`                            | `RichTextBubbleText`                                                   |
| `bubble/link`                            | `RichTextBubbleLink`                                                   |
| `bubble/media`                           | `RichTextBubbleImage`, `RichTextBubbleVideo`, `RichTextBubbleImageGif` |
| `bubble/table`                           | `RichTextBubbleTable`                                                  |
| `bubble/iframe`                          | `RichTextBubbleIframe`                                                 |
| `bubble/drawer`                          | `RichTextBubbleDrawer`                                                 |
| `bubble/excalidraw`                      | `RichTextBubbleExcalidraw`                                             |
| `bubble/mermaid`                         | `RichTextBubbleMermaid`                                                |
| `bubble/twitter`                         | `RichTextBubbleTwitter`                                                |
| `bubble/callout`                         | `RichTextBubbleCallout`                                                |
| `bubble/katex`                           | `RichTextBubbleKatex`                                                  |
| `bubble/drag-handle`                     | `RichTextBubbleMenuDragHandle`                                         |
| `bubble/ai`                              | `RichTextAIImprove`                                                    |

## Feature-Specific Package/CSS Notes

- Image crop UI: install `react-image-crop` and import `react-image-crop/dist/ReactCrop.css`.
- ImageGif with Giphy: configure `ImageGif.configure({ provider: 'giphy', API_KEY })`.
- Always import `richkit/style.css`.
