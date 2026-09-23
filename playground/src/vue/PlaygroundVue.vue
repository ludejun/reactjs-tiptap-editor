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
} from 'ai-sparkwrite-editor/core';
import {
  AI,
  AIAutocomplete,
  Attachment,
  Callout,
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
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBulletList,
  RichTextCallout,
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
  type AIRequest,
} from 'ai-sparkwrite-editor/vue';

defineProps<{ dark: boolean }>();

/** Fake upload: the file as a blob URL after a short delay. */
function demoUpload(file: File): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(URL.createObjectURL(file)), 300));
}

/**
 * Answers itself so the AI flow — streaming, markdown rendering, Apply, the
 * composer writing into the document, ghost text — can be tried without a
 * key. `window.__aiGenerate` overrides it (used by the browser checks).
 */
async function demoAIGenerate(
  request: AIRequest,
  onChunk?: (text: string) => void
): Promise<string> {
  const override = (window as unknown as { __aiGenerate?: typeof demoAIGenerate }).__aiGenerate;

  if (override) {
    return override(request, onChunk);
  }

  const last = request.messages[request.messages.length - 1]?.content ?? '';

  // Ghost-text autocomplete asks for a short continuation, not a document.
  if (last.startsWith('Text before the caret:')) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return ' and this is a suggested continuation.';
  }

  const selected = /Selected text:\n([\s\S]*?)(?:\n\n|$)/.exec(last)?.[1]?.trim();
  const answer = /translate/i.test(last)
    ? `${selected ?? 'Nothing selected'} *(translated — demo)*`
    : [
        '## Summary *(demo answer)*',
        '',
        selected ? `You selected **${selected.slice(0, 60)}**.` : 'No text was selected.',
        '',
        '| Step | What happens |',
        '| --- | --- |',
        '| 1 | Text streams in from the provider |',
        '| 2 | Markdown is rendered through the editor schema |',
        '| 3 | Apply inserts real nodes |',
        '',
        '```ts',
        "editor.commands.applyAI('## Summary…');",
        '```',
        '',
        '- [x] streaming',
        '- [ ] your API key (configure `model` and `apiKey` to use a real model)',
      ].join('\n');

  for (const piece of answer.match(/[\s\S]{1,8}/g) ?? []) {
    request.signal.throwIfAborted();
    await new Promise((resolve) => setTimeout(resolve, 12));
    onChunk?.(piece);
  }

  return answer;
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
    '<h1>SparkWrite in Vue</h1>',
    '<p>Everything on this page is the Vue layer: <code>ai-sparkwrite-editor/core</code> for the extensions, <code>ai-sparkwrite-editor/vue</code> for the UI. The React and Vue toolbars share one stylesheet.</p>',
    '<p>The same extensions, the same stylesheet, a Vue toolbar. Select some text to see the bubble menu, right-click the table for its menu, put the caret in <a href="https://tiptap.dev">this link</a>, or click the <strong>AI</strong> button.</p>',
    '<table><tbody><tr><th>Layer</th><th>Entry</th></tr><tr><td>Core</td><td>ai-sparkwrite-editor/core</td></tr><tr><td>Vue</td><td>ai-sparkwrite-editor/vue</td></tr></tbody></table>',
    '<div data-type="divider" data-variant="text" data-label="Chapter 1"><hr><span class="divider__label">Chapter 1</span><hr></div>',
    '<p>Type below. Pressing Space on an empty line asks AI; a pause at the end of a sentence suggests a continuation (Tab accepts).</p>',
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
      <RichTextBubbleImage />
    </div>
  </RichTextProvider>
</template>
