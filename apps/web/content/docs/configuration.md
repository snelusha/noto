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

noto uses `gemini-2.5-flash-lite` by default. To change the model:

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

### Template Placeholders

Commit prompts can include placeholders that noto expands immediately before generating a commit message. They work only in `.noto/commit-prompt.md`; they do not change the built-in guidelines when no prompt file exists.

#### Branch context

Use `{{branch}}` to insert the current Git branch name:

```md
Current branch: {{branch}}
```

If noto cannot determine the branch, it leaves `{{branch}}` unchanged.

#### Arguments after `--`

Pass extra prompt-specific arguments after `--`:

```bash
noto -- PROJ-123 security
```

In this command, `$1` is `PROJ-123` and `$2` is `security`. Quoted shell arguments stay together, so `noto -- "mention the race in the parser"` makes `$1` equal to `mention the race in the parser`. A later `--` is an ordinary argument.

| Placeholder | Expansion |
| --- | --- |
| `$1`, `$2`, … | Argument at that position, or an empty string when it is missing |
| `$@` or `$ARGUMENTS` | All arguments joined with spaces |
| `${1:-default}` | Argument 1, or `default` when it is missing or empty |
| `${@:-default}` or `${ARGUMENTS:-default}` | All arguments, or `default` when there are none |
| `${@:N}` | Arguments from position `N` through the end |
| `${@:N:L}` | `L` arguments starting at position `N` |

`$10` means the tenth argument, not `$1` followed by `0`. Empty values use the default form, while `0` is preserved. `${@:0}` starts from the first argument.

For example, a team that prefixes commits with tickets can use this prompt:

```md
Use this exact commit format:

<TICKET>: <type>(<scope>): <description>

Current branch: {{branch}}
Ticket: ${1:-none}

Use the provided ticket at the beginning of the commit message. If the ticket is `none`, omit the ticket prefix.
```

Run it with:

```bash
noto -- PROJ-123
```

On `feat/parser-race-condition`, noto can generate `PROJ-123: fix(parser): prevent race condition`.

Use `$$` when the prompt needs a literal dollar sign: `$$1` becomes `$1`, and `$$` becomes `$`. Placeholder values are inserted as literal text and are not expanded a second time. `-m` / `--message` remains separate user context; it is not `$1`.

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
