---
description: Iframe

next:
  text: Image
  link: /extensions/Image/index.md
---

# Iframe

Embed a YouTube video, a Figma file, a Google Sheet, a map, a CodePen — 35 services recognised from their share links — or any web page.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). The complete example below registers the feature and renders its UI — pick the React or the Vue tab. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

::: code-group

```tsx [React]
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import {
  RichTextProvider,
  Iframe,
  RichTextIframe,
  RichTextBubbleIframe,
} from 'ai-sparkwrite-editor';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

export default function IframeExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextIframe />
      <RichTextBubbleIframe />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

```vue [Vue]
<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { Iframe, RichTextProvider, RichTextIframe } from 'ai-sparkwrite-editor/vue';
import 'ai-sparkwrite-editor/style.css';

const extensions = [Document, Paragraph, Text, Iframe];

const editor = useEditor({
  extensions,
  content: '<p>Try this feature here.</p>',
});
</script>

<template>
  <RichTextProvider :editor="editor">
    <RichTextIframe />
    <EditorContent :editor="editor" />
  </RichTextProvider>
</template>
```

:::

::: tip Vue
Not in the Vue layer yet: `RichTextBubbleIframe` — run the corresponding command from your own control, or see [Frameworks](/guide/frameworks).
:::

## How to use

Click **Embed** in the toolbar (or type `/embed`, `/youtube`, `/figma`…), then paste a **share link** — the kind you copy from the address bar — or the whole `<iframe>` code from a service's _Embed_ dialog. The block recognises the service, converts the link to its embeddable URL, sizes the frame for it (16:9 for video, tall for forms) and shows which service it detected. Mount `RichTextBubbleIframe` for contextual controls (resize, open, delete).

| Services                                                                              | Kind                 | What you get                                                                                                        |
| ------------------------------------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| YouTube, Vimeo, Bilibili, Youku, Tencent Video, Loom, Descript                        | Video                | 16:9 player                                                                                                         |
| Spotify, SoundCloud                                                                   | Audio                | compact player                                                                                                      |
| Google Maps, AMap, Baidu Maps                                                         | Maps                 | a place or search link becomes an embedded map; for short Google links use _Share → Embed a map_ and paste the code |
| Figma, Canva, Miro, Whimsical, Excalidraw, dbdiagram, ProcessOn, Modao, Lanhu, Framer | Design & whiteboards | live, pannable file                                                                                                 |
| CodePen, CodeSandbox, StackBlitz, JSFiddle, GitHub Gist                               | Code                 | result or code view                                                                                                 |
| Google Docs, Google Sheets, Google Slides, Airtable, Trello, ClickUp                  | Documents & data     | read-only preview                                                                                                   |
| Google Forms, Typeform, Jinshuju                                                      | Forms                | the form itself                                                                                                     |
| Any other `https://` page                                                             | Web page             | shown as it is; the site decides whether it allows framing                                                          |

Some sites refuse to be framed (Notion pages, most banking or login pages); the frame then stays blank — that is the site's choice, not the editor's. Make sure your application's content-security policy allows the embedded origins.

## From code

```ts
import { resolveEmbed, EMBED_SERVICES } from 'ai-sparkwrite-editor';

const embed = resolveEmbed('https://youtu.be/I4sMhHbHYXM');
// { service: { key: 'youtube', name: 'YouTube', … }, src: 'https://www.youtube.com/embed/I4sMhHbHYXM', height: 338, url }

editor
  .chain()
  .focus()
  .setIframe({ src: embed.src, service: embed.service.key, height: embed.height })
  .run();
```

`EMBED_SERVICES` is the list of recognised services (key, name, kind, link pattern, example, tips); `resolveEmbed()` returns `null` for anything that is not a link. Saved HTML carries `data-service` on the `<iframe>` so a read-only page can style or label frames per service.
