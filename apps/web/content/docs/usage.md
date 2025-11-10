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

noto analyzes your staged changes and generates a commit message in an interactive editor.

### Apply Commit

Apply the generated message and commit:

```bash
git add .
noto -a # or --apply
```

### Copy to Clipboard

Copy the message without committing:

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

## All Available Flags

**Commit generation:**

- **`-a, --apply`** - Apply the commit message and commit
- **`-c, --copy`** - Copy the message to clipboard
- **`-e, --edit`** - Required with `--amend`
- **`--amend`** - Amend the previous commit

**Initialization:**

- **`--root`** - Create prompt file in git root
- **`--generate`** - Generate prompt from existing commits

## Quick Examples

```bash
# Quick commit
git add .
noto -a

# Review before committing
git add .
noto

# Copy for manual use
git add .
noto -c

# Reuse previous
noto prev -a

# Amend last commit
noto prev --amend -e

# Set up custom prompts
noto init --root --generate
```

> **Tip:** Need to configure API keys or models? Check out [Configuration](/docs/configuration) for setup instructions. Using custom commit prompts? noto automatically uses your `.noto/commit-prompt.md` file.
