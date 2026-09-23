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
| Attachment        | `ai-richtext-editor/attachment`       | `Attachment`, `RichTextAttachment`                                                        |
| Blockquote        | `ai-richtext-editor/blockquote`       | `Blockquote`, `RichTextBlockquote`                                                        |
| Bold              | `ai-richtext-editor/bold`             | `Bold`, `RichTextBold`                                                                    |
| Bullet list       | `ai-richtext-editor/bulletlist`       | `BulletList`, `RichTextBulletList`                                                        |
| Callout           | `ai-richtext-editor/callout`          | `Callout`, `RichTextCallout`                                                              |
| Clear formatting  | `ai-richtext-editor/clear`            | `Clear`, `RichTextClear`                                                                  |
| Code              | `ai-richtext-editor/code`             | `Code`, `RichTextCode`                                                                    |
| Code block        | `ai-richtext-editor/codeblock`        | `CodeBlock`, `RichTextCodeBlock`                                                          |
| Code view         | `ai-richtext-editor/codeview`         | `CodeView`, `RichTextCodeView`                                                            |
| Color             | `ai-richtext-editor/color`            | `Color`, `RichTextColor`                                                                  |
| Column            | `ai-richtext-editor/column`           | `Column`, `ColumnNode`, `MultipleColumnNode`, `RichTextColumn`                            |
| Drawer            | `ai-richtext-editor/drawer`           | `Drawer`, `RichTextDrawer`                                                                |
| Emoji             | `ai-richtext-editor/emoji`            | `Emoji`, `RichTextEmoji`                                                                  |
| Excalidraw        | `ai-richtext-editor/excalidraw`       | `Excalidraw`, `RichTextExcalidraw`                                                        |
| Export PDF        | `ai-richtext-editor/exportpdf`        | `ExportPdf`, `RichTextExportPdf`                                                          |
| Export Word       | `ai-richtext-editor/exportword`       | `ExportWord`, `RichTextExportWord`                                                        |
| Font family       | `ai-richtext-editor/fontfamily`       | `FontFamily`, `RichTextFontFamily`                                                        |
| Font size         | `ai-richtext-editor/fontsize`         | `FontSize`, `RichTextFontSize`                                                            |
| Format painter    | `ai-richtext-editor/formatpainter`    | `FormatPainter`, `RichTextFormatPainter`                                                  |
| Heading           | `ai-richtext-editor/heading`          | `Heading`, `RichTextHeading`                                                              |
| Highlight         | `ai-richtext-editor/highlight`        | `Highlight`, `RichTextHighlight`                                                          |
| History           | `ai-richtext-editor/history`          | `History`, `RichTextUndo`, `RichTextRedo`                                                 |
| Horizontal rule   | `ai-richtext-editor/horizontalrule`   | `HorizontalRule`, `RichTextHorizontalRule`                                                |
| Iframe            | `ai-richtext-editor/iframe`           | `Iframe`, `RichTextIframe`                                                                |
| Image             | `ai-richtext-editor/image`            | `Image`, `RichTextImage`                                                                  |
| Image GIF         | `ai-richtext-editor/imagegif`         | `ImageGif`, `RichTextImageGif`                                                            |
| Import Word       | `ai-richtext-editor/importword`       | `ImportWord`, `RichTextImportWord`                                                        |
| Indent            | `ai-richtext-editor/indent`           | `Indent`, `RichTextIndent`                                                                |
| Italic            | `ai-richtext-editor/italic`           | `Italic`, `RichTextItalic`                                                                |
| KaTeX             | `ai-richtext-editor/katex`            | `Katex`, `RichTextKatex`                                                                  |
| Line height       | `ai-richtext-editor/lineheight`       | `LineHeight`, `RichTextLineHeight`                                                        |
| Link              | `ai-richtext-editor/link`             | `Link`, `RichTextLink`                                                                    |
| Markdown paste    | `ai-richtext-editor/markdownpaste`    | `MarkdownPaste`                                                                           |
| Mention           | `ai-richtext-editor/mention`          | `Mention`                                                                                 |
| Mermaid           | `ai-richtext-editor/mermaid`          | `Mermaid`, `RichTextMermaid`                                                              |
| More mark         | `ai-richtext-editor/moremark`         | `MoreMark`, `RichTextMoreMark`                                                            |
| Ordered list      | `ai-richtext-editor/orderedlist`      | `OrderedList`, `RichTextOrderedList`                                                      |
| Search/replace    | `ai-richtext-editor/searchandreplace` | `SearchAndReplace`, `RichTextSearchAndReplace`                                            |
| Short message     | `ai-richtext-editor/shortmessage`     | `ShortMessage`                                                                            |
| Slash command     | `ai-richtext-editor/slashcommand`     | `SlashCommand`, `SlashCommandList`                                                        |
| Strike            | `ai-richtext-editor/strike`           | `Strike`, `RichTextStrike`                                                                |
| Table             | `ai-richtext-editor/table`            | `Table`, `RichTextTable`                                                                  |
| Task list         | `ai-richtext-editor/tasklist`         | `TaskList`, `RichTextTaskList`                                                            |
| Text align        | `ai-richtext-editor/textalign`        | `TextAlign`, `RichTextAlign`                                                              |
| Text direction    | `ai-richtext-editor/textdirection`    | `TextDirection`, `RichTextTextDirection`                                                  |
| Underline         | `ai-richtext-editor/textunderline`    | `TextUnderline`, `RichTextUnderline`                                                      |
| Twitter           | `ai-richtext-editor/twitter`          | `Twitter`, `RichTextTwitter`                                                              |
| Video             | `ai-richtext-editor/video`            | `Video`, `RichTextVideo`                                                                  |
| AI                | `ai-richtext-editor/ai`               | `AI` (bubble UI: `RichTextAIImprove` from `/bubble/ai`)                                   |
| Details           | `ai-richtext-editor/details`          | `Details`, `DetailsSummary`, `DetailsContent`, `RichTextDetails`                          |
| Table of contents | `ai-richtext-editor/tableofcontents`  | `TableOfContents`, `TableOfContentsNode`, `RichTextTableOfContents`, `useTableOfContents` |
| Export Markdown   | `ai-richtext-editor/exportmarkdown`   | `ExportMarkdown`, `RichTextExportMarkdown`, `getMarkdown`                                 |

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
| Provider          | `import { RichTextProvider } from 'ai-richtext-editor';`                |
| Styles            | `import 'ai-richtext-editor/style.css';`                                |
| Bubble components | `import { RichTextBubbleText } from 'ai-richtext-editor/bubble/text';`  |
| Locale            | `import { localeActions, useLocale } from 'ai-richtext-editor/locale';` |
| Theme             | `import { themeActions, useTheme } from 'ai-richtext-editor/theme';`    |

## Bubble Components

The compatibility barrel `ai-richtext-editor/bubble` exports the following. Prefer the specific entry point when available to avoid pulling unrelated feature modules into the import graph:

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

| Subpath (after `ai-richtext-editor/`) | Named exports                                                          |
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
- Always import `ai-richtext-editor/style.css`.
