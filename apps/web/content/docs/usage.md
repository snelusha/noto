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

Retrieve the last generated commit message:

```bash
noto prev
```

Use with flags:

```bash
noto prev -a  # Apply previous message
noto prev -c  # Copy previous message
```

### Amend Previous Commit

Modify your last commit message:

```bash
noto prev --amend -e # or --edit
```

> **Note:** When using `--amend`, the `--edit` (`-e`) flag is required.

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

- **`-e, --edit`** - Required with `--amend` (for `noto prev`)
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

# Reuse previous
noto prev -a

# Amend last commit
noto prev --amend -e

# Set up custom prompts
noto init --root --generate
```

> **Tip:** Need to configure API keys or models? Check out [Configuration](/docs/configuration) for setup instructions. Using custom commit prompts? noto automatically uses your `.noto/commit-prompt.md` file.

> **Note:** noto caches generated commit messages based on your git diff. If you run `noto` multiple times with the same staged changes, it will reuse the cached response to save time and API costs. Use the `-f` or `--force` flag to bypass the cache and force regeneration.
