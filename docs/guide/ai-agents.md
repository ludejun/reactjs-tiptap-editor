---
description: Give Claude Code, Cursor, Codex or any coding agent the knowledge to integrate ai-sparkwrite-editor correctly

next:
  text: AI
  link: /extensions/AI/index.md
---

# AI Coding Agents

Most editors are now wired up by an AI assistant rather than by hand. An assistant that only knows Tiptap will guess at import paths, put an API key in the browser, or upload images to a blob URL. This page lists what to hand it so it does not have to guess.

## 1. The skill

The repository ships an [agent skill](https://github.com/ludejun/ai-sparkwrite-editor/tree/main/skills/ai-sparkwrite-editor) — a `SKILL.md` with the integration rules and five reference files: install and the kit options, every export and entry point, the **AI backend contract** (`endpoint` request/response, streaming, server samples), the upload and image-deletion recipes, and a debugging checklist. It is written for the installed version and tells the agent to trust `lib/*.d.ts` over its own text.

Install it into your project with the [skills CLI](https://github.com/vercel-labs/skills) (works for Claude Code, Cursor, Codex, Copilot, Windsurf and others):

```bash
npx skills add ludejun/ai-sparkwrite-editor
```

Or point the agent at the copy inside the package — it ships with every release:

```
node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md
```

A one-line instruction in your `CLAUDE.md` / `AGENTS.md` / `.cursorrules` is enough:

```md
Before touching the editor, read node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md and the reference it points to.
```

## 2. The documentation, in one file

The docs site publishes the two files the [llms.txt convention](https://llmstxt.org) defines:

- **[llms.txt](https://ludejun.github.io/ai-sparkwrite-editor/llms.txt)** — an index of every page with its description.
- **[llms-full.txt](https://ludejun.github.io/ai-sparkwrite-editor/llms-full.txt)** — every English page concatenated, for an agent that can fetch a URL.

The pages themselves are Markdown in the repository under [`docs/`](https://github.com/ludejun/ai-sparkwrite-editor/tree/main/docs), so an agent with GitHub access can read a single page, for example [`docs/extensions/AI/index.md`](https://github.com/ludejun/ai-sparkwrite-editor/blob/main/docs/extensions/AI/index.md).

## 3. The type declarations

The most reliable source for the installed version is the package itself. Every option carries a JSDoc comment:

| What                                                                    | Where                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------- |
| Every React export, kit options                                         | `node_modules/ai-sparkwrite-editor/lib/index.d.ts`            |
| Vue exports                                                             | `node_modules/ai-sparkwrite-editor/lib/vue.d.ts`              |
| Framework-free core                                                     | `node_modules/ai-sparkwrite-editor/lib/core.d.ts`             |
| One extension's options (`AIOptions`, `IImageOptions`, `VideoOptions`…) | `node_modules/ai-sparkwrite-editor/lib/extensions/<Name>/`    |
| Public entry points                                                     | `exports` in `node_modules/ai-sparkwrite-editor/package.json` |

## 4. What to tell it about your app

The skill asks the agent to find these in your code and to ask you only when it cannot:

- **The AI backend** — the URL the editor should POST to (`ai: { endpoint: '/api/ai' }`) and where to implement it. The contract is in [AI › Your endpoint](/extensions/AI/#your-endpoint); the skill carries Express and Next.js samples for OpenAI and Anthropic. Keys stay on the server.
- **Uploads** — the endpoint and response shape for images, videos and attachments. The callback must resolve to a URL the saved document can reopen later.
- **Persistence** — HTML or JSON, when to save, and whether deleted images should be removed on the server at save time (`getImageChanges` / `markImagesSaved`, see [Image](/extensions/Image/#uploads-and-deleted-images)).
- **Framework and route** — React or Vue, the kit or a hand-assembled toolbar, SSR or not.

## 5. A prompt that works

```text
Add ai-sparkwrite-editor to the article form. Use RichTextKit with our
/api/ai endpoint (implement it as a Next.js route handler proxying to
Anthropic), image uploads through /api/uploads (returns { url }), save
HTML on change with an 800 ms debounce, and delete orphaned images on
save. Read node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md first.
```
