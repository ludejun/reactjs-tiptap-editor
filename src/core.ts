/**
 * Framework-agnostic entry: everything here is Tiptap/ProseMirror only — no
 * React, no DOM components — so it works with `@tiptap/vue-3`, `@tiptap/core`
 * in a vanilla page, or any other binding. Controls and node views live in
 * the per-feature subpaths (`ai-sparkwrite-editor/<feature>`), which are React.
 *
 * A build check (`tests/core-headless.test.mjs`) fails if anything reachable
 * from this file imports react.
 */

// Marks and text formatting
export { Bold } from '@/extensions/Bold/Bold';
export { Italic } from '@/extensions/Italic/Italic';
export { TextUnderline } from '@/extensions/TextUnderline/TextUnderline';
export { Strike } from '@/extensions/Strike/Strike';
export { Code } from '@/extensions/Code/Code';
export { MoreMark } from '@/extensions/MoreMark/MoreMark';
export { Color } from '@/extensions/Color/Color';
export { Highlight } from '@/extensions/Highlight/Highlight';
export { FontFamily } from '@/extensions/FontFamily/FontFamily';
export { FontSize } from '@/extensions/FontSize/FontSize';
export { LineHeight } from '@/extensions/LineHeight/LineHeight';
export { TextAlign } from '@/extensions/TextAlign/TextAlign';
export { TextDirection } from '@/extensions/TextDirection/TextDirection';
export { Indent } from '@/extensions/Indent/Indent';
export { Clear } from '@/extensions/Clear/Clear';
export { Link } from '@/extensions/Link/Link';

// Blocks
export { Heading } from '@/extensions/Heading/Heading';
export { BulletList } from '@/extensions/BulletList/BulletList';
// Bullet and ordered lists need it; re-exported so a core setup is one import.
export { ListItem } from '@tiptap/extension-list';
export { OrderedList } from '@/extensions/OrderedList/OrderedList';
export { TaskList } from '@/extensions/TaskList/TaskList';
export { Blockquote } from '@/extensions/Blockquote/Blockquote';
export { Table } from '@/extensions/Table/Table';
export { DividerCore as Divider, DIVIDER_VARIANTS } from '@/extensions/Divider/Divider';
export type {
  DividerAttributes,
  DividerOptions,
  DividerVariant,
  DividerVariantOption,
} from '@/extensions/Divider/Divider';

// Behaviour
export { History } from '@/extensions/History/History';
export { SearchAndReplace } from '@/extensions/SearchAndReplace/SearchAndReplace';
export { RichPaste } from '@/extensions/RichPaste/RichPaste';
export { MarkdownPaste } from '@/extensions/MarkdownPaste/MarkdownPaste';
export { Recorder, getRecording, replayRecording } from '@/extensions/Recorder/Recorder';
export type { Recording, RecordingEntry, RecorderOptions } from '@/extensions/Recorder/Recorder';

// AI: the extension (headless — supply `mountPanel` or use the React/Vue
// layers for the panel), writing straight into the document, ghost-text
// autocomplete, the composer presets, transport and markdown rendering.
export { AICore as AI, DEFAULT_AI_SYSTEM_PROMPT } from '@/extensions/AI/AICore';
export { aiPluginKey } from '@/extensions/AI/state';
export type { AIState, AISession, AIWriting } from '@/extensions/AI/state';
export {
  writeWithAI,
  aiOptionsOf,
  resolveWriteTarget,
  documentContext,
} from '@/extensions/AI/writer';
export type { WriteWithAIOptions, WriteWithAIResult } from '@/extensions/AI/writer';
export { AIAutocomplete, aiAutocompleteKey } from '@/extensions/AI/Autocomplete';
export type {
  AIAutocompleteOptions,
  AIAutocompleteState,
  AISuggestion,
} from '@/extensions/AI/Autocomplete';
export { AI_COMPOSER_ACTIONS, composerPrompt, browserLanguage } from '@/extensions/AI/composer';
export type { AIComposerAction } from '@/extensions/AI/composer';
export { generateAIText } from '@/extensions/AI/client';
export {
  markdownToFragment,
  markdownToHTML,
  markdownToPreviewHTML,
  markdownToSlice,
} from '@/extensions/AI/markdown';
export type {
  AIMessage,
  AIOptions,
  AIPanelComponentProps,
  AIProtocol,
  AIRequest,
  AIWriteTarget,
} from '@/extensions/AI/types';

// Image bookkeeping (the image node itself has a React view)
export {
  collectImageSources,
  getImageChanges,
  markImagesSaved,
  rememberUploadedImage,
} from '@/extensions/Image/imageLifecycle';

// Text and fonts
export { localeActions, translate, en, getLocaleState, subscribeLocale } from '@/locales/store';
export { DEFAULT_FONT_FAMILY_LIST, SCRIPT_FONT_FAMILY_LIST } from '@/constants';
