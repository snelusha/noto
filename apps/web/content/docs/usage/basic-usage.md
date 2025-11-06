---
title: Basic Usage
---

noto makes generating commit messages effortless. Here's everything you need to know to get started.

## Generate a Commit Message

Stage your changes and run noto:

```bash
git add .

noto
```

noto analyzes your staged changes and generates a concise commit messasge in a interactive editor. Review and refine the message as needed.

## Apply the Commit

Apply the generated message to commit your changes:

```bash
git add .

noto -a # or --apply
```

This generates the message, lets you refine it interactively, then commits your changes in one seamless step.

## Copy to Clipboard

Copy the generated messasge to your clipboard for use elsewhere:

```bash
git add .

noto -c # or --copy
```

## Reuse Previous Message

Retrieve the last generate commit message:

```bash
noto prev
```

You can use all the same flags with `noto prev`:

```bash
noto prev -a

noto prev -c
```

## Amend Previous Commit

Want to modify your last commit message?

```bash
noto prev --amend -e # or --edit
```

> **Note:** When using `--amend`, the `--edit` (`-e`) flag is required.

> **Tip:** Using custom commit prompts? noto automatically uses your `.noto/commit-prompt.md` file when generating messages. See [Configuration](/docs/configuration#commit-prompts) to learn more.
