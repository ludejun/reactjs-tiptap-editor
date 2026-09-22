---
description: Image

next:
  text: ImageGif
  link: /extensions/ImageGif/index.md
---

# Image

Insert images from a URL or an application-provided upload service.

## Setup

Start with the packages in [Getting Started](/guide/getting-started). This complete example registers the feature and renders its UI. In an existing editor, merge the imports and extension entries into your setup, and place the controls inside your existing `RichTextProvider`.

```tsx
'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { RichTextProvider } from 'reactjs-tiptap-editor';
import { Image, RichTextImage } from 'reactjs-tiptap-editor/image';
import { RichTextBubbleImage } from 'reactjs-tiptap-editor/bubble/media';
import 'reactjs-tiptap-editor/style.css';

const extensions = [Document, Paragraph, Text, Image.configure({ resourceImage: 'link' })];

export default function ImageExample() {
  const editor = useEditor({
    extensions,
    content: '<p>Try this feature here.</p>',
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <RichTextProvider editor={editor}>
      <RichTextImage />
      <RichTextBubbleImage />
      <EditorContent editor={editor} />
    </RichTextProvider>
  );
}
```

## How to use

The example starts in URL-only mode so it works without a backend. To enable local files, configure `resourceImage: "both"` or `"upload"` and provide `upload: (file: File) => Promise<string>`. Return a durable image URL; temporary `blob:` URLs will not survive a reload. Mount `RichTextBubbleImage` for image editing controls.

## Inline and block images

`Image.configure()` now registers both image node types used by the editor:

- `image`: the legacy inline node, kept for existing ProseMirror JSON compatibility.
- `imageBlock`: a block-level node used when `defaultInline` is `false` or when `setImageInline({ inline: false })` / `setImageBlock()` inserts an image.

Existing HTML is still accepted:

- `<div class="image"><img ... /></div>` is parsed as `imageBlock`.
- `<p><div class="image"><img inline="false" ... /></div></p>` produced by versions before 1.0.26 is parsed as `imageBlock` without the empty paragraphs the browser adds around it, so the document no longer grows on each save/load.
- `<span class="image"><img inline="true" ... /></span>` is parsed as the inline `image` node.
- Old JSON with `type: "image"` continues to load. If you want to migrate stored JSON, use `migrateImageJSONToImageBlock(json)` before saving the migrated document.

## Image Gif

To search a GIF provider and insert a result, use the separate [ImageGif extension](/extensions/ImageGif/index.md).

## Props

```ts
interface IImageOptions extends GeneralOptions<IImageOptions> {
  /** Function for uploading files */
  upload?: (file: File) => Promise<string>;

  HTMLAttributes?: any;

  multiple?: boolean;
  acceptMimes?: string[];
  maxSize?: number;

  /** The source URL of the image */
  resourceImage: 'upload' | 'link' | 'both';
  defaultInline?: boolean;

  enableAlt?: boolean;

  onError?: (error: { type: 'size' | 'type' | 'upload'; message: string; file?: File }) => void;
}
```

| Property         | Type                                                                                    | Description                                                                                                                                                                                                              | Required | Default                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | -------------------------------------------------------------------------- |
| `upload`         | `(file: File) => Promise<string>`                                                       | Custom image upload function that receives a `File` and returns a Promise with the image URL, suitable for uploading to cloud or local servers.                                                                          | No       | None                                                                       |
| `HTMLAttributes` | `any`                                                                                   | HTML attributes passed to the `<img>` tag, such as `className`, `style`, `alt`, etc.                                                                                                                                     | No       | None                                                                       |
| `multiple`       | `boolean`                                                                               | Whether to allow selecting and uploading multiple images simultaneously.                                                                                                                                                 | No       | `true`                                                                     |
| `acceptMimes`    | `string[]`                                                                              | List of allowed image MIME types or file extension restrictions, such as `['image/jpeg', 'image/png']`, `['image/*']`, or `['.png', '.jpg']`, etc. Supports MIME type wildcards and precise file extension restrictions. | No       | Common image types `['image/jpeg', 'image/gif', 'image/png', 'image/jpg']` |
| `maxSize`        | `number`                                                                                | Maximum size limit for a single image (in bytes), triggers `onError` when exceeded.                                                                                                                                      | No       | `5MB`                                                                      |
| `resourceImage`  | `'upload' \| 'link' \| 'both'`                                                          | Image source method: - `'upload'`: Upload only - `'link'`: Link only - `'both'`: Both supported                                                                                                                          | No       | `both`                                                                     |
| `defaultInline`  | `boolean`                                                                               | Whether to insert images as inline elements by default.                                                                                                                                                                  | No       | `false`                                                                    |
| `enableAlt`      | `boolean`                                                                               | Whether to enable alt text editing for images.                                                                                                                                                                           | No       | `true`                                                                     |
| `onError`        | `(error: { type: 'size' \| 'type' \| 'upload'; message: string; file?: File }) => void` | Callback function for upload or validation failures. Contains error type (size, type, upload), error message, and corresponding file.                                                                                    | No       | None                                                                       |

### resourceImage Type Description

- `'upload'`: Users can only select local files for upload
- `'link'`: Users can only input image URLs
- `'both'`: Supports both upload and URL methods

