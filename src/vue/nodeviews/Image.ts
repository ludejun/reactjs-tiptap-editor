/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { NodeViewWrapper, VueNodeViewRenderer, nodeViewProps } from '@tiptap/vue-3';
import { defineComponent, h, nextTick, ref, watch, type CSSProperties } from 'vue';

import {
  CAPTION_CLASS,
  isImageCaptionEvent,
  isInsideImageCaption,
} from '@/extensions/Image/caption';
import { ImageBlockCore, ImageCore, parseRotation } from '@/extensions/Image/Image';

import { useLocale } from '../context';

import { selectNode, useImageResize } from './resize';

const nodeViewOptions = {
  // Hand every event inside the caption input back to the input. Without
  // this ProseMirror treats a click there as selecting the image (so the
  // next keystroke replaces it) and swallows the keys themselves.
  stopEvent: isImageCaptionEvent,
  ignoreMutation: ({ mutation }: { mutation: { target: Node } }) =>
    isInsideImageCaption(mutation.target),
};

function cssSize(value: unknown): string | undefined {
  if (typeof value === 'number') return `${value}px`;

  return typeof value === 'string' && value ? value : undefined;
}

/**
 * Same DOM and classes as the React `ImageView`, for both the inline `image`
 * and the `imageBlock` node: resize handles while selected, flip and rotation
 * transforms, and the caption input on block images.
 */
