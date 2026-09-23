<script setup lang="ts">
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Bold, Heading, History, Italic, ListItem, BulletList } from 'ai-sparkwrite-editor/core';
import {
  Divider,
  RichTextBold,
  RichTextBulletList,
  RichTextDivider,
  RichTextHeading,
  RichTextItalic,
  RichTextProvider,
  RichTextRedo,
  RichTextToolbar,
  RichTextToolbarDivider,
  RichTextUndo,
} from 'ai-sparkwrite-editor/vue';

defineProps<{ dark: boolean }>();

const editor = useEditor({
  extensions: [Document, Paragraph, Text, History, Bold, Italic, Heading, BulletList, ListItem, Divider],
  content: '<h1>SparkWrite in Vue</h1><p>Placeholder until the Vue layer lands.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor" :dark="dark">
    <div class="overflow-hidden rounded-[0.5rem] bg-background shadow outline outline-1">
      <RichTextToolbar>
        <RichTextUndo /><RichTextRedo />
        <RichTextToolbarDivider />
        <RichTextHeading /><RichTextBold /><RichTextItalic /><RichTextBulletList /><RichTextDivider />
      </RichTextToolbar>
      <EditorContent :editor="editor" />
    </div>
  </RichTextProvider>
</template>
