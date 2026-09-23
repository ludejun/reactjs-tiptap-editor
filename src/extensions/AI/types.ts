import type { Editor, Range } from '@tiptap/core';

export type AIProtocol = 'openai' | 'anthropic';

/** A file the user attached to a prompt, already read as a data URL. */
export interface AIAttachment {
  id: string;
  name: string;
  /** MIME type as reported by the browser. */
  mediaType: string;
  /** `data:<mediaType>;base64,<payload>` */
  dataUrl: string;
  /** Images are sent to the model as images; anything else as its text. */
  kind: 'image' | 'file';
  /** Extracted text, for `kind: 'file'`. */
  text?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  /** Only ever set on the message the user is sending. */
  attachments?: AIAttachment[];
}

export interface AIRequest {
  messages: AIMessage[];
  systemPrompt: string;
  signal: AbortSignal;
}

/**
 * What a panel implementation receives when the extension opens an AI
 * session. The React and Vue layers each mount their own component with
 * these props; a custom `mountPanel` gets the same.
 */
export interface AIPanelComponentProps {
  editor: Editor;
  options: AIOptions;
  /** Text the user had selected when the panel opened. */
  selectedText: string;
  /** Prompt preselected from a menu entry, if any. */
  initialPrompt?: string;
  /** Insert `markdown` in place of the selection and close. */
  apply: (markdown: string) => void;
  close: () => void;
}

/**
 * Where AI output goes. `selection` replaces the selected text (or inserts
 * at the caret when nothing is selected); `cursor` always inserts at the
 * caret; `start`/`end` prepend or append to the document; `document`
 * rewrites the whole document; a `Range` targets exactly that span.
 */
export type AIWriteTarget = 'selection' | 'cursor' | 'start' | 'end' | 'document' | Range;

export interface AIOptions {
  protocol: AIProtocol;
  apiKey: string | (() => string | Promise<string>);
  /** API root including /v1. A same-origin proxy can omit apiKey. */
  baseURL: string;
  /** Required when using the built-in transport. */
  model: string;
  maxTokens: number;
  headers: Record<string, string>;
  systemPrompt: string;
  /**
   * Override transport, for example to call your authenticated backend. Call
   * `onChunk` with each piece of text as it arrives to stream into the panel;
   * resolve with the full text either way.
   */
  generate: ((request: AIRequest, onChunk?: (text: string) => void) => Promise<string>) | null;
  /**
   * Ask the provider for server-sent events and render the answer as it
   * arrives. Off, the panel waits for the whole answer. Default `true`.
   */
  stream?: boolean;
  /**
   * Mounts the panel UI into `mount` when a session opens and returns a
   * function that unmounts it. The React and Vue extensions fill this in;
   * `null` runs the extension headless (commands and decorations only).
   */
  mountPanel: ((mount: HTMLElement, props: AIPanelComponentProps) => () => void) | null;
  /**
   * Fixed targets for the "Translate" entry of the selection menu, shown as a
   * submenu. Empty (the default) offers a single target: the browser language.
   */
  translateLanguages: string[];
  /**
   * Let the user attach images to a prompt. The configured model has to accept
   * images; set to false when it does not.
   */
  enableImageInput: boolean;
  /** Let the user attach text files, whose contents are inlined in the prompt. */
  enableFileInput: boolean;
  /** Accepted image types for the attach button. */
  imageMimes: string[];
  /** Accepted file types for the attach button. */
  fileMimes: string[];
  /** Per-attachment size limit in bytes. */
  maxAttachmentSize: number;
  /**
   * Pressing Space on an empty line opens Ask AI, the way an empty line in
   * Notion does. Off, Space is just a space. Default `true`.
   */
  spaceTrigger: boolean;
  /**
   * How much of the document (in characters, as Markdown) document-level
   * actions such as "Continue writing" or "Summarize" send as context.
   * `0` sends none. Default `12000`.
   */
  documentContext: number;
  /**
   * How a span of the document is turned into text for the model. The
   * default serializes it with the editor's own Markdown export, so headings,
   * lists, tables and code blocks keep their structure. Override to send a
   * different format or to redact content; `range` covers the whole document
   * for document-level actions.
   */
  serializeDocument?: (editor: Editor, range: Range) => string | Promise<string>;
}

export interface AIResultContext {
  /** Model output so far, as markdown. */
  markdown: string;
  /** `markdown` rendered through the editor schema, as the editor would save it. */
  html: string;
  /** More text is still arriving. */
  streaming: boolean;
}
