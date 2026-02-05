---
title: Usage
description: Use noto's commands and features.
---

noto makes generating commit messages effortless. Here's everything you need to know.

## Generating Commits

### Basic Usage

Stage your changes and run noto:

```bash
git add .
noto
```

noto analyzes your staged changes, generates a commit message in an interactive editor, and commits the changes automatically.

### Preview Mode

Preview the generated message without committing:

```bash
git add .
noto -p # or --preview
```

### Copy to Clipboard

Copy the message to clipboard:

```bash
git add .
noto -c # or --copy
```

## Working with Previous Messages

### Reuse Previous Message

Retrieve and commit with the last generated commit message (default behavior):

```bash
noto prev
```

The command will prompt you to edit the message before committing. Use with flags:

```bash
noto prev -p  # Preview without committing or editing
noto prev -c  # Copy previous message
```

### Amend Previous Commit

Amend your last commit with the previously generated message:

```bash
noto prev --amend
```

The command will prompt you to edit the message before amending (unless `--preview` is used).

> **Note:** When using `--preview`, the message is shown without prompting for editing. Without `--preview`, the command will prompt you to edit the message before committing (or amending).

## Project Setup

### Initialize Custom Prompts

Create a custom commit prompt for your project:

```bash
noto init
```

noto will interactively ask where to create the file and whether to generate guidelines from your commit history.

**Available flags:**

- **`--root`** - Create the prompt file in the git root
- **`--generate`** - Generate prompt from existing commits (requires 5+ commits)

**Examples:**

```bash
noto init --root              # Create in git root
noto init --generate          # Generate from commits
noto init --root --generate   # Both options
```

> **Note:** Learn more about custom prompts in [Configuration](/docs/configuration#commit-prompts).

## Branch Management

### Switch Branches

```bash
noto checkout
```

### Create New Branch

```bash
noto checkout -b feat/new-feature
```

## Upgrading noto

### Check for Updates

Upgrade to the latest version:

```bash
noto upgrade
```

### Specific Version Types

Upgrade to stable or beta versions:

```bash
noto upgrade --stable  # Latest stable version
noto upgrade --beta    # Latest beta version
```

## All Available Flags

**Commit generation:**

- **`-p, --preview`** - Preview the generated message without committing
- **`-c, --copy`** - Copy the message to clipboard
- **`-m, --message`** - Provide context for the commit message
- **`-f, --force`** - Bypass cache and force regeneration of commit message
- **`--push`** - Commit and push the changes
- **`--manual`** - Write a custom commit message manually

**Previous message:**

- **`-p, --preview`** - Preview the previous message without committing or editing (for `noto prev`)
- **`-c, --copy`** - Copy the previous message to clipboard (for `noto prev`)
- **`--amend`** - Amend the previous commit (with `noto prev`)

**Initialization:**

- **`--root`** - Create prompt file in git root
- **`--generate`** - Generate prompt from existing commits

**Upgrade:**

- **`--stable`** - Upgrade to the latest stable version
- **`--beta`** - Upgrade to the latest beta version

## Quick Examples

```bash
# Quick commit (default behavior)
git add .
noto

# Preview message without committing
noto -p

# Commit and push
noto --push

# Provide context for the commit
noto -m "fixing authentication bug"

# Force regenerate (bypass cache)
noto -f

# Write manual commit message
noto --manual

# Copy for manual use
noto -c

# Reuse previous (commits by default)
noto prev

# Preview previous message
noto prev -p

# Amend last commit
noto prev --amend

# Set up custom prompts
noto init --root --generate
```

> **Tip:** Need to configure API keys or models? Check out [Configuration](/docs/configuration) for setup instructions. Using custom commit prompts? noto automatically uses your `.noto/commit-prompt.md` file.

> **Note:** noto caches generated commit messages based on your git diff. If you run `noto` multiple times with the same staged changes, it will reuse the cached response to save time and API costs. Use the `-f` or `--force` flag to bypass the cache and force regeneration.
