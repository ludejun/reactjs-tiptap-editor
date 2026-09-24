/**
 * The pre-1.1 helpers, kept for callers that still use them; the registry in
 * `./embeds` is the source of truth.
 */
import { EMBED_SERVICES, GENERIC_EMBED, resolveEmbed } from './embeds';

export * from './embeds';

interface EmbedResult {
  validLink: boolean;
  validId: boolean;
  matchedUrl: string;
  originalLink: string;
  src: string;
}

/** Per-service example, embed `src` and link patterns, keyed by service. */
export const EmbedServiceLink: Record<
  string,
  {
    example: string;
    src: string;
    srcPrefix: string;
    linkRule: (string | RegExp)[];
    idRule?: string;
    tips?: string;
  }
> = Object.fromEntries(
  [...EMBED_SERVICES, GENERIC_EMBED].map((service) => [
    service.key,
    {
      example: service.example,
      src: resolveEmbed(service.example)?.src ?? service.example,
      srcPrefix: '',
      linkRule: [service.match],
      tips: service.tips,
    },
  ])
);

export function getExampleUrl(service: string) {
  return EmbedServiceLink[service]?.example ?? '';
}

/** Resolves a pasted link; `validLink` is false for anything that is not a link. */
export function getServiceSrc(originalLink: string): EmbedResult {
  const resolved = resolveEmbed(originalLink);

  return {
    validLink: !!resolved,
    validId: !!resolved,
    matchedUrl: resolved?.url ?? '',
    originalLink,
    src: resolved?.src ?? '',
  };
}
