# Bundle size

Every feature is its own entry (`ai-sparkwrite-editor/bold`, `/table`, `/image`, `/bubble/table`…), so a host pays for the features it imports. This page lists what an entry costs, what every entry shares, and the two rules that keep it that way.

## What a feature costs

Bytes of the library's own JavaScript (minified, before gzip) reached from one entry, measured over the chunk graph in `lib/` with `pnpm measure:entries`. React, Tiptap, Radix and `lucide-react` are peer/runtime dependencies and are not counted; the locale table (`en`, 14 KB) is, since every control reads its tooltip from it.

| Entry | Before | After | Lucide icons before → after |
|---|---|---|---|
| `ai-sparkwrite-editor/bold` | 88 KB, 16 chunks | **30 KB**, 17 chunks | 87 → 1 |
| `/heading` | 98 KB, 18 chunks | **39 KB**, 19 chunks | 90 → 3 |
| `/table` | 97 KB, 18 chunks | **39 KB**, 19 chunks | 87 → 1 |
| `/image` | 135 KB, 27 chunks | **77 KB**, 29 chunks | 88 → 6 |
| `/ai` | 227 KB, 28 chunks | **169 KB**, 29 chunks | 95 → 15 |
| root (provider + toolbar) | 175 KB, 33 chunks | **124 KB**, 36 chunks | 88 → 6 |
| `/bubble` (every bubble) | 512 KB, 95 chunks | **465 KB**, 106 chunks | 109 → 92 |

`core`/`vue` are not listed: their size is dominated by concurrent work on the framework-free layer, not by anything on this page.

The `lucide` column counts the distinct Lucide icons a bundle imports. Before, every entry imported all ~90 of them; a bundler cannot drop an icon that is looked up by name at runtime from a map holding all of them.

## What every entry shares

The floor under a single control is about 30 KB:

- the `en` locale (14 KB) — the default tooltips, always present so a control renders without configuration;
- `ActionButton` with the tooltip/toggle primitives (about 5 KB);
- the locale and editable-state stores (about 4 KB, plain `useSyncExternalStore`);
- the icon registry itself, holding only the shared dropdown chevron (about 1 KB).

Things that used to sit in this floor and no longer do:

- the `cn` package (31 KB): a compiled clsx + tailwind-merge. The library's classes are `richtext-` prefixed, which tailwind-merge never recognised, so it only ever joined strings. A 20-line local `cn` with clsx semantics does the same.
- the icon map (24 KB of our code plus every Lucide icon): replaced by a registry that features fill in as they load — see below.
- `reactjs-signal` / `alien-signals` (7 KB): the editable-state and slash-command stores now use `useSyncExternalStore` directly.

## How icons stay tree-shakable

Icons are addressed by name (`icon: 'Table'` in a `button()` config, `iconName` in a slash command, `<RichTextToolbarButton icon='Save'>`) and resolved from a registry. The registry starts almost empty; each React control registers the icons it draws when its module loads:

```ts
// src/extensions/Table/components/RichTextTable.tsx
import { TableIcon } from 'lucide-react';
import { registerIcons } from '@/components/icons/icons';

registerIcons({ Table: TableIcon });
```

So importing `ai-sparkwrite-editor/table` brings the Table icon and nothing else. The same holds for the editor's own SVG icons (Mermaid, Excalidraw, export/import glyphs…): they are registered by their feature, not shipped to everyone.

Two consequences for a host:

- A name of your own has to be registered before it renders — `registerIcons({ Save })` at module scope. See [Customization → Icons](/guide/customization#icons).
- A component that renders another feature's buttons by name must import that feature's controls, or register the names itself. The bubble menus do this: `RichTextBubbleTable` registers the row/column icons it lists, so it works with the Table *extension* alone.

`tests/icon-registry.test.mjs` walks the source module graph from every public entry and fails if an icon name is used in a graph that never registers it.

## Tree-shaking notes

- `package.json` declares `sideEffects` for CSS and the locale bundle only. Everything else is side-effect free *as a module*, so a bundler may skip an entry file whose exports you do not use. `registerIcons` calls live in the component modules whose exports you render, so they survive as long as the control does.
- Heavy runtime dependencies (`katex`, `mermaid`, `@excalidraw/excalidraw`, `docx`, `mammoth`, `react-image-crop`…) are externals: they load through your bundler, once, and only for entries that use them.
- `react-tweet` stays bundled on purpose: its ESM imports CSS modules, which only a bundler can resolve. As an external it would make the `twitter` entries fail outside one (SSR, tests). It lives in the Twitter node view's chunk; rolldown also parks its module-interop helper there, so an entry whose code needs that helper (`ai`, `core` at the time of writing) imports the chunk without using the tweet embed — a chunking artefact, not a dependency.
- The root entry (`ai-sparkwrite-editor`) exports the provider and toolbar building blocks only; features come from their own entries, so importing the root does not pull every feature.

## Measuring

```sh
pnpm build:lib
pnpm measure:entries            # the default set of entries
pnpm measure:entries Bold.js    # one entry, with its largest chunks
```

The script sums the `lib/` chunks reachable from an entry and lists the external packages it imports; it does not include those externals' own size.
