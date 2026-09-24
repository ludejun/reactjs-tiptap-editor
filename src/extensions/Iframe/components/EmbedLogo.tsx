import { BRAND_LOGOS, isLightColor, monogramOf } from '@/extensions/Iframe/logos';
import { cn } from '@/lib/utils';

import type { EmbedService } from '@/extensions/Iframe/embeds';

export interface EmbedLogoProps {
  service: Pick<EmbedService, 'key' | 'name' | 'color'>;
  className?: string;
}

/** A service's brand mark, or a monogram on its brand colour when there is no mark. */
export function EmbedLogo({ service, className }: EmbedLogoProps) {
  const markup = BRAND_LOGOS[service.key];

  if (markup) {
    return (
      <span
        aria-hidden='true'
        className={cn(
          'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-text-[20px] richtext-leading-none [&>svg]:richtext-size-full',
          className
        )}
        dangerouslySetInnerHTML={{ __html: markup }}
      />
    );
  }

  return (
    <span
      aria-hidden='true'
      className={cn(
        'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-items-center richtext-justify-center richtext-rounded-[5px] richtext-text-[11px] richtext-font-bold richtext-leading-none',
        className
      )}
      style={{ background: service.color, color: isLightColor(service.color) ? '#1f2937' : '#fff' }}
    >
      {monogramOf(service.name)}
    </span>
  );
}
