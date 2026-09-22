import { detectLanguage as rangiDetectLanguage } from 'rangi';

/**
 * Language guessing for code blocks.
 *
 * Rangi ships a detector, but it only recognises a handful of languages and
 * misses the common ones (JavaScript, TypeScript, Python and CSS all come back
 * as `plain`, Rust comes back as `swift`). This runs a small signature pass
 * first and falls back to Rangi for whatever it does not recognise.
 */

/** Only the head of a block is inspected, so huge blocks stay cheap. */
const SAMPLE_LENGTH = 4000;

/** A guess needs at least this much evidence before it beats "no idea". */
const MIN_SCORE = 3;

interface Signature {
  lang: string;
  patterns: [RegExp, number][];
}

const SIGNATURES: Signature[] = [
  {
    lang: 'php',
    patterns: [
      [/<\?php/, 10],
      [/\$[a-z_]\w*\s*=/i, 2],
      [/->\w+\(/, 1],
    ],
  },
  {
    lang: 'py',
    patterns: [
      [/^\s*def\s+\w+\s*\(.*\)\s*(->[^:]+)?:/m, 5],
      [/^\s*(from\s+[\w.]+\s+)?import\s+\w+/m, 3],
      [/^\s*class\s+\w+(\(.*\))?:/m, 4],
      [/\bself\b/, 2],
      [/\bprint\(/, 2],
      [/\bTrue\b|\bFalse\b|\bNone\b/, 2],
      [/\bf'|\bf"/, 2],
      [/\belif\b/, 3],
    ],
  },
  {
    lang: 'ts',
    patterns: [
      [/^\s*interface\s+\w+\s*\{/m, 5],
      [/^\s*type\s+\w+\s*=/m, 4],
      [/:\s*(string|number|boolean|void|unknown|any)\b/, 3],
      [/^\s*enum\s+\w+/m, 4],
      [/\bimplements\b/, 2],
      [/\bas\s+(const|\w+)\b/, 1],
    ],
  },
  {
    lang: 'js',
    patterns: [
      [/\b(const|let)\s+\w+\s*=/, 3],
      [/=>\s*[{(]/, 2],
      [/\bfunction\s*\*?\s*\w*\s*\(/, 2],
      [/\bconsole\.(log|warn|error)\(/, 3],
      [/\b(require|module\.exports)\b/, 2],
      [/^\s*(export|import)\s+/m, 2],
      [/\bdocument\.|window\./, 2],
    ],
  },
  {
    lang: 'go',
    patterns: [
      [/^\s*package\s+\w+/m, 5],
      [/^\s*func\s+(\(\w+\s+\*?\w+\)\s*)?\w*\s*\(/m, 4],
      [/:=/, 3],
      [/\bfmt\.\w+\(/, 3],
    ],
  },
  {
    lang: 'rs',
    patterns: [
      [/^\s*fn\s+\w+\s*\(/m, 5],
      [/\blet\s+mut\b/, 4],
      [/\b\w+!\s*\(/, 2],
      [/\bimpl\b|\bpub\s+fn\b|\buse\s+\w+::/, 3],
      [/->\s*(i32|u32|usize|String|bool)\b/, 3],
    ],
  },
  {
    lang: 'java',
    patterns: [
      [/\b(public|private|protected)\s+(static\s+)?(final\s+)?(class|void|int|String)\b/, 5],
      [/\bSystem\.out\.print/, 5],
      [/^\s*package\s+[\w.]+;/m, 3],
      [/^\s*import\s+java\./m, 4],
    ],
  },
  {
    lang: 'cs',
    patterns: [
      [/^\s*using\s+System(\.|;)/m, 6],
      [/\bnamespace\s+[\w.]+/, 4],
      [/\bConsole\.Write/, 5],
      [/\bpublic\s+(static\s+)?(void|class)\b/, 2],
    ],
  },
  {
    lang: 'rb',
    patterns: [
      [/^\s*def\s+\w+.*\n[\s\S]*^\s*end\s*$/m, 5],
      [/\bputs\s+/, 4],
      [/\bdo\s*\|\w+/, 4],
      [/\brequire\s+'[^']+'/, 3],
      [/\bnil\b|\b@\w+/, 2],
    ],
  },
  {
    lang: 'swift',
    patterns: [
      [/\bfunc\s+\w+\s*\(/, 3],
      [/\b(var|let)\s+\w+\s*:\s*\w+/, 3],
      [/\bprint\(/, 1],
      [/\bguard\s+let\b|\bif\s+let\b/, 4],
      [/@IBOutlet|@State|\bUIKit\b|\bSwiftUI\b/, 5],
    ],
  },
  {
    lang: 'kt',
    patterns: [
      [/\bfun\s+\w+\s*\(/, 5],
      [/\bval\s+\w+|\bvar\s+\w+\s*:/, 2],
      [/\bprintln\(/, 2],
      [/\bcompanion\s+object\b|\bdata\s+class\b/, 5],
    ],
  },
  {
    lang: 'sql',
    patterns: [
      [/\bSELECT\b[\s\S]*\bFROM\b/i, 6],
      [/\b(INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/i, 6],
      [/\bCREATE\s+(TABLE|INDEX|VIEW)\b/i, 6],
    ],
  },
  {
    lang: 'bash',
    patterns: [
      [/^#!.*\b(ba|z|k)?sh\b/m, 8],
      [/^\s*(echo|export|source|sudo|apt|brew|npm|pnpm|yarn|git|cd|mkdir|rm)\s+/m, 3],
      [/\$\(|\$\{?\w+\}?/, 1],
      [/^\s*(if|for|while)\b.*;\s*(then|do)\b/m, 4],
    ],
  },
  {
    lang: 'docker',
    patterns: [
      [/^\s*FROM\s+\S+/m, 6],
      [/^\s*(RUN|CMD|COPY|ADD|ENTRYPOINT|WORKDIR|EXPOSE|ENV)\s+/m, 4],
    ],
  },
  {
    lang: 'yaml',
    patterns: [
      [/^---\s*$/m, 4],
      [/^\s*[\w.-]+:\s*($|[^:/])/m, 2],
      [/^\s*-\s+[\w.-]+:\s/m, 3],
    ],
  },
  {
    lang: 'css',
    patterns: [
      [/^\s*[.#]?[\w-]+(\s*[,>+~]\s*[\w.#:-]+)*\s*\{[^}]*:[^}]*\}/m, 5],
      [/@(media|import|keyframes|font-face)\b/, 4],
      [/[\w-]+\s*:\s*[^;{}]+;/, 2],
    ],
  },
  {
    lang: 'scss',
    patterns: [
      [/^\s*\$[\w-]+\s*:/m, 5],
      [/@(mixin|include|extend|use)\b/, 5],
      [/&[.:&\w-]/, 3],
    ],
  },
  {
    lang: 'md',
    patterns: [
      [/^#{1,6}\s+\S/m, 4],
      [/^\s*[-*]\s+\S/m, 1],
      [/\[[^\]]+\]\([^)]+\)/, 3],
      [/^```/m, 3],
    ],
  },
  {
    lang: 'diff',
    patterns: [
      [/^diff --git /m, 8],
      [/^@@ -\d+/m, 6],
      [/^[+-]{3} /m, 3],
    ],
  },
  {
    lang: 'ini',
    patterns: [
      [/^\s*\[[\w.-]+\]\s*$/m, 5],
      [/^\s*[\w.-]+\s*=\s*\S+/m, 2],
    ],
  },
];

function isJson(sample: string): boolean {
  const trimmed = sample.trim();

  if (!/^[[{]/.test(trimmed) || !/[\]}]$/.test(trimmed)) {
    return false;
  }

  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
}

function looksLikeMarkup(sample: string): 'html' | 'xml' | null {
  const trimmed = sample.trim();

  if (!trimmed.startsWith('<')) {
    return null;
  }

  if (/^<\?xml|<\/\w+:\w+>/.test(trimmed)) {
    return 'xml';
  }

  return /<\/?(html|head|body|div|span|p|a|ul|li|table|script|style|h[1-6])\b/i.test(trimmed)
    ? 'html'
    : 'xml';
}

/**
 * Best guess at the language of a block of code, as a Rangi language id.
 * Returns `plain` when nothing looks convincing.
 */
export function guessLanguage(code: string): string {
  const sample = code.slice(0, SAMPLE_LENGTH);

  if (!sample.trim()) {
    return 'plain';
  }

  if (isJson(sample)) {
    return 'json';
  }

  const markup = looksLikeMarkup(sample);
  if (markup) {
    return markup;
  }

  let best = { lang: 'plain', score: 0 };

  for (const { lang, patterns } of SIGNATURES) {
    let score = 0;

    for (const [pattern, weight] of patterns) {
      if (pattern.test(sample)) {
        score += weight;
      }
    }

    if (score > best.score) {
      best = { lang, score };
    }
  }

  if (best.score >= MIN_SCORE) {
    return best.lang;
  }

  try {
    return rangiDetectLanguage(sample) || 'plain';
  } catch {
    return 'plain';
  }
}
