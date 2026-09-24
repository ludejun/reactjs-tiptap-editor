import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { BRAND_LOGOS, isLightColor, monogramOf } from '@/extensions/Iframe/logos';
import { cn } from '@/lib/utils';

import type { EmbedService } from '@/extensions/Iframe/embeds';

export interface EmbedLogoProps {
  service: Pick<EmbedService, 'key' | 'name' | 'color'>;
  className?: string;
  /** Show the service name on hover. */
  tooltip?: boolean;
}

/** A service's brand mark (SVG or favicon), or a monogram on its brand colour when there is none. */
export function EmbedLogo({ service, className, tooltip }: EmbedLogoProps) {
  const markup = BRAND_LOGOS[service.key];
  const mark = markup ? (
    <span
      aria-label={service.name}
      className={cn(
        'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-overflow-hidden richtext-rounded-[5px] richtext-leading-none [&>img]:richtext-size-full [&>img]:richtext-object-contain [&>svg]:richtext-size-full',
        className
      )}
      dangerouslySetInnerHTML={{ __html: markup }}
      role='img'
    />
  ) : (
    <span
      aria-label={service.name}
      className={cn(
        'richtext-inline-flex richtext-size-5 richtext-shrink-0 richtext-items-center richtext-justify-center richtext-rounded-[5px] richtext-text-[11px] richtext-font-bold richtext-leading-none',
        className
      )}
      role='img'
      style={{ background: service.color, color: isLightColor(service.color) ? '#1f2937' : '#fff' }}
    >
      {monogramOf(service.name)}
    </span>
  );

  if (!tooltip) return mark;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{mark}</TooltipTrigger>
      <TooltipContent>{service.name}</TooltipContent>
    </Tooltip>
  );
}
