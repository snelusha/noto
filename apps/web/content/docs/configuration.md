---
title: Configuration
description: Configure noto for your workflow.
---

noto is designed to work great out of the box, but it's also highly configurable. Here's how to tailor noto to your workflow.

## Configuration File

noto stores its configuration at `~/.config/noto/.notorc` following XDG standards. You don't need to edit this file manually; use noto's built-in commands instead.

## API Key Management

Set or update your Gemini API key:

```bash
noto config key "your-gemini-api-key-here"
```

## Model Selection

noto uses `gemini-2.0-flash` by default. To change the model:

```bash
noto config model
```

This command will prompt you to select from available models.

> **Tip:** The default model works well for most use cases, offering a good balance of speed and quality.

## Reset Configuration

Reset all noto configurations to defaults:

```bash
noto config reset
```

This will clear your API key, model selection, and all other settings.

## Commit Prompts

While noto generates conventional commits by default, every project has its own style. That's where commit prompts come in.

### What is `noto init`?

The `noto init` command analyzes your existing commit history and generates a custom prompt that matches your project's style:

```bash
noto init
```

> **Note:** Requires at least 5 commits in your repository history.

noto will:

1. Analyze your repository's commit history
2. Identify patterns in your commit messages
3. Generate a commit prompt file at `.noto/commit-prompt.md`
4. Use this prompt for all future commit messages in this project

When you run `noto`, it looks for a `.noto/commit-prompt.md` file in your current directory (or any parent directory). If found, noto uses your custom prompt instead of conventional commits. If not found, noto falls back to generating conventional commits.

### Multiple Commit Prompts

Working on a monorepo with multiple projects? No problem. noto supports multiple commit prompt files based on your current working directory.

**Example structure:**

```
monorepo/
├── .noto/commit-prompt.md          # Root-level prompt
├── packages/
│   ├── frontend/
│   │   └── .noto/commit-prompt.md  # Frontend-specific prompt
│   └── backend/
│       └── .noto/commit-prompt.md  # Backend-specific prompt
```

When you run `noto` from `packages/frontend/`, it uses the frontend-specific prompt. From `packages/backend/`, it uses the backend prompt. noto picks the closest `.noto/commit-prompt.md` file relative to your current directory.

> **Tip:** Commit your `.noto/commit-prompt.md` files to version control so your entire team uses consistent commit messages.

## Environment Variables

Set your API key globally (overrides local configuration):

```bash
export NOTO_API_KEY="your-gemini-api-key-here"
```
