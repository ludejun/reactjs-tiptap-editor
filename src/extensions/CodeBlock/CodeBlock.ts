import type { ButtonViewParams } from '@/types';
export { guessLanguage } from '@/extensions/CodeBlock/detect-language';
export * from '@/extensions/CodeBlock/languages';
import { guessLanguage } from '@/extensions/CodeBlock/detect-language';
import CodeBlockRangi, {
  CodeBlockRangiOptions,
} from '@/extensions/CodeBlock/extension-code-block-rangi/src';

import type { GeneralOptions } from '@/types';

export interface CodeBlockOptions extends CodeBlockRangiOptions, GeneralOptions<CodeBlockOptions> {}

/**
 * The code block without a node view: highlighting, language detection and
 * the toolbar button description, rendered through `renderHTML`, so it works
 * with any Tiptap binding. The React package extends it with the language
 * picker node view as `CodeBlock`; the Vue layer does the same.
 */
export const CodeBlockCore = CodeBlockRangi.extend<CodeBlockOptions>({
  //@ts-expect-error
  addOptions() {
    return {
      ...this.parent?.(),
      detectLanguageFn: guessLanguage,
      button: ({ editor, t }: ButtonViewParams<CodeBlockOptions>) => {
        return {
          componentProps: {
            action: () => editor.chain().focus().setCodeBlock({ language: 'plaintext' }).run(),
            isActive: () => editor.isActive('codeBlock'),
            disabled: false,
            icon: 'Code2',
            tooltip: t('editor.codeblock.tooltip'),
          },
        };
      },
    };
  },
});
