import { useEditorState } from '@tiptap/react';
import { Sparkles } from 'lucide-react';

import { ActionButton } from '@/components/ActionButton';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import { aiPluginKey } from '../state';
import { aiOptionsOf } from '../writer';

/**
 * The toolbar's AI button: always there, one click opens the composer dock
 * under the editor (`RichTextAIComposer`). `Mod-J` does the same.
 */
export function RichTextAI() {
  const editor = useEditorInstance();
  const { t } = useLocale();
  const open = useEditorState({
    editor,
    selector: ({ editor }) => aiPluginKey.getState(editor.state)?.composer ?? false,
  });

  const options = aiOptionsOf(editor);
  if (!options || options.composer === false) return null;

  return (
    <ActionButton
      action={() => editor.commands.toggleAIComposer()}
      customClass='richtext-ai-trigger !richtext-w-auto'
      isActive={() => !!open}
      dataState={!!open}
      shortcutKeys={['mod', 'J']}
      tooltip={t('editor.ai.compose.title')}
    >
      <Sparkles size={16} />
      <span className='richtext-text-sm'>{t('editor.ai.compose.trigger')}</span>
    </ActionButton>
  );
}
