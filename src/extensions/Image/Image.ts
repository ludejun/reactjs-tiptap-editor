import { mergeAttributes } from '@tiptap/core';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { NodeSelection, type EditorState } from '@tiptap/pm/state';

import type { ImageLifecycleStorage } from '@/extensions/Image/imageLifecycle';
import type { ButtonViewParams, GeneralOptions, JSONContent } from '@/types';

export const IMAGE_BLOCK_NAME = 'imageBlock';

export interface SetImageAttrsOptions {
  src?: string;
  /** The alternative text for the image. */
  alt?: string;
  /** The caption of the image; `null` removes it. */
  caption?: string | null;
  /** The width of the image. */
  width?: number | string | null;
  /** The alignment of the image. */
  align?: 'left' | 'center' | 'right';
  /** Whether the image is inline. */
  inline?: boolean;
  /** image FlipX */
  flipX?: boolean;
  /** image FlipY */
  flipY?: boolean;
  /** Clockwise rotation in degrees, one of 0 / 90 / 180 / 270. */
  rotate?: number;
}

export const DEFAULT_OPTIONS = {
  /**
   * Everything a browser can render in an `<img>`. Override with
   * `Image.configure({ acceptMimes })` to narrow or widen it.
   *
   * SVG is included because it is a mainstream image format, but note that it
   * can carry script: it is inert inside an `<img>`, yet a host that serves
   * uploads as top-level documents from its own origin should sanitise them.
   */
  acceptMimes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/bmp',
    'image/tiff',
    'image/heic',
    'image/heif',
    'image/svg+xml',
  ],
  maxSize: 1024 * 1024 * 5, // 5MB, override with `Image.configure({ maxSize })`
  multiple: true,
  resourceImage: 'both' as const,
  defaultInline: false,
  // Off by default: mature editors do not ask for alt text while inserting.
  // Turn it on with `Image.configure({ enableAlt: true })`.
  enableAlt: false,
};

function parseBooleanHTMLAttribute(value: string | boolean | null | undefined): boolean | null {
  if (value === null || value === undefined) {
    return null;
  }

  return value === true || value === '' || value === 'true';
}

function getBooleanHTMLAttribute(value: string | boolean | null | undefined): boolean {
  return parseBooleanHTMLAttribute(value) ?? false;
}

function parseImageWidth(width: string | null): number | string | null {
  if (!width) {
    return null;
  }

  const normalizedWidth = width.trim();
  return normalizedWidth.endsWith('%') ? normalizedWidth : Number.parseInt(normalizedWidth, 10);
}

function getImageElement(element: HTMLElement): HTMLImageElement | null {
  if (element.matches('img')) {
    return element as HTMLImageElement;
  }

  return element.querySelector('img');
}

function getImageAttrsFromElement(element: HTMLElement, inlineFallback = false) {
  const img = getImageElement(element);

  if (!img) {
    return false;
  }

  const width = img.style.width || img.getAttribute('width');
  const flipX = img.getAttribute('flipx') || false;
  const flipY = img.getAttribute('flipy') || false;
  const inline = parseBooleanHTMLAttribute(img.getAttribute('inline')) ?? inlineFallback;

  return {
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt'),
    // The caption is rendered as its own element; the `caption` attribute is the
    // pre-1.0.47 form and is still read so older documents keep theirs.
    caption: element.querySelector('.image-caption')?.textContent ?? img.getAttribute('caption'),
    width: parseImageWidth(width),
    align: img.getAttribute('align') || element.style.textAlign || null,
    inline,
    flipX: flipX === 'true',
    flipY: flipY === 'true',
    rotate: parseRotation(img.getAttribute('data-rotate')),
  };
}

/**
 * Reads `data-rotate` from the element or the image inside it.
 *
 * Attribute-level `parseHTML` is handed whatever element the parse rule matched
 * — the `div.image` wrapper as well as a bare `img` — and tiptap only falls back
 * to the rule's own `getAttrs` when this returns null, so an absent attribute
 * must not come back as 0.
 */
