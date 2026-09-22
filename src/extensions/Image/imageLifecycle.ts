import type { Editor } from '@tiptap/core';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';

/** Node types whose `src` points at an uploaded picture. */
const IMAGE_NODES = new Set(['image', 'imageBlock', 'imageGif']);

export interface ImageLifecycleStorage {
  /** Every `src` an upload returned in this session, whether still in the document or not. */
  uploaded: Set<string>;
  /** The sources present the last time `markImagesSaved` ran. */
  saved: Set<string> | null;
}

export interface ImageChanges {
  /** Sources currently in the document, in document order, without duplicates. */
  current: string[];
  /** In the document now but not in the previous snapshot. */
  added: string[];
  /** In the previous snapshot but no longer in the document. */
  removed: string[];
  /**
   * Uploaded in this session but not in the document: pictures that were
   * inserted and deleted again, or whose upload finished after the dialog
   * closed. The server can delete these without losing anything.
   */
  orphaned: string[];
}

function lifecycle(editor: Editor): ImageLifecycleStorage | undefined {
  return (editor.storage as unknown as Record<string, ImageLifecycleStorage | undefined>).image;
}

/** Records a source the host's `upload` returned, so orphans can be found later. */
export function rememberUploadedImage(editor: Editor, src: string): void {
  lifecycle(editor)?.uploaded.add(src);
}

/** All image sources in `doc`, in order, each once. */
export function collectImageSources(doc: ProseMirrorNode): string[] {
  const sources: string[] = [];
  const seen = new Set<string>();

  doc.descendants((node) => {
    const src = node.attrs.src;

    if (IMAGE_NODES.has(node.type.name) && typeof src === 'string' && src && !seen.has(src)) {
      seen.add(src);
      sources.push(src);
    }
  });

  return sources;
}

/**
 * Compares the document with a previous snapshot of image sources — the one
 * recorded by `markImagesSaved`, or one you stored yourself — and reports
 * what to keep and what the server can delete.
 */
export function getImageChanges(editor: Editor, previous?: Iterable<string>): ImageChanges {
  const storage = lifecycle(editor);
  const before = new Set(previous ?? storage?.saved ?? []);
  const current = collectImageSources(editor.state.doc);
  const now = new Set(current);

  return {
    current,
    added: current.filter((src) => !before.has(src)),
    removed: [...before].filter((src) => !now.has(src)),
    orphaned: [...(storage?.uploaded ?? [])].filter((src) => !now.has(src)),
  };
}

/**
 * Call after a successful save. The next `getImageChanges` diffs against this
 * point, and uploads that made it into the saved document stop counting as
 * orphans.
 */
export function markImagesSaved(editor: Editor): void {
  const storage = lifecycle(editor);

  if (!storage) {
    return;
  }

  const current = collectImageSources(editor.state.doc);

  storage.saved = new Set(current);
  current.forEach((src) => storage.uploaded.delete(src));
}
