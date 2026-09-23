# Contributing

Thanks for helping out.

## Setup

SparkWrite uses [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm build:lib        # the playground imports the built lib/
pnpm playground       # http://localhost:8000
pnpm docs:dev         # documentation site
```

Rebuild the library after changing anything under `src/`; the playground does not watch source files. `pnpm build:lib:dev` rebuilds on change.

## Checks

```bash
pnpm type-check
pnpm lint             # oxlint, 0 errors
pnpm test:types       # type-checks the tests
pnpm exec esno --test tests/ai-client.test.ts tests/locale-loading.test.ts tests/word-export.test.ts tests/katex-loader.test.ts tests/rangi-performance.test.ts
node --test tests/bundle-isolation.test.mjs   # after pnpm build:lib
pnpm docs:build
```

Format only the files you touched: `pnpm exec oxfmt <files>`.

## Layout

- `src/extensions/<Name>/` — one feature: the Tiptap extension (`<Name>.ts`), its React controls (`components/`), and an `index.ts`. Each folder is a package subpath (`ai-sparkwrite-editor/<name>`) declared in `package.json` under `exports` and `typesVersions`.
- `src/components/` — shared UI (buttons, menus, toolbar primitives, bubble menus).
- `src/locales/` — one file per language, 260+ keys each; every key must exist in every file.
- `src/styles/` — SCSS, compiled into `ai-sparkwrite-editor/style.css`. Tailwind classes carry the `richtext-` prefix.
- `docs/` — VitePress. Every extension has `docs/extensions/<Name>/index.md` and an entry in `docs/.vitepress/locale.ts`.
- `playground/` — the demo app.

Adding an extension: create the folder, add the two `package.json` entries, the docs page and sidebar entry, and register it in the playground.

## Commits

Single-line messages, `type(scope): summary`, checked by a hook. Allowed types include `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Bodies are not accepted by the hook; put detail in the pull request.

## Bringing in fixes from reactjs-tiptap-editor

SparkWrite descends from [hunghg255/reactjs-tiptap-editor](https://github.com/hunghg255/reactjs-tiptap-editor). The shared history is kept on the `archive/reactjs-tiptap-editor` branch, and `upstream` points at the original repository:

```bash
git remote add upstream https://github.com/hunghg255/reactjs-tiptap-editor.git  # once
git fetch upstream
git log --oneline archive/reactjs-tiptap-editor..upstream/main   # what is new there
```

Pick individual fixes, never merge branches — the projects have diverged too far for a merge to be meaningful:

```bash
git cherry-pick -x <sha>            # applies cleanly when the files match
git cherry-pick -x -X theirs <sha>  # or resolve conflicts by hand
```

When a fix touches files SparkWrite has rewritten, read the upstream diff and re-implement the fix here rather than forcing the patch:

```bash
git show upstream/main~3 -- src/extensions/Table/Table.ts
```

Package subpaths were renamed (`reactjs-tiptap-editor/...` → `ai-sparkwrite-editor/...`) and the root CSS class is `.sparkwrite`; cherry-picked docs or tests need those adjusted. Record the upstream commit in your message (`-x` does this) so the provenance stays visible.
