---
description: Download and install the ai-richtext-editor skill for your AI coding agent.
---

# Skills

Give your AI coding agent package-specific guidance for building with `ai-richtext-editor`. The skill covers editor setup, extension imports, toolbars, bubble menus, uploads, themes, localization, and debugging.

## Install with one command

Run this command from your project directory. Use the copy button in the code block to copy it:

```sh
npx skills add ludejun/ai-richtext-editor --skill ai-richtext-editor
```

The installer lets you choose your coding agent and installation scope. Keep the project scope to use the skill in the current project, or add `--global` to make it available across projects. See the [Skills CLI documentation](https://github.com/vercel-labs/skills#install-a-skill) for supported agents and options.

The skill provides instructions to your coding agent. Install the editor's runtime dependencies separately using [Getting Started](/guide/getting-started).

## Download manually

[Download repository ZIP](https://github.com/ludejun/ai-richtext-editor/archive/refs/heads/main.zip) · [Browse the skill files](https://github.com/ludejun/ai-richtext-editor/tree/main/skills/ai-richtext-editor)

Extract the ZIP and copy the `skills/ai-richtext-editor` folder into your agent's supported skills directory. Keep the entire folder, including `references/`; downloading only `SKILL.md` leaves out the examples and API reference.

```text
ai-richtext-editor/
├── SKILL.md
└── references/
    ├── quickstart.md
    ├── extension-map.md
    ├── feature-recipes.md
    └── review-checklist.md
```

## Use the skill

After installation, ask your agent to use the skill with a concrete task, for example:

```text
Use the ai-richtext-editor skill to add an editor with bold, italic,
headings, and image upload to this React app. Follow the existing
project structure and use our upload API.
```

The skill checks the installed package version before choosing APIs. You can also use it to review an existing integration or investigate a broken editor feature.
