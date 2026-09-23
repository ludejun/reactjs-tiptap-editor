import { NodeViewWrapper } from '@tiptap/react';

import {
  scrollToTableOfContentsItem,
  useTableOfContents,
} from '@/extensions/TableOfContents/components/useTableOfContents';
import { tableOfContentsIndexLabel } from '@/extensions/TableOfContents/toc';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';

import type { NodeViewProps } from '@tiptap/react';
import type { CSSProperties } from 'react';

export function NodeViewTableOfContents({ editor, selected }: NodeViewProps) {
  const { t } = useLocale();
  const items = useTableOfContents(editor);

  return (
    <NodeViewWrapper
      className={cn('table-of-contents', { 'is-selected': selected })}
      contentEditable={false}
      data-type='table-of-contents'
    >
      <p className='table-of-contents__title'>{t('editor.tableofcontents.title')}</p>

      {items.length === 0 ? (
        <p className='table-of-contents__empty'>{t('editor.tableofcontents.empty')}</p>
      ) : (
        <ul className='table-of-contents__list'>
          {items.map((item, index) => (
            <li
              className='table-of-contents__item'
              key={item.id ?? `${item.pos}`}
              style={{ '--toc-level': item.level } as CSSProperties}
            >
              <button
                className={cn('table-of-contents__link', {
                  'is-active': item.isActive,
                })}
                onClick={() => scrollToTableOfContentsItem(editor, item)}
                type='button'
              >
                <span className='table-of-contents__index'>
                  {tableOfContentsIndexLabel(items, index)}
                </span>

                <span className='table-of-contents__text'>{item.textContent}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </NodeViewWrapper>
  );
}
