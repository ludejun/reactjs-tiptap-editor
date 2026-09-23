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

| Feature           | Extension import              | Toolbar/component import                                                                  |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| Attachment        | `ai-sparkwrite-editor/attachment`       | `Attachment`, `RichTextAttachment`                                                        |
| Blockquote        | `ai-sparkwrite-editor/blockquote`       | `Blockquote`, `RichTextBlockquote`                                                        |
| Bold              | `ai-sparkwrite-editor/bold`             | `Bold`, `RichTextBold`                                                                    |
| Bullet list       | `ai-sparkwrite-editor/bulletlist`       | `BulletList`, `RichTextBulletList`                                                        |
| Callout           | `ai-sparkwrite-editor/callout`          | `Callout`, `RichTextCallout`                                                              |
| Clear formatting  | `ai-sparkwrite-editor/clear`            | `Clear`, `RichTextClear`                                                                  |
| Code              | `ai-sparkwrite-editor/code`             | `Code`, `RichTextCode`                                                                    |
| Code block        | `ai-sparkwrite-editor/codeblock`        | `CodeBlock`, `RichTextCodeBlock`                                                          |
| Code view         | `ai-sparkwrite-editor/codeview`         | `CodeView`, `RichTextCodeView`                                                            |
| Color             | `ai-sparkwrite-editor/color`            | `Color`, `RichTextColor`                                                                  |
| Column            | `ai-sparkwrite-editor/column`           | `Column`, `ColumnNode`, `MultipleColumnNode`, `RichTextColumn`                            |
| Drawer            | `ai-sparkwrite-editor/drawer`           | `Drawer`, `RichTextDrawer`                                                                |
| Emoji             | `ai-sparkwrite-editor/emoji`            | `Emoji`, `RichTextEmoji`                                                                  |
| Excalidraw        | `ai-sparkwrite-editor/excalidraw`       | `Excalidraw`, `RichTextExcalidraw`                                                        |
| Export PDF        | `ai-sparkwrite-editor/exportpdf`        | `ExportPdf`, `RichTextExportPdf`                                                          |
| Export Word       | `ai-sparkwrite-editor/exportword`       | `ExportWord`, `RichTextExportWord`                                                        |
| Font family       | `ai-sparkwrite-editor/fontfamily`       | `FontFamily`, `RichTextFontFamily`                                                        |
| Font size         | `ai-sparkwrite-editor/fontsize`         | `FontSize`, `RichTextFontSize`                                                            |
| Format painter    | `ai-sparkwrite-editor/formatpainter`    | `FormatPainter`, `RichTextFormatPainter`                                                  |
| Heading           | `ai-sparkwrite-editor/heading`          | `Heading`, `RichTextHeading`                                                              |
| Highlight         | `ai-sparkwrite-editor/highlight`        | `Highlight`, `RichTextHighlight`                                                          |
| History           | `ai-sparkwrite-editor/history`          | `History`, `RichTextUndo`, `RichTextRedo`                                                 |
| Horizontal rule   | `ai-sparkwrite-editor/horizontalrule`   | `HorizontalRule`, `RichTextHorizontalRule`                                                |
| Iframe            | `ai-sparkwrite-editor/iframe`           | `Iframe`, `RichTextIframe`                                                                |
| Image             | `ai-sparkwrite-editor/image`            | `Image`, `RichTextImage`                                                                  |
| Image GIF         | `ai-sparkwrite-editor/imagegif`         | `ImageGif`, `RichTextImageGif`                                                            |
| Import Word       | `ai-sparkwrite-editor/importword`       | `ImportWord`, `RichTextImportWord`                                                        |
| Indent            | `ai-sparkwrite-editor/indent`           | `Indent`, `RichTextIndent`                                                                |
| Italic            | `ai-sparkwrite-editor/italic`           | `Italic`, `RichTextItalic`                                                                |
| KaTeX             | `ai-sparkwrite-editor/katex`            | `Katex`, `RichTextKatex`                                                                  |
| Line height       | `ai-sparkwrite-editor/lineheight`       | `LineHeight`, `RichTextLineHeight`                                                        |
| Link              | `ai-sparkwrite-editor/link`             | `Link`, `RichTextLink`                                                                    |
| Markdown paste    | `ai-sparkwrite-editor/markdownpaste`    | `MarkdownPaste`                                                                           |
| Mention           | `ai-sparkwrite-editor/mention`          | `Mention`                                                                                 |
| Mermaid           | `ai-sparkwrite-editor/mermaid`          | `Mermaid`, `RichTextMermaid`                                                              |
| More mark         | `ai-sparkwrite-editor/moremark`         | `MoreMark`, `RichTextMoreMark`                                                            |
| Ordered list      | `ai-sparkwrite-editor/orderedlist`      | `OrderedList`, `RichTextOrderedList`                                                      |
| Search/replace    | `ai-sparkwrite-editor/searchandreplace` | `SearchAndReplace`, `RichTextSearchAndReplace`                                            |
| Short message     | `ai-sparkwrite-editor/shortmessage`     | `ShortMessage`                                                                            |
| Slash command     | `ai-sparkwrite-editor/slashcommand`     | `SlashCommand`, `SlashCommandList`                                                        |
| Strike            | `ai-sparkwrite-editor/strike`           | `Strike`, `RichTextStrike`                                                                |
| Table             | `ai-sparkwrite-editor/table`            | `Table`, `RichTextTable`                                                                  |
| Task list         | `ai-sparkwrite-editor/tasklist`         | `TaskList`, `RichTextTaskList`                                                            |
| Text align        | `ai-sparkwrite-editor/textalign`        | `TextAlign`, `RichTextAlign`                                                              |
| Text direction    | `ai-sparkwrite-editor/textdirection`    | `TextDirection`, `RichTextTextDirection`                                                  |
| Underline         | `ai-sparkwrite-editor/textunderline`    | `TextUnderline`, `RichTextUnderline`                                                      |
| Twitter           | `ai-sparkwrite-editor/twitter`          | `Twitter`, `RichTextTwitter`                                                              |
| Video             | `ai-sparkwrite-editor/video`            | `Video`, `RichTextVideo`                                                                  |
| AI                | `ai-sparkwrite-editor/ai`               | `AI` (bubble UI: `RichTextAIImprove` from `/bubble/ai`)                                   |
| Details           | `ai-sparkwrite-editor/details`          | `Details`, `DetailsSummary`, `DetailsContent`, `RichTextDetails`                          |
| Table of contents | `ai-sparkwrite-editor/tableofcontents`  | `TableOfContents`, `TableOfContentsNode`, `RichTextTableOfContents`, `useTableOfContents` |
| Export Markdown   | `ai-sparkwrite-editor/exportmarkdown`   | `ExportMarkdown`, `RichTextExportMarkdown`, `getMarkdown`                                 |