export const ImageNodeView = defineComponent({
  name: 'ImageNodeView',
  props: nodeViewProps,
  setup(props) {
    const { t } = useLocale();
    const select = () => selectNode(props.editor, props.getPos);
    const { resizing, naturalSize, onImageLoad, renderHandles } = useImageResize({
      editor: props.editor,
      getAttrs: () => props.node.attrs,
      onResize: (size) => props.updateAttributes(size),
      onDone: select,
    });

    const isBlockNode = () => props.node.type.name === ImageBlockCore.name;
    const hasCaption = () => isBlockNode() && typeof props.node.attrs.caption === 'string';

    // The caption is written back on blur or Enter only: a transaction per
    // keystroke pulls focus back into the editor and breaks IME composition.
    const draft = ref<string>(props.node.attrs.caption ?? '');
    const captionInput = ref<HTMLInputElement | null>(null);

    watch(
      () => props.node.attrs.caption as string | null,
      (value) => {
        draft.value = value ?? '';
      }
    );

    // Focus the caption only when one is actually added, not every time a
    // document that already has captions renders.
    watch(hasCaption, (has, had) => {
      if (!has || had || !props.editor.view.editable) return;

      void nextTick(() => {
        const input = captionInput.value;

        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      });
    });

    const commitCaption = (next: string) => {
      if (next !== (props.node.attrs.caption ?? '')) {
        props.updateAttributes({ caption: next });
      }
    };

    return () => {
      const attrs = props.node.attrs;
      const { align, inline, caption, src, alt, flipX, flipY } = attrs;
      const block = isBlockNode();
      const isInline = !block && (inline === true || inline === 'true');
      const inlineFloat = isInline && (align === 'left' || align === 'right');
      const rotate = parseRotation(attrs.rotate);
      const quarterTurn = rotate === 90 || rotate === 270;
      const editable = props.editor.view.editable;

      // A quarter turn keeps the image's layout box but swaps its visual
      // footprint, so reserve the swapped box and centre the image inside it.
      // Percentage widths have no pixel size to swap, so they just rotate.
      let rotatedBox: { width: number; height: number } | null = null;

      if (quarterTurn && naturalSize.value.width && naturalSize.value.height) {
        const attrWidth = attrs.width;
        const widthPx =
          typeof attrWidth === 'number'
            ? attrWidth
            : typeof attrWidth === 'string' && attrWidth.endsWith('px')
              ? Number.parseFloat(attrWidth)
              : null;

        if (!attrWidth || widthPx !== null) {
          const displayWidth = widthPx ?? naturalSize.value.width;
          const displayHeight = displayWidth * (naturalSize.value.height / naturalSize.value.width);

          rotatedBox = { width: displayHeight, height: displayWidth };
        }
      }

      const width = cssSize(attrs.width);
      const height = cssSize(attrs.height);
      const transforms: string[] = [];

      if (rotatedBox) transforms.push('translate(-50%, -50%)');
      if (flipX) transforms.push('rotateX(180deg)');
      if (flipY) transforms.push('rotateY(180deg)');
      if (rotate) transforms.push(`rotate(${rotate}deg)`);

      const imageStyle: CSSProperties = {
        width,
        height,
        transform: transforms.join(' ') || 'none',
        ...(inlineFloat ? { float: align } : {}),
        // `.ProseMirror img { max-width: 100% }` would re-clamp the image to
        // the swapped (narrower) box and leave it floating in a half-empty frame.
        ...(rotatedBox
          ? { position: 'absolute', left: '50%', top: '50%', maxWidth: 'none', maxHeight: 'none' }
          : {}),
      };
      const imageMaxStyle: CSSProperties = { width: width === '100%' ? width : undefined };

      const captionNode = !hasCaption()
        ? null
        : editable
          ? h('input', {
              ref: captionInput,
              class: CAPTION_CLASS,
              contenteditable: 'false',
              placeholder: t('editor.image.caption.placeholder'),
              style: { textAlign: align },
              value: draft.value,
              onInput: (event: Event) => {
                draft.value = (event.target as HTMLInputElement).value;
              },
              onBlur: () => commitCaption(draft.value),
              onKeydown: (event: KeyboardEvent) => {
                // Never let the editor's keymap see these keys.
                event.stopPropagation();
                const input = event.currentTarget as HTMLInputElement;

                if (event.key === 'Enter') {
                  event.preventDefault();
                  commitCaption(input.value);
                  input.blur();
                }

                if (event.key === 'Escape') {
                  event.preventDefault();
                  draft.value = caption ?? '';
                  input.blur();
                }
              },
              onMousedown: (event: MouseEvent) => event.stopPropagation(),
            })
          : caption
            ? h('span', { class: CAPTION_CLASS, style: { textAlign: align } }, caption)
            : null;

      return h(
        NodeViewWrapper,
        {
          as: block ? 'div' : 'span',
          class: 'image-view',
          style: {
            float: inlineFloat ? align : undefined,
            margin: inlineFloat
              ? align === 'left'
                ? '1em 1em 1em 0'
                : '1em 0 1em 1em'
              : undefined,
            display: isInline ? 'inline' : 'block',
            textAlign: inlineFloat ? undefined : align,
            width: width ?? 'auto',
            ...(inlineFloat ? {} : imageMaxStyle),
          },
        },
        () => [
          h(
            'span',
            {
              'data-drag-handle': '',
              draggable: 'true',
              class: [
                'image-view__body',
                {
                  'image-view__body--focused': props.selected,
                  'image-view__body--resizing': resizing.value,
                },
              ],
              style: rotatedBox
                ? { width: `${rotatedBox.width}px`, height: `${rotatedBox.height}px` }
                : imageMaxStyle,
            },
            [
              h('img', {
                class: 'image-view__body__image block',
                src: src || undefined,
                alt: alt || undefined,
                height: 'auto',
                style: imageStyle,
                onClick: select,
                onLoad: onImageLoad,
              }),
              editable && (props.selected || resizing.value) ? renderHandles('span') : null,
            ]
          ),
          captionNode,
        ]
      );
    };
  },
});

/** `ImageBlockCore` with the Vue node view: resize handles, caption, rotation. */
export const ImageBlock = /* @__PURE__ */ ImageBlockCore.extend({
  addNodeView() {
    return VueNodeViewRenderer(ImageNodeView, nodeViewOptions);
  },
});

/** `ImageCore` with the Vue node views for the inline and block images. */
export const Image = /* @__PURE__ */ ImageCore.extend({
  addExtensions() {
    return [ImageBlock.configure(this.options)];
  },

  addNodeView() {
    return VueNodeViewRenderer(ImageNodeView, nodeViewOptions);
  },
});