function readRotateAttribute(element: HTMLElement): number | null {
  const own = element.getAttribute('data-rotate');

  if (own !== null) {
    return parseRotation(own);
  }

  const nested = element.querySelector?.('img')?.getAttribute('data-rotate');

  return nested === null || nested === undefined ? null : parseRotation(nested);
}

/** Normalises any stored value to one of 0 / 90 / 180 / 270. */
export function parseRotation(value: string | number | null | undefined): number {
  const degrees = typeof value === 'number' ? value : Number.parseInt(value ?? '', 10);

  if (!Number.isFinite(degrees)) {
    return 0;
  }

  const normalized = (((Math.round(degrees / 90) * 90) % 360) + 360) % 360;
  return normalized;
}

/**
 * Versions before 1.0.26 rendered block images as `<p><div class="image"><img inline="false"></div></p>`.
 * The browser HTML parser closes the `<p>` before the `<div>`, leaving an empty
 * paragraph on each side of the image. Those legacy wrappers are identified by the
 * `inline="false"` attribute, which the current renderer no longer emits.
 */
function isLegacyBlockImageWrapper(element: Element | null): boolean {
  return (
    !!element &&
    element.matches('div.image') &&
    element.querySelector('img')?.getAttribute('inline') === 'false'
  );
}

function isEmptyParagraphNextToLegacyBlockImage(element: HTMLElement): boolean {
  if (element.childElementCount > 0 || element.textContent?.trim()) {
    return false;
  }

  return (
    isLegacyBlockImageWrapper(element.previousElementSibling) ||
    isLegacyBlockImageWrapper(element.nextElementSibling)
  );
}

function getTransformStyle(flipX: boolean, flipY: boolean, rotate: number = 0): string {
  const transforms: string[] = [];

  if (flipX) transforms.push('rotateX(180deg)');
  if (flipY) transforms.push('rotateY(180deg)');
  if (rotate) transforms.push(`rotate(${rotate}deg)`);

  return transforms.length ? `transform: ${transforms.join(' ')};` : '';
}

function getActiveImageNodeName(state: EditorState, fallbackName: string): string {
  const selectedNodeName =
    state.selection instanceof NodeSelection ? state.selection.node.type.name : undefined;

  if (selectedNodeName === IMAGE_BLOCK_NAME) {
    return IMAGE_BLOCK_NAME;
  }

  return fallbackName;
}

/** Which node an inserted image becomes: the block node unless asked for inline. */
export function getImageInsertNodeName(
  state: EditorState,
  inline: boolean,
  fallbackName: string
): string {
  if (!inline && state.schema.nodes[IMAGE_BLOCK_NAME]) {
    return IMAGE_BLOCK_NAME;
  }

  return fallbackName;
}

function isInlineJSONImage(node: JSONContent): boolean {
  return parseBooleanHTMLAttribute(node.attrs?.inline) === true;
}

function isLegacyBlockImageJSON(node: JSONContent): boolean {
  return node.type === 'image' && !isInlineJSONImage(node);
}

function toImageBlockJSON(node: JSONContent): JSONContent {
  const { inline: _inline, ...attrs } = node.attrs ?? {};

  return {
    type: IMAGE_BLOCK_NAME,
    attrs: {
      ...attrs,
      inline: false,
    },
  };
}

/**
 * Converts old JSON documents that stored block images as paragraph-wrapped `image`
 * inline nodes into the new `imageBlock` node. The original `image` node remains
 * supported, so using this helper is optional and can be done during persistence migration.
 */
export function migrateImageJSONToImageBlock(content: JSONContent): JSONContent {
  const nextContent = content.content?.map((node) => migrateImageJSONToImageBlock(node));

  if (content.type === 'paragraph' && content.content?.length === 1) {
    const onlyChild = content.content[0];

    if (onlyChild && isLegacyBlockImageJSON(onlyChild)) {
      return toImageBlockJSON(onlyChild);
    }
  }

  return {
    ...content,
    ...(nextContent ? { content: nextContent } : {}),
  };
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      /**
       * Add an image
       */
      setImageInline: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      /**
       * Add a block image
       */
      setImageBlock: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      /**
       * Update an image
       */
      updateImage: (options: Partial<SetImageAttrsOptions>) => ReturnType;
      /**
       * Set image alignment
       */
      setAlignImage: (align: 'left' | 'center' | 'right') => ReturnType;
    };
  }
}

