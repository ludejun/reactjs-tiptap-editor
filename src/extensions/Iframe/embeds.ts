/**
 * Embeddable services: how to recognise a share link and turn it into the URL
 * an <iframe> can show. Framework-free; the React and Vue node views, the Vue
 * toolbar prompt and the slash menu all resolve links through `resolveEmbed`.
 */

export type EmbedKind =
  | 'video'
  | 'audio'
  | 'map'
  | 'design'
  | 'board'
  | 'code'
  | 'document'
  | 'form'
  | 'other';

export interface EmbedService {
  key: string;
  /** Shown to the reader ("YouTube", "Google Sheets"). */
  name: string;
  kind: EmbedKind;
  /** Tested against the normalised link; the first service whose pattern matches wins. */
  match: RegExp;
  /** The iframe `src` for a matched link. */
  src: (match: RegExpExecArray, url: string) => string;
  /** A link a reader might paste. */
  example: string;
  /** Frame height at the default 600px width; falls back to the kind's default. */
  height?: number;
  /** Where to find an embeddable link when the plain share link will not do. */
  tips?: string;
}

const DEFAULT_HEIGHT: Record<EmbedKind, number> = {
  video: 338, // 16:9 at 600px
  audio: 166,
  map: 400,
  design: 450,
  board: 500,
  code: 400,
  document: 480,
  form: 560,
  other: 300,
};

const passthrough = (match: RegExpExecArray) => match[0];

