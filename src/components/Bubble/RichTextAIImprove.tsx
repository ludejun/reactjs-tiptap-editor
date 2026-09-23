import {
  Briefcase,
  Languages,
  List,
  ListTree,
  PanelBottomOpen,
  Maximize2,
  MessageCircleQuestion,
  Minimize2,
  Smile,
  Sparkles,
  SpellCheck,
  Table as TableIcon,
  Text,
  Volume2,
  WandSparkles,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { ActionButton } from '@/components/ActionButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import type { Range } from '@tiptap/core';

/**
 * Actions that rewrite the selection in place, in the order Notion, Craft and
 * Coda all settle on: fix, improve, resize, simplify.
 *
 * Every prompt says "preserve the original language" so the menu does not need
 * a separate entry per language — translation is its own entry below.
 */
const EDIT_ACTIONS = [
  {
    key: 'editor.ai.menu.improve',
    icon: WandSparkles,
    prompt:
      'Rewrite the selected text so it reads clearly and naturally. Preserve all facts, meaning, and the original language. Return only the rewritten text.',
  },
  {
    key: 'editor.ai.menu.grammar',
    icon: SpellCheck,
    prompt:
      'Correct spelling and grammar in the selected text. Preserve its meaning, language, and tone. Return only the corrected text.',
  },
  {
    key: 'editor.ai.menu.shorter',
    icon: Minimize2,
    prompt:
      'Make the selected text more concise while preserving its key information and original language. Return only the shortened text.',
  },
  {
    key: 'editor.ai.menu.longer',
    icon: Maximize2,
    prompt:
      'Expand the selected text with relevant detail, without inventing facts. Preserve its meaning and original language. Return only the expanded text.',
  },
  {
    key: 'editor.ai.menu.simplify',
    icon: Text,
    prompt:
      'Rewrite the selected text in plain, simple language a general reader can follow. Preserve its meaning and original language. Return only the rewritten text.',
  },
];

/** Rewrites that change voice rather than content. */
const TONES = [
  { key: 'editor.ai.tone.professional', tone: 'Professional', icon: Briefcase },
  { key: 'editor.ai.tone.casual', tone: 'Casual', icon: Smile },
  { key: 'editor.ai.tone.confident', tone: 'Confident', icon: Volume2 },
  { key: 'editor.ai.tone.friendly', tone: 'Friendly', icon: Sparkles },
];

/** Actions that produce new text about the selection. */
const GENERATE_ACTIONS = [
  {
    key: 'editor.ai.menu.summarize',
    icon: ListTree,
    prompt:
      'Summarise the selected text in a few sentences, in its original language. Return only the summary.',
  },
  {
    key: 'editor.ai.menu.explain',
    icon: MessageCircleQuestion,
    prompt:
      'Explain the selected text in plain terms, in its original language. Return only the explanation.',
  },
  // Structure changes: the answer is Markdown, so a table or a list arrives
  // as the real node, not as text that looks like one.
  {
    key: 'editor.ai.menu.table',
    icon: TableIcon,
    prompt:
      'Turn the selected text into a Markdown table with a header row, keeping every fact and its original language. Return only the table.',
  },
  {
    key: 'editor.ai.menu.list',
    icon: List,
    prompt:
      'Turn the selected text into a concise Markdown bullet list, one point per item, in its original language. Return only the list.',
  },
];

/**
 * Default translation target: the reader's own browser language, so the common
 * case needs no submenu at all. `translateLanguages` overrides this with a
 * fixed list.
 *
 * Two names are needed. The prompt uses the English name, which models resolve
 * most reliably; the menu shows the endonym, which the reader recognises.
 */
function browserTranslateTarget(): { label: string; name: string } | null {
  const tag = typeof navigator === 'undefined' ? '' : navigator.language;

  if (!tag) return null;

  try {
    const label = new Intl.DisplayNames([tag], { type: 'language' }).of(tag);
    const name = new Intl.DisplayNames(['en'], { type: 'language' }).of(tag);

    // Several endonyms are lowercase by convention ("français"); a menu entry
    // reads as a typo that way. Casing is a no-op for caseless scripts.
    const shown = label ? label.charAt(0).toLocaleUpperCase(tag) + label.slice(1) : tag;

    return { label: shown, name: name ?? tag };
  } catch {
    // Intl.DisplayNames is unavailable or the tag is malformed.
    return { label: tag, name: tag };
  }
}

/** Can also be used inside a custom buttonBubble. */
export function RichTextAIImprove() {
  const { t } = useLocale();
  const editor = useEditorInstance();
  const [menuContainer, setMenuContainer] = useState<HTMLDivElement | null>(null);
  const selection = useRef<Range | null>(null);
  const document = useRef(editor.state.doc);

  const aiExtension = editor.extensionManager.extensions.find(
    (extension) => extension.name === 'ai'
  );

  if (!aiExtension) return null;

  const languages: string[] = aiExtension.options?.translateLanguages ?? [];
  const browserTarget = languages.length ? null : browserTranslateTarget();

  function translatePrompt(language: string) {
    return `Translate the selected text into ${language}. Preserve meaning and proper names. Return only the translation.`;
  }

  function run(prompt?: string) {
    const range = selection.current;
    // Do not overwrite a selection captured before a collaborative edit.
    if (!range || document.current !== editor.state.doc || !editor.isEditable) return;
    editor.chain().setTextSelection(range).openAI(prompt).run();
  }

  return (
    <div ref={setMenuContainer} className='richtext-ai-improve-anchor'>
      <DropdownMenu
        modal={false}
        onOpenChange={(open) => {
          if (open) {
            const { from, to } = editor.state.selection;
            selection.current = from < to ? { from, to } : null;
            document.current = editor.state.doc;
          }
        }}
      >
        <DropdownMenuTrigger asChild>
          <ActionButton
            aria-label={t('editor.ai.menu.trigger')}
            customClass='richtext-ai-improve-trigger !richtext-w-auto'
          >
            <Sparkles size={16} /> {t('editor.ai.menu.trigger')}
          </ActionButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          portalContainer={menuContainer}
          align='start'
          side='bottom'
          className='richtext-ai-improve-menu'
          onCloseAutoFocus={(event) => event.preventDefault()}
        >
          <DropdownMenuLabel className='richtext-text-xs richtext-font-normal richtext-text-muted-foreground'>
            {t('editor.ai.menu.edit')}
          </DropdownMenuLabel>

          {EDIT_ACTIONS.map(({ key, icon: Icon, prompt }) => (
            <DropdownMenuItem
              key={key}
              className='richtext-ai-improve-item'
              onSelect={() => run(prompt)}
            >
              <Icon size={17} />
              {t(key)}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='richtext-ai-improve-item'>
              <Volume2 size={17} />
              {t('editor.ai.menu.tone')}
            </DropdownMenuSubTrigger>

            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {TONES.map(({ key, tone, icon: Icon }) => (
                  <DropdownMenuItem
                    key={key}
                    className='richtext-ai-improve-item'
                    onSelect={() =>
                      run(
                        `Rewrite the selected text in a ${tone.toLowerCase()} tone. Preserve its meaning and original language. Return only the rewritten text.`
                      )
                    }
                  >
                    <Icon size={17} />
                    {t(key)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className='richtext-text-xs richtext-font-normal richtext-text-muted-foreground'>
            {t('editor.ai.menu.generate')}
          </DropdownMenuLabel>

          {GENERATE_ACTIONS.map(({ key, icon: Icon, prompt }) => (
            <DropdownMenuItem
              key={key}
              className='richtext-ai-improve-item'
              onSelect={() => run(prompt)}
            >
              <Icon size={17} />
              {t(key)}
            </DropdownMenuItem>
          ))}

          {languages.length ? (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className='richtext-ai-improve-item'>
                <Languages size={17} />
                {t('editor.ai.menu.translate')}
              </DropdownMenuSubTrigger>

              <DropdownMenuPortal>
                <DropdownMenuSubContent className='richtext-max-h-[280px] richtext-overflow-auto'>
                  {languages.map((language) => (
                    <DropdownMenuItem
                      key={language}
                      className='richtext-ai-improve-item'
                      onSelect={() => run(translatePrompt(language))}
                    >
                      {language}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          ) : null}

          {browserTarget ? (
            <DropdownMenuItem
              className='richtext-ai-improve-item'
              onSelect={() => run(translatePrompt(browserTarget.name))}
            >
              <Languages size={17} />
              {t('editor.ai.menu.translate')}
              <span className='richtext-ai-improve-target'>{browserTarget.label}</span>
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />

          <DropdownMenuItem className='richtext-ai-improve-item' onSelect={() => run()}>
            <Sparkles size={17} />
            {t('editor.ai.menu.ask')}
          </DropdownMenuItem>

          {aiExtension.options?.composer !== false ? (
            <DropdownMenuItem
              className='richtext-ai-improve-item'
              onSelect={() => editor.commands.toggleAIComposer(true)}
            >
              <PanelBottomOpen size={17} />
              {t('editor.ai.menu.composer')}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
