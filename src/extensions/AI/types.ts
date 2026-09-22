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
  /** Override transport, for example to call your authenticated backend. */
  generate: ((request: AIRequest) => Promise<string>) | null;
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
