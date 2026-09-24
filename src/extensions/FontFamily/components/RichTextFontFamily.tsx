import React, { Fragment, useMemo, useState } from 'react';

import {
  ActionMenuButton,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components';
import { FONT_SCRIPT_BY_VALUE, type FontScript } from '@/constants';
import { FontFamily } from '@/extensions/FontFamily/FontFamily';
import { useActive } from '@/hooks/useActive';
import { useButtonProps } from '@/hooks/useButtonProps';
import { useLocale } from '@/locales';
import { useEditorInstance } from '@/store/editor';

import type { ButtonViewReturnComponentProps } from '@/types';
import type { Editor } from '@tiptap/core';

/** Language codes, however the host spells them, mapped to a writing system. */
const SCRIPT_BY_LANGUAGE: Record<string, FontScript> = {
  zh: 'zh',
  ja: 'ja',
  ko: 'ko',
  hi: 'hi',
  bn: 'bn',
};

const SCRIPT_PATTERNS: [FontScript, RegExp][] = [
  // Kana and Hangul are checked as well as Han: a Japanese or Korean document
  // also contains Han characters, but the reverse is not true.
  ['ja', /[\u3040-\u30FF]/],
  ['ko', /[\uAC00-\uD7AF]/],
  ['zh', /[\u4E00-\u9FFF]/],
  ['hi', /[\u0900-\u097F]/],
  ['bn', /[\u0980-\u09FF]/],
];

/** How much of the document to sniff. Enough to be representative, cheap to scan. */
const SCRIPT_SAMPLE_LENGTH = 4000;

/**
 * Which writing systems this document actually uses.
 *
 * Gating the list on the interface language alone would be wrong the moment
 * someone writes Chinese in an English interface, which is common; the
 * document itself is the better signal, and the menu is the only place that
 * needs the answer, so it is recomputed each time the menu opens.
 */
function documentScripts(editor: Editor | null): Set<FontScript> {
  const found = new Set<FontScript>();

  if (!editor) {
    return found;
  }

  const size = editor.state.doc.content.size;
  const text = editor.state.doc.textBetween(0, Math.min(size, SCRIPT_SAMPLE_LENGTH), ' ');

  for (const [script, pattern] of SCRIPT_PATTERNS) {
    if (pattern.test(text)) {
      found.add(script);
    }
  }

  return found;
}

export interface Item {
  title: string;
  icon?: string;
  font?: string;
  isActive: NonNullable<ButtonViewReturnComponentProps['isActive']>;
  action?: ButtonViewReturnComponentProps['action'];
  style?: React.CSSProperties;
  shortcutKeys?: string[];
  disabled?: boolean;
  divider?: boolean;
  default?: boolean;
}

export function RichTextFontFamily() {
  const { lang, t } = useLocale();
  const editor = useEditorInstance();
  const [docScripts, setDocScripts] = useState<Set<FontScript>>(() => new Set<FontScript>());

  const buttonProps = useButtonProps<{
    icon?: string;
    tooltip?: string;
    items?: Item[];
    isActive?: () => Item | boolean;
  }>(FontFamily.name);

  const {
    icon = undefined,
    tooltip = undefined,
    items = [],
    isActive = undefined,
  } = buttonProps?.componentProps ?? {};

  const { disabled, dataState } = useActive(isActive);

  // The label, not the value: a cross-platform stack such as
  // `"PingFang SC", "Microsoft YaHei", …` is unreadable in a menu row.
  const title = useMemo(() => {
    return (
      (typeof dataState === 'object' ? dataState?.title : undefined) ||
      t('editor.fontFamily.default.tooltip')
    );
  }, [dataState, t]);

  const localeScript = SCRIPT_BY_LANGUAGE[String(lang).toLowerCase().split(/[-_]/)[0]];

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      const script = FONT_SCRIPT_BY_VALUE.get(item.font ?? '');

      return !script || script === localeScript || docScripts.has(script);
    });
  }, [items, localeScript, docScripts]);

  if (!buttonProps) {
    return <></>;
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && setDocScripts(documentScripts(editor))}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <ActionMenuButton
          // Fixed width: font names vary a lot, and the toolbar must not shift with them.
          className='richtext-w-24'
          disabled={disabled}
          icon={icon}
          title={title}
          tooltip={tooltip}
          // tooltipOptions={tooltipOptions}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className='richtext-w-full'>
        {visibleItems.map((item, index) => {
          // "Default" is the one row whose name is a translated word rather
          // than a font, so it is neither previewed nor shown verbatim.
          const label = item.default ? t('editor.fontFamily.default.tooltip') : item.title;
          const style = item.default ? {} : { fontFamily: item.font };

          return (
            <Fragment key={`font-family-${index}`}>
              <DropdownMenuCheckboxItem checked={title === label} onClick={item.action}>
                <div className='richtext-ml-1 richtext-h-full' style={style}>
                  {label}
                </div>
              </DropdownMenuCheckboxItem>

              {item.default && <DropdownMenuSeparator />}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
