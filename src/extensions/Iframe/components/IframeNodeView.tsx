import { NodeViewWrapper } from '@tiptap/react';
import { FrameIcon, XIcon } from 'lucide-react';
import { Resizable } from 're-resizable';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';
import { EmbedLogo } from '@/extensions/Iframe/components/EmbedLogo';
import { EMBED_KINDS, resolveEmbed, servicesOfKind } from '@/extensions/Iframe/embeds';
import { IframeCore as Iframe } from '@/extensions/Iframe/Iframe';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useEditableEditor } from '@/store/store';

import styles from './index.module.scss';
import type { NodeViewProps } from '@tiptap/react';

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

          {/* What the block understands: the recognised services as brand marks, grouped by
              kind. Once a link is typed, the detected service and its tips take the row. */}
          <div className='richtext-mt-2 richtext-min-h-6 richtext-px-0.5 richtext-text-xs richtext-leading-5 richtext-text-muted-foreground'>
            {resolved ? (
              <div className='richtext-flex richtext-items-center richtext-gap-2'>
                <EmbedLogo service={resolved.service} />
                <span className='richtext-font-medium richtext-text-foreground'>
                  {resolved.service.name}
                </span>
                {resolved.service.tips ? <span>— {resolved.service.tips}</span> : null}
              </div>
            ) : originalLink.trim() ? (
              t('editor.iframe.invalid')
            ) : (
              <div className='richtext-grid richtext-grid-cols-1 richtext-gap-x-6 richtext-gap-y-1.5 sm:richtext-grid-cols-2'>
                {EMBED_KINDS.map(({ kind }) => (
                  <div className='richtext-flex richtext-items-center richtext-gap-1.5' key={kind}>
                    <span className='richtext-w-14 richtext-shrink-0 richtext-text-[11px] richtext-uppercase richtext-tracking-wide richtext-text-muted-foreground/80'>
                      {t(`editor.iframe.kind.${kind}`)}
                    </span>
                    {servicesOfKind(kind).map((service) => (
                      <span className='richtext-flex' key={service.key} title={service.name}>
                        <EmbedLogo service={service} />
                      </span>
                    ))}
                  </div>
                ))}
              </div>
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
