import { NodeViewWrapper } from '@tiptap/react';
import { Resizable } from 're-resizable';
import { useCallback, useState } from 'react';

import { Button, Input } from '@/components/ui';
import { EMBED_SERVICES, resolveEmbed } from '@/extensions/Iframe/embeds';
import { IframeCore as Iframe } from '@/extensions/Iframe/Iframe';
import { cn } from '@/lib/utils';
import { useLocale } from '@/locales';
import { useEditableEditor } from '@/store/store';

import styles from './index.module.scss';
import type { NodeViewProps } from '@tiptap/react';

/** Names of the recognised services, for the prompt's hint line. */
const SERVICE_NAMES = EMBED_SERVICES.map((service) => service.name).join(' · ');

function IframeNodeView({ editor, node, updateAttributes }: NodeViewProps) {
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
        <div className='richtext-mx-auto richtext-my-[12px] richtext-flex richtext-max-w-[600px] richtext-flex-col richtext-gap-2 richtext-rounded-[12px] richtext-border richtext-border-solid richtext-border-border richtext-p-[10px]'>
          <div className='richtext-flex richtext-items-center richtext-gap-[10px]'>
            <Input
              autoFocus
              className='richtext-flex-1'
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

            <Button className='richtext-w-[60px]' disabled={!resolved} onClick={handleConfirm}>
              OK
            </Button>
          </div>

          <div className='richtext-px-1 richtext-text-xs richtext-leading-5 richtext-text-muted-foreground'>
            {resolved ? (
              <>
                <span className='richtext-font-medium richtext-text-foreground'>
                  {resolved.service.name}
                </span>
                {resolved.service.tips ? ` — ${resolved.service.tips}` : null}
              </>
            ) : originalLink.trim() ? (
              t('editor.iframe.invalid')
            ) : (
              `${t('editor.iframe.supported')}: ${SERVICE_NAMES}`
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