/** Adds a query parameter, whatever the link already carries. */
function withQuery(url: string, query: string) {
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

export const EMBED_SERVICES: EmbedService[] = [
  // Video
  {
    key: 'youtube',
    name: 'YouTube',
    kind: 'video',
    match:
      /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/,
    src: (m) => `https://www.youtube.com/embed/${m[1]}`,
    example: 'https://www.youtube.com/watch?v=I4sMhHbHYXM',
  },
  {
    key: 'vimeo',
    name: 'Vimeo',
    kind: 'video',
    match: /vimeo\.com\/(?:video\/)?(\d+)/,
    src: (m) => `https://player.vimeo.com/video/${m[1]}`,
    example: 'https://vimeo.com/76979871',
  },
  {
    key: 'bilibili',
    name: 'Bilibili',
    kind: 'video',
    match: /bilibili\.com\/video\/(BV\w+|av\d+)/,
    src: (m) =>
      m[1].startsWith('av')
        ? `https://player.bilibili.com/player.html?aid=${m[1].slice(2)}&autoplay=0`
        : `https://player.bilibili.com/player.html?bvid=${m[1]}&autoplay=0`,
    example: 'https://www.bilibili.com/video/BV1EJ411u7DN',
  },
  {
    key: 'youku',
    name: 'Youku',
    kind: 'video',
    match: /v\.youku\.com\/v_show\/id_([\w=]+)/,
    src: (m) => `https://player.youku.com/embed/${m[1]}`,
    example: 'https://v.youku.com/v_show/id_XNDM0NDM4MTcy.html',
  },
  {
    key: 'qqvideo',
    name: 'Tencent Video',
    kind: 'video',
    match: /v\.qq\.com\/x\/(?:cover\/\w+\/|page\/)(\w+)\.html/,
    src: (m) => `https://v.qq.com/txp/iframe/player.html?vid=${m[1]}`,
    example: 'https://v.qq.com/x/cover/mzc0020006aw1mn/u0033nvzb5v.html',
  },
  {
    key: 'loom',
    name: 'Loom',
    kind: 'video',
    match: /loom\.com\/(?:share|embed)\/([a-f0-9]{32})/,
    src: (m) => `https://www.loom.com/embed/${m[1]}`,
    example: 'https://www.loom.com/share/0281766fa2d04bb788eaf19e65135184',
  },
  // Audio
  {
    key: 'spotify',
    name: 'Spotify',
    kind: 'audio',
    match: /open\.spotify\.com\/(?:intl-\w+\/)?(track|album|playlist|episode|show|artist)\/(\w+)/,
    src: (m) => `https://open.spotify.com/embed/${m[1]}/${m[2]}`,
    example: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT',
    height: 352,
  },
  {
    key: 'soundcloud',
    name: 'SoundCloud',
    kind: 'audio',
    match: /^https?:\/\/(?:www\.|on\.)?soundcloud\.com\/[\w-]+(?:\/(?:sets\/)?[\w-]+)?/,
    src: (m) => `https://w.soundcloud.com/player/?url=${encodeURIComponent(m[0])}&visual=true`,
    example: 'https://soundcloud.com/forss/flickermood',
  },
  // Maps
  {
    key: 'googlemaps',
    name: 'Google Maps',
    kind: 'map',
    match: /(?:google\.[a-z.]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)/,
    src: (_m, url) => {
      if (/\/maps\/embed/.test(url)) return url;
      const place = /\/maps\/(?:place|search)\/([^/@?]+)/.exec(url)?.[1];
      const query = /[?&]q=([^&]+)/.exec(url)?.[1];
      const where = place ?? query;
      return where
        ? `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(where.replace(/\+/g, ' ')))}&output=embed`
        : url;
    },
    example: 'https://www.google.com/maps/place/Eiffel+Tower',
    tips: 'Short share links cannot be embedded: use Share → Embed a map and paste the code.',
  },
  {
    key: 'amap',
    name: 'AMap',
    kind: 'map',
    match: /^https?:\/\/(?:\w+\.)?amap\.com\/\S*/,
    src: passthrough,
    example: 'https://www.amap.com/place/B000A45467',
  },
  {
    key: 'baidu_map',
    name: 'Baidu Maps',
    kind: 'map',
    match: /^https?:\/\/(?:\w+\.)?map\.baidu\.com\/\S*/,
    src: passthrough,
    example: 'https://j.map.baidu.com/15/fo',
  },
  // Design and whiteboards
  {
    key: 'figma',
    name: 'Figma',
    kind: 'design',
    match:
      /^https?:\/\/(?:www\.)?figma\.com\/(?:file|design|proto|board|slides|deck)\/[\w-]+[^\s]*/,
    src: (m) => `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(m[0])}`,
    example: 'https://www.figma.com/design/aS9uSgPXoNpaPkzbjNcK8v/Demo?node-id=0-1',
  },
  {
    key: 'canva',
    name: 'Canva',
    kind: 'design',
    match: /^https?:\/\/(?:www\.)?canva\.(?:com|cn)\/design\/[\w-]+\/(?:[\w-]+\/)?view/,
    src: (m) => `${m[0]}?embed`,
    example: 'https://www.canva.com/design/DAD61-t29UI/view',
    tips: 'The design has to be shared with "Anyone with the link" for Canva to allow embedding.',
  },
  {
    key: 'miro',
    name: 'Miro',
    kind: 'board',
    match: /miro\.com\/app\/(?:board|live-embed)\/([\w=-]+)/,
    src: (m) => `https://miro.com/app/live-embed/${m[1]}/`,
    example: 'https://miro.com/app/board/uXjVOZ8r4Yk=/',
  },
  {
    key: 'whimsical',
    name: 'Whimsical',
    kind: 'board',
    match: /whimsical\.com\/(?:embed\/)?(?:[\w-]+-)?([A-Za-z0-9]{20,})/,
    src: (m) => `https://whimsical.com/embed/${m[1]}`,
    example: 'https://whimsical.com/flowchart-basics-EnMCqCBymFCwDuEUEA4hRk',
  },
  {
    key: 'excalidraw',
    name: 'Excalidraw',
    kind: 'board',
    match: /^https?:\/\/excalidraw\.com\/#(?:json|room)=\S+/,
    src: passthrough,
    example: 'https://excalidraw.com/#json=abc123,def456',
  },
  {
    key: 'dbdiagram',
    name: 'dbdiagram',
    kind: 'design',
    match: /dbdiagram\.io\/(?:d|embed)\/([\w-]+)/,
    src: (m) => `https://dbdiagram.io/embed/${m[1]}`,
    example: 'https://dbdiagram.io/d/5f9d0a3e3a78976d7b7a3a1e',
  },
  {
    key: 'processon',
    name: 'ProcessOn',
    kind: 'design',
    match: /^https?:\/\/(?:www\.)?processon\.com\/(?:embed|view\/link)\/\w+/,
    src: (m) => m[0].replace('/view/link/', '/embed/'),
    example: 'https://www.processon.com/embed/5ea99d8607912948b0e6fe78',
  },
  {
    key: 'modao',
    name: 'Modao',
    kind: 'design',
    match: /^https?:\/\/\w+\.modao\.cc\/app\/\w+\/embed\/v2/,
    src: passthrough,
    example: 'https://free.modao.cc/app/6UkpAxcGE3nPz52GLqhnOZgC7MATBSy/embed/v2',
    tips: 'Modao → More → Share → Embed → copy the link.',
  },
  {
    key: 'lanhu',
    name: 'Lanhu',
    kind: 'design',
    match: /^https?:\/\/lanhuapp\.com\/url\/\w+/,
    src: passthrough,
    example: 'https://lanhuapp.com/url/evP7L',
    tips: 'Lanhu → Project → Share → copy the link.',
  },
  {
    key: 'framer',
    name: 'Framer',
    kind: 'design',
    match: /^https?:\/\/[\w-]+\.framer\.(?:website|app|ai|wiki)\S*/,
    src: passthrough,
    example: 'https://example.framer.website/',
  },
  // Code
  {
    key: 'codepen',
    name: 'CodePen',
    kind: 'code',
    match: /codepen\.io\/([\w-]+)\/(?:pen|embed|full|details)\/([\w-]+)/,
    src: (m) => `https://codepen.io/${m[1]}/embed/${m[2]}?default-tab=result`,
    example: 'https://codepen.io/mekery/pen/YzyrKOJ',
  },
  {
    key: 'codesandbox',
    name: 'CodeSandbox',
    kind: 'code',
    match: /codesandbox\.io\/(?:s|embed|p\/sandbox|p\/devbox)\/([\w-]+)/,
    src: (m) => `https://codesandbox.io/embed/${m[1]}?view=preview`,
    example: 'https://codesandbox.io/s/new',
  },
  {
    key: 'stackblitz',
    name: 'StackBlitz',
    kind: 'code',
    match: /^https?:\/\/stackblitz\.com\/(?:edit|github|fork)\/[\w./-]+(?:\?[^\s#]*)?/,
    src: (m) => withQuery(m[0], 'embed=1'),
    example: 'https://stackblitz.com/edit/vitejs-vite-abc123',
  },
  {
    key: 'jsfiddle',
    name: 'JSFiddle',
    kind: 'code',
    match: /^https?:\/\/jsfiddle\.net\/(?:[\w-]+\/)?\w+(?:\/\d+)?/,
    src: (m) => `${m[0].replace(/\/embedded.*$/, '').replace(/\/$/, '')}/embedded/`,
    example: 'https://jsfiddle.net/user/abc123/',
  },
  {
    key: 'gist',
    name: 'GitHub Gist',
    kind: 'code',
    match: /gist\.github\.com\/([\w-]+)\/([a-f0-9]+)/,
    src: (m) => `https://gist.github.com/${m[1]}/${m[2]}.pibb`,
    example: 'https://gist.github.com/octocat/6cad326836d38bd3a7ae',
  },
  // Documents and data
  {
    key: 'gdocs',
    name: 'Google Docs',
    kind: 'document',
    match: /docs\.google\.com\/document\/d\/([\w-]+)/,
    src: (m) => `https://docs.google.com/document/d/${m[1]}/preview`,
    example: 'https://docs.google.com/document/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit',
  },
  {
    key: 'gsheets',
    name: 'Google Sheets',
    kind: 'document',
    match: /docs\.google\.com\/spreadsheets\/d\/([\w-]+)/,
    src: (m) => `https://docs.google.com/spreadsheets/d/${m[1]}/preview`,
    example: 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit',
  },
  {
    key: 'gslides',
    name: 'Google Slides',
    kind: 'document',
    match: /docs\.google\.com\/presentation\/d\/([\w-]+)/,
    src: (m) => `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false`,
    example: 'https://docs.google.com/presentation/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit',
    height: 360,
  },
  {
    key: 'airtable',
    name: 'Airtable',
    kind: 'document',
    match: /airtable\.com\/(?:embed\/)?(?:app\w+\/)?(shr\w+)/,
    src: (m) => `https://airtable.com/embed/${m[1]}`,
    example: 'https://airtable.com/shrXXXXXXXXXXXXXX',
  },
  {
    key: 'trello',
    name: 'Trello',
    kind: 'board',
    match: /trello\.com\/b\/(\w+)/,
    src: (m) => `https://trello.com/b/${m[1]}.html`,
    example: 'https://trello.com/b/AbCdEfGh/roadmap',
  },
  {
    key: 'clickup',
    name: 'ClickUp',
    kind: 'board',
    match: /^https?:\/\/sharing\.clickup\.com\/\S+/,
    src: passthrough,
    example: 'https://sharing.clickup.com/1234/l/h/abcde-1/0123456789abcdef',
  },
  {
    key: 'descript',
    name: 'Descript',
    kind: 'video',
    match: /share\.descript\.com\/(?:view|embed)\/(\w+)/,
    src: (m) => `https://share.descript.com/embed/${m[1]}`,
    example: 'https://share.descript.com/view/AbCdEfGhIjK',
  },
  // Forms
  {
    key: 'gforms',
    name: 'Google Forms',
    kind: 'form',
    match: /docs\.google\.com\/forms\/d\/(e\/)?([\w-]+)/,
    src: (m) =>
      m[1]
        ? `https://docs.google.com/forms/d/e/${m[2]}/viewform?embedded=true`
        : `https://docs.google.com/forms/d/${m[2]}/viewform?embedded=true`,
    example: 'https://docs.google.com/forms/d/e/1FAIpQLSdAbCdEfGhIjKlMnOpQrStUvWxYz/viewform',
  },
  {
    key: 'typeform',
    name: 'Typeform',
    kind: 'form',
    match: /^https?:\/\/[\w-]+\.typeform\.com\/to\/[\w-]+/,
    src: passthrough,
    example: 'https://form.typeform.com/to/AbCdEfGh',
  },
  {
    key: 'jinshuju',
    name: 'Jinshuju',
    kind: 'form',
    match: /^https?:\/\/jinshuju\.net\/f\/\w+/,
    src: (m) => `${m[0]}?background=white&banner=show&embedded=true`,
    example: 'https://jinshuju.net/f/q9YvVf',
  },
];

/** Any other http(s) page, shown as it is; the site decides whether it allows framing. */
export const GENERIC_EMBED: EmbedService = {
  key: 'iframe',
  name: 'Web page',
  kind: 'other',
  match: /^https?:\/\/\S+/,
  src: passthrough,
  example: 'https://example.com/',
};

export interface EmbedResolution {
  service: EmbedService;
  /** The iframe `src`. */
  src: string;
  /** Height that suits the service at the default 600px width. */
  height: number;
  /** The link as the reader pasted it (or the `src` of a pasted `<iframe>`). */
  url: string;
}

/**
 * Turns what the reader pasted into an embed. Accepts a share link with or
 * without protocol, or a whole `<iframe …>` snippet copied from a service's
 * "Embed" dialog (its `src` is used). Returns null for anything that is not
 * a link.
 */
/** A parseable URL whose host has a dot (or is localhost): "not a link" with `https://` in front is not one. */
function looksLikeUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || /^[\w-]+(\.[\w-]+)+$/.test(hostname);
  } catch {
    return false;
  }
}

export function resolveEmbed(input: string): EmbedResolution | null {
  let url = input.trim();

  if (!url) return null;

  const snippet = /<iframe[^>]*\ssrc=["']([^"']+)["']/i.exec(url);
  if (snippet) url = snippet[1];

  if (url.startsWith('//')) url = `https:${url}`;
  else if (!/^[a-z][\w+.-]*:/i.test(url)) url = `https://${url}`;

  if (!/^https?:\/\//i.test(url) || !looksLikeUrl(url)) return null;

  const service = EMBED_SERVICES.find((item) => item.match.test(url)) ?? GENERIC_EMBED;
  const match = service.match.exec(url);

  if (!match) return null;

  return {
    service,
    src: service.src(match, url),
    height: service.height ?? DEFAULT_HEIGHT[service.kind],
    url,
  };
}

/** The service a link belongs to, or null for a plain page. */
export function embedServiceOf(url: string): EmbedService | null {
  const resolved = resolveEmbed(url);
  return resolved && resolved.service !== GENERIC_EMBED ? resolved.service : null;
}
