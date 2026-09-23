/**
 * Every name the docs and READMEs import from `ai-sparkwrite-editor*` must
 * exist in the built entry it names. Collects the imports out of every code
 * fence, writes one import line per name, and type-checks that file against
 * `lib/`. Run after `pnpm build:lib`.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { globbySync } from 'globby';

const root = path.resolve(import.meta.dirname, '..');
const IMPORT = /import (type )?\{([^}]*)\} from '(ai-sparkwrite-editor(?:\/[\w./-]+)?)';/gs;
const FENCE = /```[a-zA-Z]*(?: \[[^\]]*\])?\n(.*?)\n```/gs;

const files = [
  ...globbySync('docs/**/*.md', {
    cwd: root,
    ignore: ['**/node_modules/**', 'docs/.vitepress/**'],
  }),
  'README.md',
  'README.zh-CN.md',
];
const names = new Map(); // entry -> Set(name)
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  for (const fence of text.matchAll(FENCE)) {
    for (const m of fence[1].matchAll(IMPORT)) {
      if (m[3].endsWith('.css')) continue;
      const body = m[2].replace(/\/\/[^\n]*/g, '');
      for (const raw of body.split(',')) {
        const name = raw
          .trim()
          .replace(/^type /, '')
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) (names.get(m[3]) ?? names.set(m[3], new Set()).get(m[3])).add(name);
      }
    }
  }
}

const out = path.join(root, 'node_modules/.cache/check-doc-imports');
fs.mkdirSync(out, { recursive: true });
const lines = [];
for (const [entry, set] of [...names].sort()) {
  for (const name of [...set].sort()) {
    lines.push(`import { ${name} as ${entry.replace(/\W/g, '_')}__${name} } from '${entry}';`);
  }
}
fs.writeFileSync(path.join(out, 'imports.ts'), lines.join('\n') + '\n');
fs.writeFileSync(
  path.join(out, 'tsconfig.json'),
  JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
      types: [],
      baseUrl: root,
      paths: {
        'ai-sparkwrite-editor': ['lib/index.d.ts'],
        'ai-sparkwrite-editor/vue': ['lib/vue/index.d.ts'],
        'ai-sparkwrite-editor/core': ['lib/core.d.ts'],
        'ai-sparkwrite-editor/locale': ['lib/locale.d.ts'],
        'ai-sparkwrite-editor/locale-bundle': ['lib/locale-bundle.d.ts'],
        'ai-sparkwrite-editor/theme': ['lib/theme/theme.d.ts'],
        'ai-sparkwrite-editor/locales/*': ['lib/locales/*.d.ts'],
        'ai-sparkwrite-editor/*': ['lib/*/index.d.ts'],
      },
    },
    files: ['imports.ts'],
  })
);
try {
  execFileSync('pnpm', ['exec', 'tsc', '-p', path.join(out, 'tsconfig.json')], {
    cwd: root,
    stdio: 'inherit',
  });
  console.log(`${lines.length} documented imports across ${names.size} entries resolve.`);
} catch {
  console.error('Some documented imports do not exist in the built entries (see above).');
  process.exit(1);
}