export interface IImageOptions extends GeneralOptions<IImageOptions> {
  /** Function for uploading files */
  upload?: (file: File) => Promise<string>;

  HTMLAttributes: Record<string, unknown>;
  allowBase64?: boolean;

  multiple?: boolean;
  acceptMimes?: string[];
  maxSize?: number;

  /** The source URL of the image */
  resourceImage: 'upload' | 'link' | 'both';
  defaultInline?: boolean;

  // Enable alternative text input
  enableAlt?: boolean;

  /** Function to handle errors during file validation */
  onError?: (error: { type: 'size' | 'type' | 'upload'; message: string; file?: File }) => void;
}

function getImageOptions(extension: { parent?: () => Partial<IImageOptions> }) {
  return {
    divider: false,
    spacer: false,
    button: () => ({ componentProps: {} }),
    HTMLAttributes: {},
    ...DEFAULT_OPTIONS,
    ...extension.parent?.(),
    upload: () => Promise.reject('Image Upload Function'),
  };
}

/**
 * The block image without a node view. `ImageCore` registers it; the React
 * and Vue packages extend both with their node views.
 */
export const ImageBlockCore = /* @__PURE__ */ TiptapImage.extend<IImageOptions>({
  name: IMAGE_BLOCK_NAME,
  group: 'block',
  inline: false,
  defining: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return getImageOptions(this);
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      flipX: {
        default: false,
        renderHTML: (attributes) => {
          return {
            flipx: attributes.flipX ? 'true' : null,
          };
        },
      },
      flipY: {
        default: false,
        renderHTML: (attributes) => {
          return {
            flipy: attributes.flipY ? 'true' : null,
          };
        },
      },
      rotate: {
        default: 0,
        parseHTML: (element) => readRotateAttribute(element as HTMLElement),
        renderHTML: (attributes) => {
          const rotate = parseRotation(attributes.rotate);
          return {
            'data-rotate': rotate ? String(rotate) : null,
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element) =>
          element.closest('.image')?.querySelector('.image-caption')?.textContent ??
          element.getAttribute('caption'),
        // Rendered as a sibling element by renderHTML, never as an attribute.
        renderHTML: () => ({}),
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width') || null;
          return parseImageWidth(width);
        },
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('align'),
        renderHTML: (attributes) => {
          return {
            align: attributes.align,
          };
        },
      },
      inline: {
        default: false,
        parseHTML: () => false,
        renderHTML: () => {
          return {
            inline: null,
          };
        },
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          return {
            alt: attributes.alt,
          };
        },
      },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { flipX, flipY, align } = HTMLAttributes;
    const rotate = parseRotation(node.attrs.rotate);
    const caption = node.attrs.caption;
    const transformStyle = getTransformStyle(flipX, flipY, rotate);
    const wrapperStyle = align ? `text-align: ${align};` : null;
    const imageHTMLAttributes = {
      ...HTMLAttributes,
      inline: null,
    };

    const image = [
      'img',
      mergeAttributes(
        {
          height: 'auto',
          style: transformStyle || null,
        },
        this.options.HTMLAttributes,
        imageHTMLAttributes
      ),
    ];

    if (typeof caption !== 'string' || !caption.length) {
      return ['div', { class: 'image', style: wrapperStyle }, image];
    }

    return [
      'div',
      { class: 'image', style: wrapperStyle },
      image,
      ['div', { class: 'image-caption' }, caption],
    ];
  },
  parseHTML() {
    return [
      {
        // Drop the empty paragraphs the browser creates around legacy `<p><div class="image">` markup.
        tag: 'p',
        priority: 51,
        ignore: true,
        getAttrs: (element) =>
          isEmptyParagraphNextToLegacyBlockImage(element as HTMLElement) ? null : false,
      },
      {
        tag: 'div[class=image]',
        getAttrs: (element) => {
          const attrs = getImageAttrsFromElement(element as HTMLElement, false);

          if (!attrs) {
            return false;
          }

          return {
            ...attrs,
            inline: false,
          };
        },
      },
      {
        tag: 'span.image',
        getAttrs: (element) => {
          const attrs = getImageAttrsFromElement(element as HTMLElement, false);

          if (!attrs || attrs.inline) {
            return false;
          }

          return {
            ...attrs,
            inline: false,
          };
        },
      },
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: (element) => {
          const attrs = getImageAttrsFromElement(element as HTMLElement, false);

          if (!attrs || attrs.inline) {
            return false;
          }

          return {
            ...attrs,
            inline: false,
          };
        },
      },
    ];
  },
});

