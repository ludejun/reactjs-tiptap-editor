import { emit } from '@/components/ReactBus';
import { HEADINGS } from '@/constants';
import { EVENTS } from '@/utils/customEvents/events.constant';

import type { CommandList } from './types';
import type { Editor } from '@tiptap/core';

export function renderCommandListDefault({ t }: { t: (path: string) => string }) {
  // Insert comes first: someone who opens the menu usually wants a table, a
  // code block or an image, not a heading they could type with `#`. Anything
  // used less often is `hiddenUntilSearched`, so the default list stays short
  // and the search still finds everything.
  const groups: CommandList[] = [
    {
      name: 'insert',
      title: t('editor.slash.insert'),
      commands: [],
    },
    {
      name: 'format',
      title: t('editor.slash.format'),
      commands: [],
    },
  ];
  const [insert, format] = groups;

  // heading
  HEADINGS.forEach((level) => {
    format.commands.push({
      name: `heading${level}`,
      // H1-H3 cover almost every document; Paragraph and H4-H6 only appear
      // once searched.
      hiddenUntilSearched: level === 'Paragraph' || level > 3,
      label:
        level === 'Paragraph'
          ? t('editor.paragraph.tooltip')
          : t(`editor.heading.h${level}.tooltip`),
      aliases: [`h${level}`, 'bt', `bt${level}`],
      iconName: `Heading${level}`,
      isActive: (editor) => {
        if (level === 'Paragraph') {
          return false;
        }

        return editor.isActive('heading', { level }) || false;
      },
      action: ({ editor, range }) => {
        const currentActiveLevel = HEADINGS.find((lvl) =>
          editor.isActive('heading', { level: lvl })
        );

        if (level === 'Paragraph') {
          if (currentActiveLevel !== undefined && currentActiveLevel !== 'Paragraph') {
            editor.commands.toggleHeading({ level: currentActiveLevel });
            editor.chain().focus().deleteRange(range).run();
          } else {
            editor.chain().focus().deleteRange(range).run();
          }

          return;
        }

        if (level) {
          editor.chain().focus().deleteRange(range).setHeading({ level }).run();
          return;
        }

        editor.chain().focus().deleteRange(range).run();
      },
    });
  });

  //bulletlist
  format.commands.push({
    name: 'bulletList',
    label: t('editor.bulletlist.tooltip'),
    aliases: ['ul', 'yxlb'],
    iconName: 'List',
    isActive: (editor) => editor.isActive('bulletList'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  });

  //orderedlist
  format.commands.push({
    name: 'orderedlist',
    label: t('editor.orderedlist.tooltip'),
    aliases: ['ol', 'yxlb'],
    iconName: 'ListOrdered',
    isActive: (editor) => editor.isActive('orderedList'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  });

  // tasklist
  format.commands.push({
    name: 'taskList',
    label: t('editor.tasklist.tooltip'),
    iconName: 'ListTodo',
    description: 'Task list with todo items',
    aliases: ['todo'],
    isActive: (editor) => editor.isActive('taskList'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  });

  // blockquote
  format.commands.push({
    name: 'blockquote',
    label: t('editor.blockquote.tooltip'),
    description: '插入引入格式',
    aliases: ['yr'],
    iconName: 'TextQuote',
    isActive: (editor) => editor.isActive('blockquote'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  });

  /* Insert */
  // table
  insert.commands.push({
    name: 'table',
    label: t('editor.table.tooltip'),
    iconName: 'Table',
    description: 'Insert a table',
    aliases: ['table', 'bg', 'biaoge', 'biao'],
    shouldBeHidden: (editor) => editor.isActive('columns'),
    action: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  });

  // codeblock
  insert.commands.push({
    name: 'codeBlock',
    label: t('editor.codeblock.tooltip'),
    iconName: 'Code2',
    description: 'Code block with syntax highlighting',
    shouldBeHidden: (editor) => editor.isActive('columns'),
    isActive: (editor) => editor.isActive('codeBlock'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  });

  // name
  insert.commands.push({
    name: 'image',
    label: t('editor.image.tooltip'),
    iconName: 'ImageUp',
    description: 'Insert a image',
    aliases: ['image', 'tp', 'tupian'],
    shouldBeHidden: (editor) => editor.isActive('columns'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const EVENT_ID = EVENTS.UPLOAD_IMAGE(editor.id);
      emit(EVENT_ID, true);
    },
  });

  // divider (replaces horizontalRule when registered)
  insert.commands.push({
    name: 'divider',
    label: t('editor.divider.tooltip'),
    iconName: 'SeparatorHorizontal',
    description: 'Insert a divider',
    aliases: ['divider', 'hr', 'fgx', 'fg', 'line'],
    shouldBeHidden: (editor) => !editor.schema.nodes.divider,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setDivider().run();
    },
  });

  //horizontalrule
  insert.commands.push({
    name: 'horizontalRule',
    label: t('editor.horizontalrule.tooltip'),
    iconName: 'Minus',
    description: 'Insert a horizontal divider',
    aliases: ['hr', 'fgx', 'fg'],
    shouldBeHidden: (editor) =>
      !!editor.schema.nodes.divider || !editor.schema.nodes.horizontalRule,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  });

  // columns
  insert.commands.push({
    name: 'columns',
    hiddenUntilSearched: true,
    label: t('editor.columns.tooltip'),
    iconName: 'Columns2',
    description: 'Add two column content',
    action: ({ editor }) => {
      editor.chain().focus().insertColumns({ cols: 2 }).run();
    },
  });

  // details (toggle)
  insert.commands.push({
    name: 'details',
    hiddenUntilSearched: true,
    label: t('editor.details.tooltip'),
    iconName: 'Details',
    description: 'Insert a collapsible toggle block',
    aliases: ['toggle', 'collapse', 'details', 'accordion'],
    shouldBeHidden: (editor) => !editor.schema.nodes.details,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setDetails().run();
    },
  });

  // video
  insert.commands.push({
    name: 'video',
    hiddenUntilSearched: true,
    label: t('editor.video.tooltip'),
    iconName: 'Video',
    description: 'Insert a video',
    aliases: ['video', 'sp', 'shipin'],
    shouldBeHidden: (editor) => editor.isActive('columns'),
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const EVENT_ID = EVENTS.UPLOAD_VIDEO(editor.id);
      emit(EVENT_ID, true);
    },
  });

  // table of contents
  insert.commands.push({
    name: 'tableOfContents',
    hiddenUntilSearched: true,
    label: t('editor.tableofcontents.tooltip'),
    iconName: 'TableOfContents',
    description: 'Insert a live table of contents',
    aliases: ['toc', 'outline', 'contents'],
    shouldBeHidden: (editor) => !editor.schema.nodes.tableOfContentsNode,
    action: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).insertTableOfContents().run();
    },
  });

  return groups;
}

export function useFilterCommandList(commandList: CommandList[], query: string, editor?: Editor) {
  const withFilteredCommands = commandList.map((group) => ({
    ...group,
    commands: group.commands.filter((item) => {
      if (editor && item.shouldBeHidden?.(editor)) {
        return false;
      }

      const labelNormalized = item.label.toLowerCase().trim();
      const queryNormalized = query.toLowerCase().trim();

      if (item.hiddenUntilSearched && !queryNormalized) {
        return false;
      }

      if (item.aliases) {
        const aliases = item.aliases.map((alias) => alias.toLowerCase().trim());
        const labelMatch = labelNormalized.includes(queryNormalized);
        const aliasMatch = aliases.some((alias) => alias.includes(queryNormalized));

        return labelMatch || aliasMatch;
      }

      return labelNormalized.includes(queryNormalized);
    }),
  }));
  // Remove empty groups
  const withoutEmptyGroups = withFilteredCommands.filter((group) => {
    if (group.commands.length > 0) {
      return true;
    }

    return false;
  });

  return withoutEmptyGroups;
}
