---
description: 让 Claude Code、Cursor、Codex 等编程助手正确接入 ai-sparkwrite-editor

next:
  text: AI
  link: /zh/extensions/AI/index.md
---

# AI 编程助手

现在大多数编辑器都是由 AI 助手而不是人手接进项目的。一个只懂 Tiptap 的助手会猜引入路径、把 API Key 放进浏览器、把图片上传成 blob URL。本页列出应该交给它的材料，让它不必猜。

## 1. Skill

仓库自带一份 [agent skill](https://github.com/ludejun/ai-sparkwrite-editor/tree/main/skills/ai-sparkwrite-editor)：一份 `SKILL.md` 写明接入规则，外加五份参考文件——安装与 kit 选项、所有导出与入口、**AI 后端契约**（`endpoint` 的请求/响应、流式、服务端示例）、上传与图片删除的做法、以及排错清单。它按已安装版本编写，并要求助手以 `lib/*.d.ts` 为准。

用 [skills CLI](https://github.com/vercel-labs/skills) 安装到你的项目（支持 Claude Code、Cursor、Codex、Copilot、Windsurf 等）：

```bash
npx skills add ludejun/ai-sparkwrite-editor
```

或者直接让助手读 npm 包里自带的那份（每个版本都会随包发布）：

```
node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md
```

在 `CLAUDE.md` / `AGENTS.md` / `.cursorrules` 里加一行即可：

```md
改动编辑器之前，先读 node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md 以及它指向的参考文件。
```

## 2. 一个文件里的全部文档

文档站按 [llms.txt 约定](https://llmstxt.org)发布两个文件：

- **[llms.txt](https://ludejun.github.io/ai-sparkwrite-editor/llms.txt)**——每一页的索引和简介。
- **[llms-full.txt](https://ludejun.github.io/ai-sparkwrite-editor/llms-full.txt)**——所有英文页面拼成一个文件，给能抓取 URL 的助手。

页面本身就是仓库 [`docs/`](https://github.com/ludejun/ai-sparkwrite-editor/tree/main/docs) 下的 Markdown，能访问 GitHub 的助手可以直接读某一页，例如 [`docs/extensions/AI/index.md`](https://github.com/ludejun/ai-sparkwrite-editor/blob/main/docs/extensions/AI/index.md)。

## 3. 类型声明

对已安装版本最可靠的来源是包本身，每个选项都带 JSDoc 注释：

| 内容                                                             | 位置                                                          |
| ---------------------------------------------------------------- | ------------------------------------------------------------- |
| 所有 React 导出、kit 选项                                        | `node_modules/ai-sparkwrite-editor/lib/index.d.ts`            |
| Vue 导出                                                         | `node_modules/ai-sparkwrite-editor/lib/vue.d.ts`              |
| 与框架无关的 core                                                | `node_modules/ai-sparkwrite-editor/lib/core.d.ts`             |
| 某个扩展的选项（`AIOptions`、`IImageOptions`、`VideoOptions`……） | `node_modules/ai-sparkwrite-editor/lib/extensions/<Name>/`    |
| 公开入口                                                         | `node_modules/ai-sparkwrite-editor/package.json` 的 `exports` |

## 4. 需要告诉它的业务信息

skill 会要求助手先在你的代码里找这些，找不到才问你：

- **AI 后端**——编辑器要 POST 的地址（`ai: { endpoint: '/api/ai' }`）以及在哪实现。契约见 [AI › 你的接口](/zh/extensions/AI/#你的接口地址)；skill 里带有 Express 与 Next.js 下对接 OpenAI / Anthropic 的示例。Key 留在服务端。
- **上传**——图片、视频、附件的接口和响应格式。回调必须返回保存后的文档以后还能打开的 URL。
- **持久化**——存 HTML 还是 JSON、何时保存、要不要在保存时删除服务端上已被删掉的图片（`getImageChanges` / `markImagesSaved`，见 [Image](/zh/extensions/Image/)）。
- **框架与路线**——React 还是 Vue，用 kit 还是手动拼工具栏，是否 SSR。

## 5. 一段能用的提示词

```text
把 ai-sparkwrite-editor 接到文章表单里。用 RichTextKit，AI 走我们的
/api/ai（用 Next.js route handler 实现，代理到 Anthropic），图片上传走
/api/uploads（返回 { url }），内容变化后 800 ms 防抖保存 HTML，保存时
删除孤立图片。先读 node_modules/ai-sparkwrite-editor/skills/ai-sparkwrite-editor/SKILL.md。
```
