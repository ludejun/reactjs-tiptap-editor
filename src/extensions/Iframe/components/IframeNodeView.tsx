import { NodeViewWrapper } from '@tiptap/react';
import {
  ClipboardListIcon,
  CodeXmlIcon,
  FileTextIcon,
  FrameIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  MusicIcon,
  PenToolIcon,
  VideoIcon,
  XIcon,
} from 'lucide-react';
import { Resizable } from 're-resizable';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';
import {
  EMBED_KINDS,
  resolveEmbed,
  servicesOfKind,
  type EmbedKind,
} from '@/extensions/Iframe/embeds';
import { IframeCore as Iframe } from '@/extensions/Iframe/Iframe';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useEditableEditor } from '@/store/store';

import styles from './index.module.scss';
import type { NodeViewProps } from '@tiptap/react';

/** One icon per kind of service, drawn in the kind's colour under the prompt. */
const KIND_ICONS: Record<EmbedKind, typeof VideoIcon> = {
  video: VideoIcon,
  audio: MusicIcon,
  map: MapPinIcon,
  design: PenToolIcon,
  board: LayoutDashboardIcon,
  code: CodeXmlIcon,
  document: FileTextIcon,
  form: ClipboardListIcon,
  other: FrameIcon,
};

function IframeNodeView({ editor, node, updateAttributes, deleteNode }: NodeViewProps) {
  const isEditable = useEditableEditor();
  const { t } = useLocale();

  const { src, width, height } = node.attrs;

  const [originalLink, setOriginalLink] = useState<string>('');

  // Resolved as the reader types, so the hint can name the service and its tips.
  const resolved = originalLink.trim() ? resolveEmbed(originalLink) : null;

  function handleConfirm() {
    if (!resolved) {
      return;
    }

    editor
      .chain()
      .updateAttributes(Iframe.name, {
        src: resolved.src,
        service: resolved.service.key,
        // A YouTube frame wants 16:9, a form wants to be tall; keep a size the reader already set.
        height: node.attrs.height === 300 ? resolved.height : node.attrs.height,
      })
      .setNodeSelection(editor.state.selection.from)
      .focus()
      .run();
  }

  const onResize = useCallback(
    (size: { width: number | string; height: number | string }) => {
      updateAttributes({ width: size.width, height: size.height });
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper>
      {!src && (
        <div
          className='richtext-my-3 richtext-w-full richtext-rounded-lg richtext-border richtext-border-dashed richtext-border-border richtext-bg-muted/40 richtext-p-3'
          contentEditable={false}
        >
          <div className='richtext-mb-2 richtext-flex richtext-items-center richtext-gap-2 richtext-text-sm richtext-font-medium richtext-text-foreground'>
            <FrameIcon className='richtext-size-4 richtext-text-muted-foreground' />
            <span>{t('editor.iframe.tooltip')}</span>
            <button
              aria-label={t('editor.iframe.remove')}
              className='richtext-ml-auto richtext-flex richtext-size-6 richtext-items-center richtext-justify-center richtext-rounded richtext-border-0 richtext-bg-transparent richtext-text-muted-foreground hover:richtext-bg-accent hover:richtext-text-foreground'
              onClick={() => deleteNode()}
              title={t('editor.iframe.remove')}
              type='button'
            >
              <XIcon className='richtext-size-4' />
            </button>
          </div>

          <div className='richtext-flex richtext-items-center richtext-gap-2'>
            <Input
              autoFocus
              className='richtext-flex-1 richtext-bg-background'
              onInput={(e) => setOriginalLink(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              placeholder={t('editor.iframe.placeholder')}
              type='text'
              value={originalLink}
            />

            <Button disabled={!resolved} onClick={handleConfirm}>
              {t('editor.iframe.insert')}
            </Button>
          </div>

          {/* What the block understands: one coloured icon per kind, the services in its tooltip.
              Once a link is typed, the detected service and its tips take the row. */}
          <div className='richtext-mt-2 richtext-flex richtext-min-h-6 richtext-items-center richtext-gap-1 richtext-px-0.5 richtext-text-xs richtext-leading-5 richtext-text-muted-foreground'>
            {resolved ? (
              <>
                <span className='richtext-font-medium richtext-text-foreground'>
                  {resolved.service.name}
                </span>
                {resolved.service.tips ? <span> — {resolved.service.tips}</span> : null}
              </>
            ) : originalLink.trim() ? (
              t('editor.iframe.invalid')
            ) : (
              EMBED_KINDS.map(({ kind, color }) => {
                const Icon = KIND_ICONS[kind];
                const names = servicesOfKind(kind)
                  .map((service) => service.name)
                  .join(', ');

                return (
                  <span
                    className='richtext-flex richtext-size-6 richtext-items-center richtext-justify-center richtext-rounded'
                    key={kind}
                    style={{ color }}
                    title={`${t(`editor.iframe.kind.${kind}`)}: ${names}`}
                  >
                    <Icon className='richtext-size-4' />
                  </span>
                );
              })
            )}
          </div>
        </div>
      )}

      {src && (
        <Resizable
          size={{
            width: Number.parseInt(width),
            height: Number.parseInt(height),
          }}
          onResizeStop={(e, direction, ref, d) => {
            onResize({
              width: Number.parseInt(width) + d.width,
              height: Number.parseInt(height) + d.height,
            });
          }}
        >
          <div className={cn(styles.wrap, 'render-wrapper')}>
            <div
              className={styles.innerWrap}
              style={{ pointerEvents: !isEditable ? 'auto' : 'none' }}
            >
              <iframe className='richtext-my-[12px]' src={src}></iframe>
            </div>
          </div>
        </Resizable>
      )}
    </NodeViewWrapper>
  );
}

export default IframeNodeView;
