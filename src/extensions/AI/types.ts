import type { ComponentType, ReactNode } from 'react';

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
   * Replace how the answer is shown. Receives the markdown so far, the HTML
   * the editor would produce from it, and whether more is coming. The default
   * renders `html` with the document's own styles.
   */
  renderResult?: (context: AIResultContext) => ReactNode;
  /** Replace UI pieces wholesale. `Panel` takes over the entire AI dialog. */
  components?: {
    Panel?: ComponentType<AIPanelComponentProps>;
  };
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
}

export interface AIResultContext {
  /** Model output so far, as markdown. */
  markdown: string;
  /** `markdown` rendered through the editor schema, as the editor would save it. */
  html: string;
  /** More text is still arriving. */
  streaming: boolean;
}

/** What a replacement panel receives; the same props the built-in one uses. */
export interface AIPanelComponentProps {
  editor: import('@tiptap/core').Editor;
  options: AIOptions;
  /** Text the user had selected when the panel opened. */
  selectedText: string;
  /** Prompt preselected from a menu entry, if any. */
  initialPrompt?: string;
  /** Insert `markdown` in place of the selection and close. */
  apply: (markdown: string) => void;
  close: () => void;
}
