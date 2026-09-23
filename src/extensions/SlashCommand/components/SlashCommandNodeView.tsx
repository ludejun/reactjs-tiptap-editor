import React, {
  Fragment,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { IconComponent, Label } from '@/components';
import { AI_COMPOSER_ACTIONS, composerPrompt } from '@/extensions/AI/composer';
import { writeWithAI } from '@/extensions/AI/writer';
import { useFilterCommandList } from '@/extensions/SlashCommand/renderCommandListDefault';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useSignalCommandList } from '@/store/commandList';

import type { Command } from '../types';
import type { SuggestionHandle } from '@/utils/renderNodeView';
import type { SuggestionProps } from '@tiptap/suggestion';

function SlashCommandNodeView(
  props: SuggestionProps<Command>,
  ref: React.ForwardedRef<SuggestionHandle>
) {
  const [commandList] = useSignalCommandList();

  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const scrollContainer = useRef<HTMLDivElement | null>(null);

  const { t } = useLocale();

  const hasAI = props.editor.extensionManager.extensions.some(
    (extension) => extension.name === 'ai'
  );
  const groups = hasAI
    ? [
        {
          name: 'ai',
          title: 'AI',
          commands: [
            {
              name: 'askAI',
              label: t('editor.ai.title'),
              iconName: 'Sparkles',
              aliases: ['ai', 'write', 'generate'],
              action: ({ editor, range }: Parameters<Command['action']>[0]) => {
                editor.chain().deleteRange(range).openAI().run();
              },
            },
            {
              name: 'aiContinue',
              label: t('editor.ai.compose.continue'),
              iconName: 'PenLine',
              aliases: ['ai', 'continue', 'more', 'xuxie'],
              action: ({ editor, range }: Parameters<Command['action']>[0]) => {
                editor.chain().deleteRange(range).run();
                editor.commands.toggleAIComposer(true);
                const action = AI_COMPOSER_ACTIONS.find((item) => item.target === 'end');
                if (action)
                  void writeWithAI(editor, { prompt: composerPrompt(action), target: 'cursor' });
              },
            },
            {
              name: 'aiComposer',
              label: t('editor.ai.compose.title'),
              iconName: 'PanelBottomOpen',
              aliases: ['ai', 'composer', 'chat'],
              action: ({ editor, range }: Parameters<Command['action']>[0]) => {
                editor.chain().deleteRange(range).toggleAIComposer(true).run();
              },
            },
          ],
        },
        ...commandList,
      ]
    : commandList;
  const [showAll, setShowAll] = useState(false);
  const commandQuery = useFilterCommandList(groups, props.query, props.editor, showAll);
  const hasHiddenCommands = groups.some((group) =>
    group.commands.some((command) => command.hiddenUntilSearched)
  );

  useEffect(() => {
    setSelectedCommandIndex(0);
    setSelectedGroupIndex(0);
  }, [props.query]);

  const activeItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useImperativeHandle(ref, () => {
    return {
      onKeyDown,
    };
  });

  useEffect(() => {
    if (!scrollContainer.current) {
      return;
    }
    const activeItemIndex = selectedGroupIndex * 1000 + selectedCommandIndex;
    const activeItem = activeItemRefs.current[activeItemIndex];
    if (!activeItem) {
      return;
    }
    // Scroll the list only. `Element.scrollIntoView` scrolls every scrollable
    // ancestor, the window included, and the popup is appended to `<body>`
    // before it is positioned — so on open it could drag the page to wherever
    // the popup happened to be.
    const list = scrollContainer.current;
    const top = activeItem.offsetTop - list.offsetTop;
    const bottom = top + activeItem.offsetHeight;
    if (top < list.scrollTop) {
      list.scrollTo({ top, behavior: 'smooth' });
    } else if (bottom > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: bottom - list.clientHeight, behavior: 'smooth' });
    }
  }, [selectedCommandIndex, selectedGroupIndex]);

  function onKeyDown({ event }: { event: KeyboardEvent }) {
    if (event.key === 'ArrowUp') {
      upHandler();
      return true;
    }

    if (event.key === 'ArrowDown') {
      downHandler();
      return true;
    }

    if (event.key === 'Enter') {
      enterHandler();
      return true;
    }

    return false;
  }

  function upHandler() {
    if (commandQuery.length === 0) {
      return false;
    }
    let newCommandIndex = selectedCommandIndex - 1;
    let newGroupIndex = selectedGroupIndex;

    if (newCommandIndex < 0) {
      newGroupIndex = selectedGroupIndex - 1;
      newCommandIndex = commandQuery[newGroupIndex]?.commands.length - 1 || 0;
    }

    if (newGroupIndex < 0) {
      newGroupIndex = commandQuery.length - 1;
      newCommandIndex = commandQuery[newGroupIndex].commands.length - 1;
    }

    setSelectedCommandIndex(newCommandIndex);
    setSelectedGroupIndex(newGroupIndex);
  }

  function downHandler() {
    if (commandQuery.length === 0) {
      return false;
    }
    const commands = commandQuery[selectedGroupIndex]?.commands;
    if (!commands) return;
    let newCommandIndex = selectedCommandIndex + 1;
    let newGroupIndex = selectedGroupIndex;

    if (commands.length - 1 < newCommandIndex) {
      newCommandIndex = 0;
      newGroupIndex = selectedGroupIndex + 1;
    }
    if (commandQuery.length - 1 < newGroupIndex) {
      newGroupIndex = 0;
    }
    setSelectedCommandIndex(newCommandIndex);
    setSelectedGroupIndex(newGroupIndex);
  }

  function enterHandler() {
    if (commandQuery.length === 0 || selectedGroupIndex === -1 || selectedCommandIndex === -1) {
      return false;
    }

    selectItem(selectedGroupIndex, selectedCommandIndex);
  }

  function selectItem(groupIndex: number, commandIndex: number) {
    const command = commandQuery[groupIndex]?.commands[commandIndex];
    if (command) props.command(command);
  }

  function createCommandClickHandler(groupIndex: number, commandIndex: number) {
    selectItem(groupIndex, commandIndex);
  }
  function setActiveItemRef(
    groupIndex: number,
    commandIndex: number,
    el: HTMLButtonElement | null
  ) {
    activeItemRefs.current[groupIndex * 1000 + commandIndex] = el;
  }

  return (
    <div
      className='richtext-max-h-[min(80vh,24rem)] richtext-flex-wrap richtext-overflow-y-auto richtext-overflow-x-hidden richtext-rounded-md !richtext-border !richtext-border-solid !richtext-border-border richtext-bg-popover richtext-p-1 richtext-text-popover-foreground richtext-shadow-md richtext-outline-none'
      data-richtext-portal
      ref={scrollContainer}
    >
      {commandQuery?.length ? (
        <div className='richtext-grid richtext-min-w-48 richtext-grid-cols-1 richtext-gap-0.5'>
          {commandQuery?.map((group, groupIndex) => {
            return (
              <Fragment key={`slash-${group.title}`}>
                <Label className='richtext-mx-[4px] richtext-mb-[4px] richtext-mt-[8px] !richtext-text-[0.65rem] richtext-uppercase'>
                  {group.title}
                </Label>

                {group.commands.map((command, commandIndex) => {
                  return (
                    <button
                      key={`command-${commandIndex}`}
                      onClick={() => createCommandClickHandler(groupIndex, commandIndex)}
                      ref={(el) => setActiveItemRef(groupIndex, commandIndex, el)}
                      className={cn(
                        'richtext-flex richtext-w-full richtext-items-center richtext-gap-3 richtext-rounded-sm !richtext-border-none !richtext-bg-transparent richtext-px-2 richtext-py-1.5 richtext-text-left richtext-text-sm richtext-text-foreground !richtext-outline-none richtext-transition-colors hover:!richtext-bg-accent',
                        {
                          'bg-item-active':
                            selectedGroupIndex === groupIndex &&
                            selectedCommandIndex === commandIndex,
                        }
                      )}
                    >
                      {command.iconUrl && (
                        <img alt='' className='richtext-size-6' src={command.iconUrl} />
                      )}

                      {command.iconName && (
                        <IconComponent
                          className='!richtext-mr-1 !richtext-text-lg'
                          name={command.iconName}
                        />
                      )}

                      {command.label}

                      {command.shortcut ? (
                        <kbd className='richtext-ml-auto richtext-rounded richtext-border richtext-border-solid richtext-border-border richtext-bg-muted richtext-px-1 richtext-font-mono richtext-text-[10px] richtext-leading-4 richtext-text-muted-foreground'>
                          {command.shortcut}
                        </kbd>
                      ) : null}
                    </button>
                  );
                })}
              </Fragment>
            );
          })}

          {/* Rarely used blocks stay out of the default list. Say so, or they
              look missing. */}
          {!props.query && !showAll && hasHiddenCommands ? (
            <button
              className='richtext-mx-1 richtext-mt-1 richtext-flex richtext-w-auto richtext-items-center richtext-gap-1 richtext-border-0 richtext-border-t richtext-border-solid richtext-border-border !richtext-bg-transparent richtext-px-1 richtext-pb-1 richtext-pt-1.5 richtext-text-left richtext-text-[11px] richtext-text-muted-foreground hover:richtext-text-foreground'
              type='button'
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setShowAll(true)}
            >
              {t('editor.slash.showMore')}
            </button>
          ) : null}
        </div>
      ) : (
        <div className='richtext-p-3'>
          <span className='richtext-text-xs richtext-text-foreground'>
            {t('editor.slash.empty')}
          </span>
        </div>
      )}
    </div>
  );
}

export default forwardRef(SlashCommandNodeView);
