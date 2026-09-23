import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const lib = fileURLToPath(new URL('../lib/', import.meta.url));

/** Every module specifier a built file imports or requires. */
function specifiers(file) {
  const source = fs.readFileSync(file, 'utf8');
  const found = new Set();
  for (const match of source.matchAll(
    /from\s*["']([^"']+)["']|import\(["']([^"']+)["']\)|require\(["']([^"']+)["']\)/g
  )) {
    found.add(match[1] ?? match[2] ?? match[3]);
  }
  return [...found];
}

/** Walks the chunk graph from an entry and lists external packages. */
function externals(entry) {
  const seen = new Set();
  const packages = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of specifiers(file)) {
      if (spec.startsWith('.')) queue.push(path.resolve(path.dirname(file), spec));
      else packages.add(spec);
    }
  }
  return { packages: [...packages].sort(), chunks: seen.size };
}

// Run after pnpm build:lib. The core entry must stay usable from Vue or plain
// ProseMirror, so nothing reachable from it may pull in React.
for (const file of ['core.js', 'core.cjs']) {
  test(`${file} does not depend on React`, () => {
    const { packages, chunks } = externals(path.join(lib, file));
    assert.ok(chunks > 1, 'walked the chunk graph');
    const react = packages.filter((p) =>
      /^(react|react-dom|@tiptap\/react|@radix-ui|lucide-react)(\/|$)/.test(p)
    );
    assert.deepEqual(react, [], `React-bound packages reachable from ${file}`);
    assert.ok(
      packages.some((p) => p.startsWith('@tiptap/')),
      'still a Tiptap bundle'
    );
  });
}
