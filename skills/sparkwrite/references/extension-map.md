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
| Attachment        | `sparkwrite/attachment`       | `Attachment`, `RichTextAttachment`                                                        |
| Blockquote        | `sparkwrite/blockquote`       | `Blockquote`, `RichTextBlockquote`                                                        |
| Bold              | `sparkwrite/bold`             | `Bold`, `RichTextBold`                                                                    |
| Bullet list       | `sparkwrite/bulletlist`       | `BulletList`, `RichTextBulletList`                                                        |
| Callout           | `sparkwrite/callout`          | `Callout`, `RichTextCallout`                                                              |
| Clear formatting  | `sparkwrite/clear`            | `Clear`, `RichTextClear`                                                                  |
| Code              | `sparkwrite/code`             | `Code`, `RichTextCode`                                                                    |
| Code block        | `sparkwrite/codeblock`        | `CodeBlock`, `RichTextCodeBlock`                                                          |
| Code view         | `sparkwrite/codeview`         | `CodeView`, `RichTextCodeView`                                                            |
| Color             | `sparkwrite/color`            | `Color`, `RichTextColor`                                                                  |
| Column            | `sparkwrite/column`           | `Column`, `ColumnNode`, `MultipleColumnNode`, `RichTextColumn`                            |
| Drawer            | `sparkwrite/drawer`           | `Drawer`, `RichTextDrawer`                                                                |
| Emoji             | `sparkwrite/emoji`            | `Emoji`, `RichTextEmoji`                                                                  |
| Excalidraw        | `sparkwrite/excalidraw`       | `Excalidraw`, `RichTextExcalidraw`                                                        |
| Export PDF        | `sparkwrite/exportpdf`        | `ExportPdf`, `RichTextExportPdf`                                                          |
| Export Word       | `sparkwrite/exportword`       | `ExportWord`, `RichTextExportWord`                                                        |
| Font family       | `sparkwrite/fontfamily`       | `FontFamily`, `RichTextFontFamily`                                                        |
| Font size         | `sparkwrite/fontsize`         | `FontSize`, `RichTextFontSize`                                                            |
| Format painter    | `sparkwrite/formatpainter`    | `FormatPainter`, `RichTextFormatPainter`                                                  |
| Heading           | `sparkwrite/heading`          | `Heading`, `RichTextHeading`                                                              |
| Highlight         | `sparkwrite/highlight`        | `Highlight`, `RichTextHighlight`                                                          |
| History           | `sparkwrite/history`          | `History`, `RichTextUndo`, `RichTextRedo`                                                 |
| Horizontal rule   | `sparkwrite/horizontalrule`   | `HorizontalRule`, `RichTextHorizontalRule`                                                |
| Iframe            | `sparkwrite/iframe`           | `Iframe`, `RichTextIframe`                                                                |
| Image             | `sparkwrite/image`            | `Image`, `RichTextImage`                                                                  |
| Image GIF         | `sparkwrite/imagegif`         | `ImageGif`, `RichTextImageGif`                                                            |
| Import Word       | `sparkwrite/importword`       | `ImportWord`, `RichTextImportWord`                                                        |
| Indent            | `sparkwrite/indent`           | `Indent`, `RichTextIndent`                                                                |
| Italic            | `sparkwrite/italic`           | `Italic`, `RichTextItalic`                                                                |
| KaTeX             | `sparkwrite/katex`            | `Katex`, `RichTextKatex`                                                                  |
| Line height       | `sparkwrite/lineheight`       | `LineHeight`, `RichTextLineHeight`                                                        |
| Link              | `sparkwrite/link`             | `Link`, `RichTextLink`                                                                    |
| Markdown paste    | `sparkwrite/markdownpaste`    | `MarkdownPaste`                                                                           |
| Mention           | `sparkwrite/mention`          | `Mention`                                                                                 |
| Mermaid           | `sparkwrite/mermaid`          | `Mermaid`, `RichTextMermaid`                                                              |
| More mark         | `sparkwrite/moremark`         | `MoreMark`, `RichTextMoreMark`                                                            |
| Ordered list      | `sparkwrite/orderedlist`      | `OrderedList`, `RichTextOrderedList`                                                      |
| Search/replace    | `sparkwrite/searchandreplace` | `SearchAndReplace`, `RichTextSearchAndReplace`                                            |
| Short message     | `sparkwrite/shortmessage`     | `ShortMessage`                                                                            |
| Slash command     | `sparkwrite/slashcommand`     | `SlashCommand`, `SlashCommandList`                                                        |
| Strike            | `sparkwrite/strike`           | `Strike`, `RichTextStrike`                                                                |
| Table             | `sparkwrite/table`            | `Table`, `RichTextTable`                                                                  |
| Task list         | `sparkwrite/tasklist`         | `TaskList`, `RichTextTaskList`                                                            |
| Text align        | `sparkwrite/textalign`        | `TextAlign`, `RichTextAlign`                                                              |
| Text direction    | `sparkwrite/textdirection`    | `TextDirection`, `RichTextTextDirection`                                                  |
| Underline         | `sparkwrite/textunderline`    | `TextUnderline`, `RichTextUnderline`                                                      |
| Twitter           | `sparkwrite/twitter`          | `Twitter`, `RichTextTwitter`                                                              |
| Video             | `sparkwrite/video`            | `Video`, `RichTextVideo`                                                                  |
| AI                | `sparkwrite/ai`               | `AI` (bubble UI: `RichTextAIImprove` from `/bubble/ai`)                                   |
| Details           | `sparkwrite/details`          | `Details`, `DetailsSummary`, `DetailsContent`, `RichTextDetails`                          |
| Table of contents | `sparkwrite/tableofcontents`  | `TableOfContents`, `TableOfContentsNode`, `RichTextTableOfContents`, `useTableOfContents` |
| Export Markdown   | `sparkwrite/exportmarkdown`   | `ExportMarkdown`, `RichTextExportMarkdown`, `getMarkdown`                                 |

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
| Provider          | `import { RichTextProvider } from 'sparkwrite';`                |
| Styles            | `import 'sparkwrite/style.css';`                                |
| Bubble components | `import { RichTextBubbleText } from 'sparkwrite/bubble/text';`  |
| Locale            | `import { localeActions, useLocale } from 'sparkwrite/locale';` |
| Theme             | `import { themeActions, useTheme } from 'sparkwrite/theme';`    |

## Bubble Components

The compatibility barrel `sparkwrite/bubble` exports the following. Prefer the specific entry point when available to avoid pulling unrelated feature modules into the import graph:

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

| Subpath (after `sparkwrite/`) | Named exports                                                          |
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
- Always import `sparkwrite/style.css`.