export * from '@/extensions/Image/imageLifecycle';
export * from '@/extensions/Image/caption';

/**
 * The image extension without node views: inline `image` plus the `imageBlock`
 * node, commands, HTML round-trip and upload bookkeeping. Renders through
 * `renderHTML`, so it works with any Tiptap binding. The React package extends
 * it with the resizable node view as `Image`; the Vue layer does the same.
 */
export const ImageCore = /* @__PURE__ */ TiptapImage.extend<IImageOptions, ImageLifecycleStorage>({
  group: 'inline',
  inline: true,
  defining: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      ...getImageOptions(this),
      button: ({ editor, extension, t }: ButtonViewParams<IImageOptions>) => ({
        componentProps: {
          action: () => {
            return true;
          },
          upload: extension.options.upload,
          /* If setImageInline is not available(when Image Component is not imported), the button is disabled */
          disabled: !editor.can().setImageInline?.({}),
          icon: 'ImageUp',
          tooltip: t('editor.image.tooltip'),
        },
      }),
    };
  },
  addStorage() {
    // Lets a host find out at save time which uploads are no longer in the
    // document; see `getImageChanges`.
    return { uploaded: new Set<string>(), saved: null };
  },
  addExtensions() {
    return [ImageBlockCore.configure(this.options)];
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      flipX: {
        default: false,
        renderHTML: (attributes) => {
          return {
            flipx: attributes.flipX ? 'true' : null,
          };
        },
      },
      flipY: {
        default: false,
        renderHTML: (attributes) => {
          return {
            flipy: attributes.flipY ? 'true' : null,
          };
        },
      },
      rotate: {
        default: 0,
        parseHTML: (element) => readRotateAttribute(element as HTMLElement),
        renderHTML: (attributes) => {
          const rotate = parseRotation(attributes.rotate);
          return {
            'data-rotate': rotate ? String(rotate) : null,
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.style.width || element.getAttribute('width') || null;
          return parseImageWidth(width);
        },
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('align'),
        renderHTML: (attributes) => {
          return {
            align: attributes.align,
          };
        },
      },
      inline: {
        default: false,
        parseHTML: (element) => parseBooleanHTMLAttribute(element.getAttribute('inline')),
        renderHTML: (attributes) => {
          return {
            inline: attributes.inline ? 'true' : null,
          };
        },
      },
      alt: {
        default: '',
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => {
          return {
            alt: attributes.alt,
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setImageInline:
        (options: Partial<SetImageAttrsOptions>) =>
        ({ commands, state }) => {
          const inline = options.inline ?? this.options.defaultInline ?? false;
          const nodeName = getImageInsertNodeName(state, inline, this.name);

          return commands.insertContent({
            type: nodeName,
            attrs: {
              ...options,
              inline,
            },
          });
        },
      setImageBlock:
        (options: Partial<SetImageAttrsOptions>) =>
        ({ commands, state }) => {
          const nodeName = getImageInsertNodeName(state, false, this.name);

          return commands.insertContent({
            type: nodeName,
            attrs: {
              ...options,
              inline: false,
            },
          });
        },
      updateImage:
        (options) =>
        ({ commands, state }) => {
          const nodeName = getActiveImageNodeName(state, this.name);
          return commands.updateAttributes(nodeName, options);
        },
      setAlignImage:
        (align) =>
        ({ commands, state }) => {
          const nodeName = getActiveImageNodeName(state, this.name);
          return commands.updateAttributes(nodeName, { align });
        },
    };
  },
  renderHTML({ node, HTMLAttributes }) {
    const { flipX, flipY, align, inline } = HTMLAttributes;
    const isInline = getBooleanHTMLAttribute(inline);
    const inlineFloat = isInline && (align === 'left' || align === 'right');

    const transformStyle = getTransformStyle(flipX, flipY, parseRotation(node.attrs.rotate));

    const textAlignStyle =
      !isInline && align === 'center'
        ? 'margin: 0 auto;'
        : !isInline && align === 'right'
          ? 'margin-left: auto;'
          : !isInline
            ? 'margin-right: auto;'
            : '';

    const displayStyle = isInline ? '' : 'display: block;';

    const floatStyle = inlineFloat ? `float: ${align};` : '';

    const marginStyle = inlineFloat
      ? align === 'left'
        ? 'margin: 1em 1em 1em 0;'
        : 'margin: 1em 0 1em 1em;'
      : '';

    const style = `${displayStyle}${textAlignStyle}${floatStyle}${marginStyle}${transformStyle}`;
    const imageHTMLAttributes = {
      ...HTMLAttributes,
      inline: isInline ? 'true' : null,
    };

    return [
      'span',
      {
        class: 'image',
      },
      [
        'img',
        mergeAttributes(
          {
            height: 'auto',
            style: style || null,
          },
          this.options.HTMLAttributes,
          imageHTMLAttributes
        ),
      ],
    ];
  },
  parseHTML() {
    return [
      {
        tag: 'span.image',
        getAttrs: (element) => {
          const attrs = getImageAttrsFromElement(element as HTMLElement, false);

          if (!attrs || !attrs.inline) {
            return false;
          }

          return attrs;
        },
      },
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
        getAttrs: (element) => {
          const attrs = getImageAttrsFromElement(element as HTMLElement, false);

          if (!attrs || !attrs.inline) {
            return false;
          }

          return attrs;
        },
      },
    ];
  },

  // addProseMirrorPlugins() {
  //   const validateFile = (file: File): boolean => {
  //     // @ts-expect-error
  //     if (!this.options.acceptMimes.includes(file.type)) {
  //       // toast({ description: t.value('editor.imageUpload.fileTypeNotSupported'), duration: 2000 });
  //       return false;
  //     }
  //     // @ts-expect-error
  //     if (file.size > this.options.maxSize) {
  //       // toast({
  //       //   description: `${t.value('editor.imageUpload.fileSizeTooBig')} ${formatFileSize(
  //       //     this.options.maxSize,
  //       //   )}.`,
  //       //   duration: 2000,
  //       // });
  //       return false;
  //     }
  //     return true;
  //   };

  //   const uploadFn = createImageUpload({
  //     validateFn: validateFile,
  //     onUpload: this.options.upload as any,
  //     // postUpload: this.options.postUpload,
  //     defaultInline: this.options.defaultInline ?? false,
  //   });

  //   return [
  //     UploadImagesPlugin(),

  //     new Plugin({
  //       key: new PluginKey(`richtextCustomPlugin${this.name}`),
  //       props: {
  //         handlePaste: (view, event) => {
  //           const hasFiles =
  //               event.clipboardData &&
  //               event.clipboardData.files &&
  //               event.clipboardData.files?.length;

  //           if (!hasFiles) {
  //             return;
  //           }

  //           const items = [...(event.clipboardData.files || [])];

  //           if (items.some(x => x.type === 'text/html')) {
  //             return false;
  //           }

  //           return handleImagePaste(view, event, uploadFn);
  //         },
  //         handleDrop: (view, event, _, moved) => {
  //           if (!(event instanceof DragEvent) || !event.dataTransfer) {
  //             return false;
  //           }

  //           handleImageDrop(view, event, moved, uploadFn);
  //           return false;
  //         },
  //       },
  //     }),
  //   ];
  // },
});
