import fs from 'node:fs';
import path from 'node:path';

const lib = path.resolve('lib');
const specs = (f) =>
  [
    ...fs
      .readFileSync(f, 'utf8')
      .matchAll(/from\s*["']([^"']+)["']|import\(["']([^"']+)["']\)|require\(["']([^"']+)["']\)/g),
  ].map((m) => m[1] ?? m[2] ?? m[3]);

function reach(entry) {
  const seen = new Map();
  const ext = new Set();
  const q = [entry];
  while (q.length) {
    const f = q.pop();
    if (seen.has(f) || !fs.existsSync(f)) continue;
    seen.set(f, fs.statSync(f).size);
    for (const s of specs(f)) {
      if (s.startsWith('.')) q.push(path.resolve(path.dirname(f), s));
      else ext.add(s);
    }
  }
  return { seen, ext };
}

function lucideIcons(files) {
  const names = new Set();
  for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/g)) {
      for (const part of m[1].split(',')) {
        const name = part
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) names.add(name);
      }
    }
  }
  return names;
}

const entries =
  process.argv.length > 2
    ? process.argv.slice(2)
    : [
        'index.js',
        'Bold.js',
        'Heading.js',
        'Table.js',
        'Image.js',
        'AI.js',
        'bubble.js',
        'core.js',
        'vue.js',
      ];

for (const e of entries) {
  const { seen, ext } = reach(path.join(lib, e));
  const total = [...seen.values()].reduce((a, b) => a + b, 0);
  const icons = lucideIcons([...seen.keys()]);
  console.log(
    `\n== ${e}: ${(total / 1024).toFixed(0)} KB in ${seen.size} chunks; lucide icons: ${icons.size}; externals: ${[
      ...ext,
    ]
      .filter((x) => !x.startsWith('@tiptap'))
      .sort()
      .join(', ')}`
  );
  for (const [f, s] of [...seen].sort((a, b) => b[1] - a[1]).slice(0, 8))
    console.log(`   ${(s / 1024).toFixed(1).padStart(6)} KB  ${path.basename(f)}`);
}
