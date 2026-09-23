import assert from 'node:assert/strict';
import { test } from 'node:test';

// The Vue entry is React-free, so it can be loaded in Node to exercise the kit's
// option handling; the React kit shares the same builder.
const { RichTextKit } = await import('../lib/vue.js');

function names(options) {
  const kit = RichTextKit.configure(options);
  return kit.config.addExtensions.call({ options: kit.options }).map((e) => e.name);
}

test('the kit registers every default feature once and leaves opt-in features out', () => {
  const list = names({});
  for (const name of [
    'doc',
    'paragraph',
    'text',
    'bold',
    'table',
    'codeBlock',
    'listItem',
    'ai',
    'aiAutocomplete',
  ])
    assert.ok(list.includes(name), `${name} missing`);
  assert.equal(new Set(list).size, list.length, 'no duplicate extension names');
  assert.ok(!list.includes('imageGif'));
  assert.ok(!list.includes('recorder'));
  assert.ok(!list.includes('column'));
});

test('false drops a feature, an object configures it, an object switches an opt-in feature on', () => {
  const kit = RichTextKit.configure({
    bold: false,
    ai: { endpoint: '/api/ai' },
    imageGif: { GIPHY_API_KEY: 'k' },
    column: {},
  });
  const list = kit.config.addExtensions.call({ options: kit.options });
  const byName = Object.fromEntries(list.map((e) => [e.name, e]));
  assert.equal(byName.bold, undefined);
  assert.equal(byName.ai.options.endpoint, '/api/ai');
  assert.equal(byName.imageGif.options.GIPHY_API_KEY, 'k');
  assert.ok(byName.columns && byName.column, 'columns and column nodes registered');
  assert.equal(byName.doc.config.content, '(block|columns)+');
});
