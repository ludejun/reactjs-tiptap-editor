import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * Icons are resolved by name (`icon: 'Table'`, `iconName`, `<IconComponent
 * name>`) from a registry that starts almost empty; every icon is added with
 * `registerIcons` by the module that needs it. This walks
 * the source module graph from each public entry and checks that every icon
 * name used somewhere in that graph is registered somewhere in the same graph
 * — so importing a feature always brings its icons along.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const src = path.join(root, 'src');

const SKIP_DIRS = [
  path.join(src, 'vue'), // Vue passes icon components, not names
  path.join(src, 'extensions', 'AI'), // the AI dock has its own icon map
];

/** Icon-looking strings that are labels/values, never resolved through the registry. */
const IGNORED_NAMES = {
  'src/extensions/Callout/components/RichTextCallout.tsx': [
    'Info',
    'Lightbulb',
    'AlertCircle',
    'TriangleAlert',
    'OctagonAlert',
  ],
  'src/components/Bubble/RichTextBubbleCallout.tsx': [
    'Info',
    'Lightbulb',
    'AlertCircle',
    'TriangleAlert',
    'OctagonAlert',
  ],
};

const HEADINGS = ['Paragraph', 1, 2, 3, 4, 5, 6];

function listFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(file, out);
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) out.push(file);
  }
  return out;
}

function resolveSpecifier(spec, from) {
  let base;
  if (spec.startsWith('@/')) base = path.join(src, spec.slice(2));
  else if (spec.startsWith('.')) base = path.resolve(path.dirname(from), spec);
  else return null;
  if (/\.(s?css|svg|json|md)$/.test(base)) return null;
  for (const candidate of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Runtime imports only: `import type` and type-position dynamic imports carry no code. */
function dependencies(file) {
  const source = fs.readFileSync(file, 'utf8');
  const specs = new Set();
  for (const re of [
    /\bimport\s+(?!type\s)[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /\bexport\s+(?!type\s)[^;'"]*?\bfrom\s*['"]([^'"]+)['"]/g,
    /\bimport\s*['"]([^'"]+)['"]/g,
    /\bimport\(\s*['"]([^'"]+)['"]\s*\)/g,
  ]) {
    for (const match of source.matchAll(re)) specs.add(match[1]);
  }
  return [...specs].map((spec) => resolveSpecifier(spec, file)).filter(Boolean);
}

function reachable(entry) {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    queue.push(...dependencies(file));
  }
  return seen;
}

const objectKeys = (body) =>
  body
    .replace(/\/\/.*$/gm, '')
    .split(',')
    .map((part) => part.split(':')[0].trim())
    .filter((key) => /^[A-Za-z_$][\w$]*$/.test(key));

/** Names a module resolves through the registry. */
function usedIconNames(file) {
  const rel = path.relative(root, file);
  if (SKIP_DIRS.some((dir) => file.startsWith(dir))) return [];
  const source = fs.readFileSync(file, 'utf8');
  const names = new Set();
  const patterns = [
    /\b(?:icon|iconName)\s*[:=]\s*\{?\s*['"]([A-Z][A-Za-z0-9]*)['"]/g,
    /<IconComponent\b[^>]*?\bname=['"]([A-Z][A-Za-z0-9]*)['"]/gs,
    /\bicon=\{[^}]*?['"]([A-Z][A-Za-z0-9]*)['"]/g,
  ];
  for (const re of patterns) for (const match of source.matchAll(re)) names.add(match[1]);
  // `iconMap = { left: 'AlignLeft', … }` and `icons: … = ['SizeS', …]`
  for (const re of [/\biconMap\b[^=]*=\s*\{([^}]*)\}/gs, /\bicons\s*:[^=]*=\s*\[([^\]]*)\]/gs]) {
    for (const match of source.matchAll(re)) {
      for (const literal of match[1].matchAll(/['"]([A-Z][A-Za-z0-9]*)['"]/g))
        names.add(literal[1]);
    }
  }
  if (source.includes('`Heading${level}`')) {
    for (const level of HEADINGS) names.add(`Heading${level}`);
  }
  for (const ignored of IGNORED_NAMES[rel] ?? []) names.delete(ignored);
  return [...names];
}

/** Names a module adds with `registerIcons({ … })`. */
function registeredIconNames(file) {
  const source = fs.readFileSync(file, 'utf8');
  const names = [];
  for (const match of source.matchAll(/\bregisterIcons\(\s*\{([\s\S]*?)\}\s*\)/g)) {
    names.push(...objectKeys(match[1]));
  }
  return names;
}

const iconsModule = path.join(src, 'components', 'icons', 'icons.ts');
const baseIcons = objectKeys(
  fs.readFileSync(iconsModule, 'utf8').match(/export const icons[^=]*=\s*\{([\s\S]*?)\n\};/)[1]
);

const entries = [
  path.join(src, 'index.ts'),
  path.join(src, 'bubble.ts'),
  ...fs
    .readdirSync(path.join(src, 'extensions'))
    .map((name) => path.join(src, 'extensions', name, 'index.ts'))
    .filter((file) => fs.existsSync(file)),
  ...listFiles(path.join(src, 'components', 'Bubble')).filter((file) =>
    /RichText[^/]*\.tsx$/.test(file)
  ),
];

test('the base registry holds no Lucide icons', () => {
  assert.ok(baseIcons.includes('MenuDown'), 'parsed the base icon map');
  assert.doesNotMatch(fs.readFileSync(iconsModule, 'utf8'), /from\s*['"]lucide-react['"]/);
});

test('the source scan finds the icon names', () => {
  const all = new Set(listFiles(src).flatMap(usedIconNames));
  for (const expected of ['Bold', 'Table', 'Trash2', 'Heading1', 'AlignLeft', 'SizeS', 'Loader']) {
    assert.ok(all.has(expected), `scan finds '${expected}'`);
  }
});

for (const entry of entries) {
  test(`${path.relative(root, entry)}: every icon it names is registered in its own graph`, () => {
    const files = reachable(entry);
    const registered = new Set(baseIcons);
    for (const file of files) for (const name of registeredIconNames(file)) registered.add(name);
    const missing = [];
    for (const file of files) {
      // A name inside `src/extensions/<X>/` belongs to feature X: it is only
      // rendered once X's own entry (extension + controls) is imported. Reaching
      // `<X>.ts` alone (a node spec, a dialog) draws none of X's buttons.
      const feature = path.relative(path.join(src, 'extensions'), file).split(path.sep)[0];
      if (
        file.startsWith(path.join(src, 'extensions')) &&
        !files.has(path.join(src, 'extensions', feature, 'index.ts'))
      ) {
        continue;
      }
      for (const name of usedIconNames(file)) {
        if (!registered.has(name)) missing.push(`'${name}' in ${path.relative(root, file)}`);
      }
    }
    assert.deepEqual(
      missing,
      [],
      `unregistered icon names reachable from ${path.relative(root, entry)}`
    );
  });
}