For AI endpoint/protocol options, inspect `src/extensions/AI/types.ts` or installed declarations before configuring a backend. For Details/TableOfContents options, inspect their implementation and bundled child extensions rather than registering every exported node.

## Supporting Extensions

- BulletList and OrderedList require ListItem.
- Color, FontFamily, and FontSize use TextStyle.
- Register all three column extensions: Column, ColumnNode, MultipleColumnNode.
- Table registers TableRow, TableHeader, TableCell, and TableCellBackground internally.
- TaskList registers TaskItem internally; Details registers its summary/content nodes; TableOfContents registers its node internally.
- Check for overlaps with StarterKit and existing extensions before adding another registration.

## Non-Extension Imports

| Purpose           | Import                                                          |
| ----------------- | --------------------------------------------------------------- |
| Provider          | `import { RichTextProvider } from 'ai-sparkwrite-editor';`                |
| Styles            | `import 'ai-sparkwrite-editor/style.css';`                                |
| Bubble components | `import { RichTextBubbleText } from 'ai-sparkwrite-editor/bubble/text';`  |
| Locale            | `import { localeActions, useLocale } from 'ai-sparkwrite-editor/locale';` |
| Theme             | `import { themeActions, useTheme } from 'ai-sparkwrite-editor/theme';`    |

## Bubble Components

The compatibility barrel `ai-sparkwrite-editor/bubble` exports the following. Prefer the specific entry point when available to avoid pulling unrelated feature modules into the import graph:

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

| Subpath (after `ai-sparkwrite-editor/`) | Named exports                                                          |
| ----------------------------- | ---------------------------------------------------------------------- |
| `bubble/text`                 | `RichTextBubbleText`                                                   |
| `bubble/link`                 | `RichTextBubbleLink`                                                   |
| `bubble/media`                | `RichTextBubbleImage`, `RichTextBubbleVideo`, `RichTextBubbleImageGif` |
| `bubble/table`                | `RichTextBubbleTable`                                                  |
| `bubble/iframe`               | `RichTextBubbleIframe`                                                 |
| `bubble/drawer`               | `RichTextBubbleDrawer`                                                 |
| `bubble/excalidraw`           | `RichTextBubbleExcalidraw`                                             |
| `bubble/mermaid`              | `RichTextBubbleMermaid`                                                |
| `bubble/twitter`              | `RichTextBubbleTwitter`                                                |
| `bubble/callout`              | `RichTextBubbleCallout`                                                |
| `bubble/katex`                | `RichTextBubbleKatex`                                                  |
| `bubble/drag-handle`          | `RichTextBubbleMenuDragHandle`                                         |
| `bubble/ai`                   | `RichTextAIImprove`                                                    |

## Feature-Specific Package/CSS Notes

- Image crop UI: install `react-image-crop` and import `react-image-crop/dist/ReactCrop.css`.
- ImageGif with Giphy: configure `ImageGif.configure({ provider: 'giphy', API_KEY })`.
- Always import `ai-sparkwrite-editor/style.css`.
