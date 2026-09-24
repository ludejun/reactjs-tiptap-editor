# Review and debugging

Verify against the installed version first (`node_modules/ai-sparkwrite-editor/package.json`, `lib/*.d.ts`).

| Symptom                                                                       | Check first                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Import fails / symbol undefined                                               | `package.json` exports; symbol name in `lib/index.d.ts` (`/vue`, `/core`); no private `@/` alias; React symbol requested from Vue                             |
| No styling                                                                    | `ai-sparkwrite-editor/style.css` imported once at the global style boundary; `react-image-crop/dist/ReactCrop.css` for crop                                   |
| Control missing / disabled                                                    | Extension registered **and** control rendered inside `RichTextProvider`; kit key not `false`; editor editable; selection allows the command                   |
| "There is no mark type named 'textStyle'" / font or colour menu appears stuck | Register `TextStyle` (kit: leave `textStyle` on)                                                                                                              |
| "Unknown node type", content vanishes on load                                 | The saved document uses a node whose extension is not registered (notice, divider, callout, imageBlock, columns…)                                             |
| Duplicate extension / plugin warnings                                         | Same node from StarterKit and this package; companions registered twice (ListItem, TaskItem, table cells, TOC node)                                           |
| Two `@tiptap/core` copies, schema errors in Vue                               | Pin `@tiptap/vue-3` to the exact core version; one version for every `@tiptap/*`                                                                              |
| Hydration error / `window is not defined`                                     | Client component, `immediatelyRender: false`, null guard, no browser APIs in prerender                                                                        |
| Saved content never changes                                                   | `onUpdate` wired; HTML vs JSON contract                                                                                                                       |
| External document stays stale / cursor jumps / update loop                    | `content` only initialises; `setContent(next, { emitUpdate: false })` once; parent echoing each edit; editor recreated per render                             |
| Uploaded image gone after reload                                              | `upload` resolved an object/data/expiring URL; response mapping wrong; error swallowed instead of rejected                                                    |
| Server keeps deleted images                                                   | No save-time `getImageChanges` + delete + `markImagesSaved`; deleting per edit instead                                                                        |
| AI button does nothing / "not configured"                                     | `AI` registered with `endpoint` (or `model`+`apiKey`, or `generate`); `composer: false` removes the button on purpose                                         |
| AI request fails with a status                                                | Backend contract (JSON body `{ messages, systemPrompt, stream, maxTokens }`, `{ text }` or SSE `{ text }`); auth/cookies; CORS; body is never shown by design |
| AI answer arrives as plain text, not blocks                                   | Server returned HTML or non-Markdown; ask for Markdown-only output (default `systemPrompt` does)                                                              |
| Streaming does not stream                                                     | `Content-Type: text/event-stream`, `data:` lines with `\n\n`, no buffering proxy; `stream: false` set                                                         |
| Space or `/` does nothing                                                     | `spaceTrigger`/`SlashCommand` + `SlashCommandList` (React only); editor focused and editable                                                                  |
| Translations stay English                                                     | `setMessage(code, dict)` before `setLang(code)`; exact code (`zh_CN`, `pt_BR`, `hu_HU`); computed dynamic import specifier                                    |
| Dark prop has no effect                                                       | `themeActions.setTheme('dark')`                                                                                                                               |
| Vue: Excalidraw/Drawer/Emoji/Mention/Twitter/slash missing                    | React-only today; do not promise them                                                                                                                         |
| Kit toolbar too crowded / feature buttons unwanted                            | Set the key to `false` (removes button + menus); `more={false}`; `defaultPins`                                                                                |
| Embed link not recognised                                                     | `resolveEmbed(input)` returns null for non-URLs; unknown pages still embed as generic iframe; X-Frame-Options is the target site's choice                     |

## Dependencies between pieces

- Provider and `EditorContent` share one editor; every `RichText*`, bubble, `SlashCommandList`, `RichTextAIComposer` inside the provider.
- Lists need `ListItem`; text-style features need `TextStyle`; Column needs three extensions and a widened `Document`; Table/TaskList/Details/TOC/Image bring their own companions.
- `RichTextBubbleText` has no single matching extension; its buttons follow what is registered. Feature bubbles need their node/mark.
- Undo/redo need `History` (or a collaboration history, not both).
- `AIAutocomplete`, Katex/Mermaid "describe it", the Improve menu and the composer all require the `AI` extension.

## Verification steps

- Uploads: successful URL stored in the node, failure rejected and reported through `onError`/toast, reopen the saved HTML and see the image.
- Save-time cleanup: insert → delete → save and confirm `orphaned` lists the source; reload with a stored `images` list and confirm `removed`.
- AI: run one selection action and one composer chip; check the network request body, the streamed response, the inserted nodes and a single undo step; check a failing status shows the generic message.
- Persistence: external replacement does not echo-save; pending saves cannot overwrite a different document.
- Locale/theme: switch and confirm every editor on the page follows (global stores).
- In this repository: `pnpm type-check`, `pnpm lint`, `pnpm build:lib`, `node --test tests/*.test.mjs`, `pnpm docs:build`; the playground consumes the built `lib/`.

Report the checks actually run and their results. Documentation-only changes need import/link validation, not claimed browser testing.
