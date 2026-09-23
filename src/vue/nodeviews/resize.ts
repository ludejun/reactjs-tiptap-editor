/* oxlint-disable react-hooks/rules-of-hooks -- Vue composables, not React hooks */
import { clamp, throttle } from 'lodash-es';
import { h, onBeforeUnmount, onMounted, ref, type VNode } from 'vue';

import { IMAGE_MAX_SIZE, IMAGE_MIN_SIZE, IMAGE_THROTTLE_WAIT_TIME } from '@/constants';

import type { Editor } from '@tiptap/core';

/** The four corner handles, in the order the stylesheet expects. */
export const RESIZE_DIRECTIONS = ['tl', 'tr', 'bl', 'br'] as const;

export interface ImageResizeOptions {
  editor: Editor;
  /** The node's current attributes, read when a drag starts. */
  getAttrs: () => { width?: unknown; height?: unknown };
  /** Writes the new size; `height` is `null` unless `keepRatio` derives it. */
  onResize: (size: { width: number; height: number | null }) => void;
  /** Runs when the drag ends, e.g. to select the node again. */
  onDone: () => void;
  /**
   * Keep `height` in step with `width` using the stored ratio (Mermaid keeps
   * both attributes); otherwise `height` is cleared and the browser derives it.
   */
  keepRatio?: boolean;
}

/**
 * Corner-handle resizing shared by the image, GIF and Mermaid node views —
 * the pointer-capture session the React `ImageView` runs, as a composable.
 */
export function useImageResize(options: ImageResizeOptions) {
  const resizing = ref(false);
  const maxWidth = ref(IMAGE_MAX_SIZE);
  /** Rendered size of the image when it loaded. */
  const originalSize = ref({ width: 0, height: 0 });
  /** Intrinsic size of the image when it loaded. */
  const naturalSize = ref({ width: 0, height: 0 });

  let session: { pointerId: number; x: number; width: number; direction: string } | null = null;

  const measure = throttle(() => {
    const { width } = getComputedStyle(options.editor.view.dom);
    maxWidth.value = Number.parseInt(width, 10);
  }, IMAGE_THROTTLE_WAIT_TIME);

  let observer: ResizeObserver | null = null;

  onMounted(() => {
    observer = new ResizeObserver(() => measure());
    observer.observe(options.editor.view.dom);
  });

  const resizeToPointer = throttle((clientX: number, pointerId: number) => {
    if (!session || session.pointerId !== pointerId) {
      return;
    }

    const dx = (clientX - session.x) * (/l/.test(session.direction) ? -1 : 1);
    const width = clamp(session.width + dx, IMAGE_MIN_SIZE, maxWidth.value);

    if (options.keepRatio) {
      const attrs = options.getAttrs();
      const ratio = Number(attrs.width) / Number(attrs.height);

      options.onResize({ width, height: Math.round(width / ratio) });
      return;
    }

    options.onResize({ width, height: null });
  }, IMAGE_THROTTLE_WAIT_TIME);

  onBeforeUnmount(() => {
    observer?.disconnect();
    measure.cancel();
    resizeToPointer.cancel();
  });

  const onImageLoad = (event: Event) => {
    const image = event.currentTarget as HTMLImageElement;

    originalSize.value = { width: image.width, height: image.height };
    naturalSize.value = { width: image.naturalWidth, height: image.naturalHeight };
  };

  const onPointerDown = (event: PointerEvent, direction: string) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const aspectRatio = originalSize.value.width / originalSize.value.height;
    const attrs = options.getAttrs();
    let width = Number(attrs.width);
    let height = Number(attrs.height);
    const max = maxWidth.value;

    if (width && !height) {
      width = width > max ? max : width;
      height = Math.round(width / aspectRatio);
    } else if (height && !width) {
      width = Math.round(height * aspectRatio);
      width = width > max ? max : width;
    } else if (!width && !height) {
      width = originalSize.value.width > max ? max : originalSize.value.width;
      height = Math.round(width / aspectRatio);
    } else {
      width = width > max ? max : width;
    }

    session = { pointerId: event.pointerId, x: event.clientX, width, direction };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    resizing.value = true;
  };

  const onPointerMove = (event: PointerEvent) => {
    if (session?.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    resizeToPointer(event.clientX, event.pointerId);
  };

  const finishResize = (event: PointerEvent, commit: boolean) => {
    if (session?.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (commit) {
      resizeToPointer(event.clientX, event.pointerId);
      resizeToPointer.flush();
    } else {
      resizeToPointer.cancel();
    }

    const target = event.currentTarget as HTMLElement;

    if (target.hasPointerCapture(event.pointerId)) {
      target.releasePointerCapture(event.pointerId);
    }

    session = null;
    resizing.value = false;
    options.onDone();
  };

  /** The `.image-resizer` box with its four handles. */
  const renderHandles = (tag: 'span' | 'div' = 'span'): VNode =>
    h(
      tag,
      { class: 'image-resizer' },
      RESIZE_DIRECTIONS.map((direction) =>
        h('span', {
          key: `image-dir-${direction}`,
          class: `image-resizer__handler image-resizer__handler--${direction}`,
          onPointerdown: (event: PointerEvent) => onPointerDown(event, direction),
          onPointermove: onPointerMove,
          onPointerup: (event: PointerEvent) => finishResize(event, true),
          onPointercancel: (event: PointerEvent) => finishResize(event, false),
        })
      )
    );

  return { resizing, naturalSize, onImageLoad, renderHandles };
}

/** `NodeSelection` on the node view's own node. */
export function selectNode(editor: Editor, getPos: () => number | undefined) {
  const pos = getPos();

  if (pos !== undefined) {
    editor.commands.setNodeSelection(pos);
  }
}
