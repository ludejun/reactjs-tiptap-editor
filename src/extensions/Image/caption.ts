/** Marks the caption input so the node views can hand its events back to it. */
export const CAPTION_CLASS = 'image-view__caption';

/** True when the node sits inside the caption input rather than the image. */
export function isInsideImageCaption(node: EventTarget | Node | null): boolean {
  const element = node instanceof Element ? node : ((node as Node | null)?.parentElement ?? null);

  return !!element?.closest(`.${CAPTION_CLASS}`);
}

/** True when the event came from the caption input rather than the image. */
export function isImageCaptionEvent({ event }: { event: Event }): boolean {
  return isInsideImageCaption(event.target);
}
