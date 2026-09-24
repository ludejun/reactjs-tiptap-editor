<script setup lang="ts">
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import {
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  Color,
  Details,
  FontSize,
  Heading,
  Highlight,
  History,
  Indent,
  Italic,
  LineHeight,
  Link,
  ListItem,
  OrderedList,
  RichPaste,
  Strike,
  Table,
  TaskList,
  TextAlign,
  TextUnderline,
  Video,
  AI,
  AIAutocomplete,
  Attachment,
  Callout,
  Notice,
  CodeBlock,
  Divider,
  Iframe,
  Image,
  Katex,
  Mermaid,
  RichTextAI,
  RichTextAIComposer,
  RichTextAttachment,
  RichTextBlockquote,
  RichTextBold,
  RichTextBubbleImage,
  RichTextBubbleLink,
  RichTextBubbleNotice,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBulletList,
  RichTextCallout,
  RichTextNotice,
  RichTextClear,
  RichTextCode,
  RichTextCodeBlock,
  RichTextColor,
  RichTextDetails,
  RichTextDivider,
  RichTextFontSize,
  RichTextHeading,
  RichTextHighlight,
  RichTextIframe,
  RichTextImage,
  RichTextIndent,
  RichTextItalic,
  RichTextKatex,
  RichTextLineHeight,
  RichTextLink,
  RichTextMermaid,
  RichTextOrderedList,
  RichTextOutdent,
  RichTextProvider,
  RichTextRedo,
  RichTextStrike,
  RichTextTable,
  RichTextTableOfContents,
  RichTextTaskList,
  RichTextTextAlign,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
  RichTextUnderline,
  RichTextUndo,
  RichTextVideo,
  TableOfContents,
} from 'ai-sparkwrite-editor/vue';

import { demoAIGenerate } from '../demoAI';

defineProps<{ dark: boolean }>();

/** Fake upload: the file as a blob URL after a short delay. */
function demoUpload(file: File): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 300));
}

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    TextStyle,
    History,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    Code,
    Clear,
    Color,
    Highlight,
    FontSize,
    LineHeight,
    Indent,
    Heading,
    BulletList,
    ListItem,
    OrderedList,
    TaskList,
    Blockquote,
    Link,
    Table,
    TextAlign,
    Divider,
    CodeBlock,
    Callout,
    Notice,
    Details,
    Image.configure({ upload: demoUpload, enableAlt: true }),
    Video.configure({ upload: demoUpload }),
    Iframe,
    Katex,
    Mermaid,
    Attachment.configure({ upload: demoUpload }),
    TableOfContents,
    RichPaste,
    AI.configure({ generate: demoAIGenerate }),
    AIAutocomplete,
  ],
  content: [
    '<h1>ai-sparkwrite-editor in Vue</h1>',
    '<p>Everything on this page is the Vue layer: <code>ai-sparkwrite-editor/core</code> for the extensions, <code>ai-sparkwrite-editor/vue</code> for the UI. The React and Vue toolbars share one stylesheet.</p>',
    '<p>The same extensions, the same stylesheet, a Vue toolbar. Select some text to see the bubble menu, right-click the table for its menu, put the caret in <a href="https://tiptap.dev">this link</a>, or click the <strong>AI</strong> button.</p>',
    '<table><tbody><tr><th>Layer</th><th>Entry</th></tr><tr><td>Core</td><td>ai-sparkwrite-editor/core</td></tr><tr><td>Vue</td><td>ai-sparkwrite-editor/vue</td></tr></tbody></table>',
    '<div data-type="divider" data-variant="text" data-label="Chapter 1"><hr><span class="divider__label">Chapter 1</span><hr></div>',
    '<p>Type below. Pressing Space on an empty line asks AI; a pause at the end of a sentence suggests a continuation (Tab accepts).</p>',
    '<p>try Fix grammar: teh editor recieves your text and  fixes it, i promise</p>',
    '<p></p>',
  ].join(''),
});

// The React side owns `window.editor`; the Vue editor is reachable as `window.vueEditor`.
(window as unknown as { vueEditor: unknown }).vueEditor = editor;
</script>

<template>
  <RichTextProvider :editor="editor" :dark="dark">
    <div class="overflow-hidden rounded-[0.5rem] bg-background shadow outline outline-1">
      <RichTextToolbar>
        <RichTextUndo /><RichTextRedo />
        <RichTextToolbarDivider />
        <RichTextHeading />
        <RichTextToolbarDivider />
        <RichTextBold /><RichTextItalic /><RichTextUnderline /><RichTextStrike /><RichTextCode /><RichTextClear />
        <RichTextColor /><RichTextHighlight />
        <RichTextToolbarDivider />
        <RichTextBulletList /><RichTextOrderedList /><RichTextTaskList /><RichTextBlockquote /><RichTextTextAlign />
        <RichTextToolbarDivider />
        <RichTextLink /><RichTextImage /><RichTextTable /><RichTextDivider />
        <RichTextToolbarDivider />
        <RichTextAI />
        <RichTextToolbarMore label="More">
          <RichTextToolbarMoreGroup label="Text">
            <RichTextToolbarMoreRow label="Font size"><RichTextFontSize /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Line height"
              ><RichTextLineHeight
            /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Indent"><RichTextIndent /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Outdent"><RichTextOutdent /></RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>
          <RichTextToolbarMoreGroup label="Insert">
            <RichTextToolbarMoreRow label="Code block"
              ><RichTextCodeBlock
            /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Callout"><RichTextCallout /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Notice"><RichTextNotice /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Toggle list"><RichTextDetails /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Table of contents"
              ><RichTextTableOfContents
            /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Video"><RichTextVideo /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Iframe"><RichTextIframe /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Attachment"
              ><RichTextAttachment
            /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Formula"><RichTextKatex /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Mermaid"><RichTextMermaid /></RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>
        </RichTextToolbarMore>
      </RichTextToolbar>
      <EditorContent :editor="editor" />
      <RichTextAIComposer />
      <RichTextBubbleText />
      <RichTextBubbleTable />
      <RichTextBubbleLink />
      <RichTextBubbleNotice />
      <RichTextBubbleImage />
    </div>
  </RichTextProvider>
</template>
