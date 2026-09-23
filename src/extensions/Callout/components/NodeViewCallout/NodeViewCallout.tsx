import { NodeViewWrapper } from '@tiptap/react';
import { AlertCircle, Info, Lightbulb, OctagonAlert, TriangleAlert } from 'lucide-react';

import { getCalloutType } from '@/extensions/Callout/calloutTypes';
import { cn } from '@/lib/utils';

import type { NodeViewProps } from '@tiptap/react';

const CALLOUT_ICONS = {
  note: Info,
  tip: Lightbulb,
  important: AlertCircle,
  warning: TriangleAlert,
  caution: OctagonAlert,
} as const;

export function NodeViewCallout({ node }: NodeViewProps) {
  const { type = 'note', title = '', body = '' } = node.attrs;

  const IconComponent = CALLOUT_ICONS[getCalloutType(type).value];

  return (
    <NodeViewWrapper>
      <div
        className={cn(
          'richtext-relative richtext-my-4 richtext-rounded-lg richtext-border richtext-p-4',
          {
            'richtext-border-[#1f6feb] richtext-bg-[#1f6feb1f]': type === 'note',
            'richtext-border-[#238636] richtext-bg-[#2386361f]': type === 'tip',
            'richtext-border-[#ab7df8] richtext-bg-[#ab7df81f]': type === 'important',
            'richtext-border-[#d29922] richtext-bg-[#d299221f]': type === 'warning',
            'richtext-border-[#f85149] richtext-bg-[#f851491f]': type === 'caution',
          }
        )}
      >
        <div
          className={cn('richtext-mb-2 richtext-flex richtext-items-center richtext-gap-2', {
            'richtext-text-[#1f6feb]': type === 'note',
            'richtext-text-[#238636]': type === 'tip',
            'richtext-text-[#ab7df8]': type === 'important',
            'richtext-text-[#d29922]': type === 'warning',
            'richtext-text-[#f85149]': type === 'caution',
          })}
        >
          <IconComponent className='richtext-size-5' />

          <span className='richtext-font-semibold'>{title}</span>
        </div>

        {body && (
          <p
            className='richtext-whitespace-pre-wrap richtext-pl-[28px]'
            dangerouslySetInnerHTML={{
              __html: body,
            }}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
}
