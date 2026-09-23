<script setup lang="ts">
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import {
  Blockquote,
  Bold,
  BulletList,
  Clear,
  Code,
  Heading,
  History,
  Italic,
  Link,
  ListItem,
  OrderedList,
  RichPaste,
  Strike,
  Table,
  TaskList,
  TextAlign,
  TextUnderline,
  localeActions,
} from 'sparkwrite/core';
import es from 'sparkwrite/locales/es';
import zhCN from 'sparkwrite/locales/zh-cn';
import {
  Divider,
  RichTextBlockquote,
  RichTextBold,
  RichTextBulletList,
  RichTextClear,
  RichTextCode,
  RichTextDivider,
  RichTextHeading,
  RichTextItalic,
  RichTextLink,
  RichTextOrderedList,
  RichTextProvider,
  RichTextRedo,
  RichTextStrike,
  RichTextTable,
  RichTextTaskList,
  RichTextTextAlign,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextToolbarMore,
  RichTextToolbarMoreGroup,
  RichTextToolbarMoreRow,
  RichTextUnderline,
  RichTextUndo,
} from 'sparkwrite/vue';
import { ref, watch } from 'vue';

import 'sparkwrite/style.css';

// Only English is bundled; register the languages you offer.
localeActions.setMessage('zh_CN', zhCN);
localeActions.setMessage('es', es);

const lang = ref('en');
watch(lang, (value) => localeActions.setLang(value));

const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    History,
    Bold,
    Italic,
    TextUnderline,
    Strike,
    Code,
    Clear,
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
    RichPaste,
  ],
  content:
    '<h1>SparkWrite in Vue</h1><p>The same extensions, the same stylesheet, a Vue toolbar. Click a divider to change its style.</p><div data-type="divider" data-variant="text" data-label="Chapter 1"><hr><span class="divider__label">Chapter 1</span><hr></div><p>Type below.</p>',
});

(window as unknown as { editor: unknown }).editor = editor;
</script>

<template>
  <div class="bar">
    <label
      >Language
      <select v-model="lang">
        <option value="en">English</option>
        <option value="zh_CN">中文</option>
        <option value="es">Español</option>
      </select></label
    >
  </div>
  <div class="frame">
    <RichTextProvider :editor="editor">
      <RichTextToolbar>
        <RichTextUndo /><RichTextRedo />
        <RichTextToolbarDivider />
        <RichTextHeading />
        <RichTextToolbarDivider />
        <RichTextBold /><RichTextItalic /><RichTextUnderline /><RichTextStrike /><RichTextCode /><RichTextClear />
        <RichTextToolbarDivider />
        <RichTextBulletList /><RichTextOrderedList /><RichTextTaskList /><RichTextBlockquote /><RichTextTextAlign />
        <RichTextToolbarDivider />
        <RichTextLink /><RichTextTable /><RichTextDivider />
        <RichTextToolbarMore label="More">
          <RichTextToolbarMoreGroup label="Insert">
            <RichTextToolbarMoreRow label="Divider"><RichTextDivider /></RichTextToolbarMoreRow>
            <RichTextToolbarMoreRow label="Table"><RichTextTable /></RichTextToolbarMoreRow>
          </RichTextToolbarMoreGroup>
        </RichTextToolbarMore>
      </RichTextToolbar>
      <EditorContent :editor="editor" />
    </RichTextProvider>
  </div>
</template>
