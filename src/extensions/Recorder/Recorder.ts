import { Extension } from '@tiptap/core';
import { Selection } from '@tiptap/pm/state';
import { Step } from '@tiptap/pm/transform';

import type { Editor, JSONContent } from '@tiptap/core';

/** One recorded transaction: when it happened and what it did. */
export interface RecordingEntry {
  /** Milliseconds since the recording started. */
  t: number;
  /** ProseMirror steps as JSON, replayable with `Step.fromJSON`. */
  steps: object[];
  /** Selection after the transaction, when `recordSelection` is on. */
  selection?: object;
}

export interface Recording {
  version: 1;
  /** Document at the moment recording started. */
  start: JSONContent;
  /** Epoch milliseconds. */
  startedAt: number;
  /** Milliseconds from start to the last entry (or to `stopRecording`). */
  duration: number;
  entries: RecordingEntry[];
}

export interface RecorderOptions {
  /** Start recording as soon as the editor is created. */
  autoStart: boolean;
  /** Record the caret/selection too, so a replay shows where the author was. */
  recordSelection: boolean;
  /**
   * Called for every entry as it is recorded — stream it to a server, or
   * persist it incrementally so a crash loses at most one edit.
   */
  onEntry?: (entry: RecordingEntry, recording: Recording) => void;
  /** Oldest entries are dropped past this many. 0 means unlimited. */
  maxEntries: number;
}

export interface RecorderStorage {
  recording: Recording | null;
  active: boolean;
}

export interface ReplayOptions {
  /** 1 is real time; 4 is four times faster. */
  speed?: number;
  /** Any pause longer than this (in real-time ms) is shortened to it. */
  maxDelay?: number;
  /** Called after each entry with the index and total. */
  onProgress?: (index: number, total: number) => void;
  signal?: AbortSignal;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    recorder: {
      /** Starts a new recording from the current document. */
      startRecording: () => ReturnType;
      /** Stops recording; the result stays in `editor.storage.recorder.recording`. */
      stopRecording: () => ReturnType;
    };
  }
}

const REPLAY_META = 'recorderReplay';

function recorderStorage(editor: Editor): RecorderStorage | undefined {
  return (editor.storage as unknown as Record<string, RecorderStorage | undefined>).recorder;
}

/** The current or last recording, or null when none was started. */
export function getRecording(editor: Editor): Recording | null {
  return recorderStorage(editor)?.recording ?? null;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason ?? new Error('aborted'));
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal?.reason ?? new Error('aborted'));
    }
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

/**
 * Plays a recording back into `editor`, edit by edit, with the original
 * timing (scaled by `speed`). Replayed transactions are not recorded again and
 * do not enter the undo history. Make the editor read-only first if the viewer
 * should only watch.
 */
export async function replayRecording(
  editor: Editor,
  recording: Recording,
  { speed = 1, maxDelay = 2000, onProgress, signal }: ReplayOptions = {}
): Promise<void> {
  editor.commands.setContent(recording.start, { emitUpdate: false });

  let previous = 0;

  for (let index = 0; index < recording.entries.length; index++) {
    const entry = recording.entries[index];
    const delay = Math.min((entry.t - previous) / Math.max(speed, 0.01), maxDelay);

    previous = entry.t;
    if (delay > 0) await wait(delay, signal);
    if (editor.isDestroyed) return;

    const tr = editor.state.tr;

    for (const json of entry.steps) {
      const step = Step.fromJSON(editor.schema, json);
      const result = tr.maybeStep(step);

      if (result.failed) {
        throw new Error(`Recording could not be replayed at entry ${index}: ${result.failed}`);
      }
    }

    if (entry.selection) {
      try {
        tr.setSelection(Selection.fromJSON(tr.doc, entry.selection));
      } catch {
        // A selection that no longer fits is not worth stopping the replay for.
      }
    }

    tr.setMeta(REPLAY_META, true).setMeta('addToHistory', false);
    editor.view.dispatch(tr);
    onProgress?.(index + 1, recording.entries.length);
  }
}

/**
 * Records every edit as ProseMirror steps with timestamps, so a session can be
 * saved and replayed like a screen recording of the document — for audit
 * trails, "show me how this was written", or reproducing a bug report.
 */
export const Recorder = /* @__PURE__ */ Extension.create<RecorderOptions, RecorderStorage>({
  name: 'recorder',

  addOptions() {
    return {
      autoStart: false,
      recordSelection: true,
      onEntry: undefined,
      maxEntries: 0,
    };
  },

  addStorage() {
    return { recording: null, active: false };
  },

  onCreate() {
    if (this.options.autoStart) {
      this.editor.commands.startRecording();
    }
  },

  onTransaction({ transaction }) {
    const { storage, options } = this;
    const recording = storage.recording;

    if (!storage.active || !recording || transaction.getMeta(REPLAY_META)) {
      return;
    }

    const selectionMoved = options.recordSelection && transaction.selectionSet;

    if (!transaction.docChanged && !selectionMoved) {
      return;
    }

    const entry: RecordingEntry = {
      t: Date.now() - recording.startedAt,
      steps: transaction.steps.map((step) => step.toJSON()),
    };

    if (options.recordSelection) {
      entry.selection = transaction.selection.toJSON();
    }

    recording.entries.push(entry);
    recording.duration = entry.t;

    if (options.maxEntries > 0 && recording.entries.length > options.maxEntries) {
      // Dropping the head invalidates `start`; rebase it on the current doc
      // minus what is kept is not possible cheaply, so keep the newest window
      // and restart from the current document instead.
      recording.start = this.editor.getJSON();
      recording.startedAt = Date.now();
      recording.entries = [];
      recording.duration = 0;
    }

    options.onEntry?.(entry, recording);
  },

  addCommands() {
    return {
      startRecording:
        () =>
        ({ editor }) => {
          this.storage.recording = {
            version: 1,
            start: editor.getJSON(),
            startedAt: Date.now(),
            duration: 0,
            entries: [],
          };
          this.storage.active = true;

          return true;
        },
      stopRecording: () => () => {
        const recording = this.storage.recording;

        if (!recording || !this.storage.active) {
          return false;
        }

        recording.duration = Date.now() - recording.startedAt;
        this.storage.active = false;

        return true;
      },
    };
  },
});
