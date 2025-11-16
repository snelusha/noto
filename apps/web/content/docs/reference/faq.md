---
title: FAQ
description: Common questions and troubleshooting for noto.
---

Quick answers to common questions about noto.

## Common Errors

### "noto api key is missing"

Configure your API key:

```bash
noto config key
```

Or set it as an environment variable (recommended):

```bash
export NOTO_API_KEY="your-api-key-here"
```

Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### "no staged changes found"

Stage your changes first:

```bash
git add .
noto
```

### "not enough commits to generate a prompt file"

`noto init --generate` needs at least 5 commits. Either:

- Wait until you have 5+ commits, then try again
- Use `noto init` without `--generate` for an empty template

### "the --amend option requires the --edit option"

Use both flags together:

```bash
noto prev --amend -e
```

## Quick Questions

### Why does noto show the same message repeatedly?

noto caches messages to save API costs. Force regeneration with:

```bash
noto -f
```

### Does noto send my code to Google?

Only your **git diff** (staged changes) is sent to generate the commit message, not your entire codebase.

### How much does it cost?

noto uses Gemini API's free tier, which is generous for most usage. Check [Google AI Studio pricing](https://ai.google.dev/pricing) for limits.

### Should I commit `.noto/commit-prompt.md`?

**Yes!** Commit it so your team uses consistent commit messages.

## Need More Help?

- [Installation Guide](/docs/installation) - Setup and configuration
- [Usage Guide](/docs/usage) - Commands and flags
- [Configuration](/docs/configuration) - Custom prompts and settings
- [GitHub Issues](https://github.com/snelusha/noto/issues) - Report bugs or request features