### acceptMimes Usage Instructions

Supports three format types:

1. **MIME types**: such as `['image/jpeg', 'image/png']`
2. **Wildcard types**: such as `['image/*']`, matches all image MIME types
3. **Extension types**: such as:

```ts
[
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.svg',
  '.svgz',
  '.xbm',
  '.tiff',
  '.ico',
  '.jfif',
  '.heic',
  '.heif',
  '.avif',
  '.bmp',
  '.apng',
  '.pjpeg',
];
```

### onError Example

- Customize error handling logic to unify system prompts.
- We recommend using the message field, which has built-in dynamic prompts and i18n internationalization support.

```ts
onError: ({ type, message, file }) => {
  switch (type) {
    case 'size':
      console.warn(`File size exceeds limit: ${file?.name}`);
      break;
    case 'type':
      console.warn(`Unsupported file type: ${file?.type}`);
      break;
    case 'upload':
      console.error(`Upload failed: ${message}`);
      break;
  }
};
```

## Upload a local image

Replace the URL-only configuration in the setup example with this one. Implement `/api/images` in your application so it accepts a multipart `file` and returns a JSON object with a `url` string:

```ts
Image.configure({
  resourceImage: 'both',
  upload: async (file: File): Promise<string> => {
    const body = new FormData();
    body.append('file', file);
    const response = await fetch('/api/images', { method: 'POST', body });
    if (!response.ok) throw new Error('Image upload failed');
    const data = await response.json();
    if (typeof data.url !== 'string' || !data.url) {
      throw new Error('Upload response must contain an image URL');
    }
    return data.url;
  },
});
```

The library handles the editor UI; your application supplies storage and the upload endpoint. Enforce accepted file types and size limits on that endpoint as well as in the client configuration.

## Options

Everything about the insert dialog is configured on the extension:

```tsx
Image.configure({
  // Required to store files anywhere other than a blob: URL.
  upload: async (file) => (await uploadToYourApi(file)).url,

  // Accepted types, as an `accept` list. The dialog shows the first few of
  // these plus the size limit under the drop zone.
  acceptMimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],

  // Per-file limit in bytes. Default: 5 MB.
  maxSize: 10 * 1024 * 1024,

  // Whether more than one file can be picked or dropped at a time. Default: true.
  multiple: true,

  // 'upload' | 'link' | 'both'. Controls which tabs the dialog shows.
  resourceImage: 'both',

  // Insert images inline with text rather than as their own block. Default: false.
  defaultInline: false,

  // Ask for alt text while inserting. Default: false — most editors let you
  // set it afterwards rather than interrupting the insert.
  enableAlt: false,

  // Called instead of the built-in toast when a file is rejected or fails.
  onError: ({ type, message, file }) => reportToYourApp(type, message, file),
});
```

The default `acceptMimes` covers JPEG, PNG, GIF, WebP, AVIF, BMP, TIFF, HEIC,
HEIF and SVG. Note on SVG: it is inert inside an `<img>`, but it can carry
script, so a host that serves uploads as top-level documents from its own origin
should sanitise them or serve them from a separate origin. Drop `'image/svg+xml'`
from `acceptMimes` if you would rather not accept it at all.

## Captions and rotation

Mount `RichTextBubbleImage` to get the image controls. Two of them are worth
calling out:

- **Rotate** turns the image a quarter turn per click, storing the angle in the
  node's `rotate` attribute and serialising it as `data-rotate` on the `<img>`.
  The older `flipx` / `flipy` attributes are still parsed, so documents written
  by earlier versions keep their flips.
- **Caption** adds a single caption under a block image, stored in the `caption`
  attribute and serialised as `<div class="image-caption">` inside the image
  wrapper. It follows the image's alignment. Clearing the text removes the
  caption, and the button then adds a fresh one. Inline images have no caption,
  so the button is disabled for them.

## Uploads and deleted images

`upload` runs as soon as a file is chosen, so a picture reaches your server
before the document is saved. If the user then deletes the picture, or never
saves, the server keeps a file nothing refers to. The extension tracks enough
to clean that up at save time:

```ts
import { getImageChanges, markImagesSaved } from 'reactjs-tiptap-editor/image';

async function save(editor: Editor) {
  const { current, removed, orphaned } = getImageChanges(editor);

  await api.saveDocument({ html: editor.getHTML(), images: current });
  // `removed`: in the last saved version, gone now.
  // `orphaned`: uploaded in this session, not in the document — inserted and
  // deleted again, or cropped and replaced.
  await api.deleteImages([...removed, ...orphaned]);

  markImagesSaved(editor);
}
```

- `getImageChanges(editor, previous?)` compares the document with a snapshot of
  image sources: the one `markImagesSaved` recorded, or one you pass in (for
  example the list stored with the document on the server, so the first save
  after a reload still finds deletions). It returns `current`, `added`,
  `removed` and `orphaned`.
- `markImagesSaved(editor)` records the current sources as the new baseline and
  stops counting them as orphans.
- `collectImageSources(doc)` lists the sources in any document, for the server
  side of the comparison.

Undo can bring a deleted picture back, so delete server files at save time and
not on every edit. Only sources returned by `upload` are ever reported as
orphaned; pasted or linked URLs are not.
