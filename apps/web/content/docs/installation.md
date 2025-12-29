---
title: Installation
description: Install and set up noto.
---

Getting noto up and running takes less than a minute. Let's walk through it.

## Prerequisites

- **Node.js** (v18 or higher)
- **Git** installed and configured
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Install

Install noto globally using package manager of your choice.

```bash brew="brew install snelusha/noto/noto"
npm install -g @snelusha/noto
```

That's it! You can now use `noto` from anywhere in your terminal.

> **Coming Soon:** Single native executable for zero-dependency installation ([track progress](https://github.com/snelusha/noto/issues/158))

## API Key Setup

noto needs a Gemini API key to generate commit messages. You hve two options:

### Option 1: Environment Variable (Recommended)

Add your API key to your shell configuration:

```bash
export NOTO_API_KEY="your-gemini-api-key-here"
```

### Option 2: Local Configuration

Set your API key using noto's config command:

```bash
noto config key "your-gemini-api-key-here"
```

This will be stored in a config file at `~/.config/noto/.notorc` following XDG standards.

## Verify Installation

Check that noto is installed correctly:

```bash
noto --version
```

You should see the current version number. If you do, you're all set!

## Upgrading noto

Keep noto up to date with the latest features and improvements:

```bash
noto upgrade
```

noto will automatically check for available updates and install the latest version. If you're already on the latest version, you'll be notified.

### Upgrade Options

Control which version to upgrade to:

```bash
noto upgrade --stable  # Upgrade to latest stable version
noto upgrade --beta    # Upgrade to latest beta version
```

> **Note:** By default, the upgrade command automatically chooses the appropriate version based on your current installation. If you're on a prerelease version, it will check for the best available update (stable or beta). Use `--stable` or `--beta` to explicitly control the upgrade target.

**Having trouble?** Check out our [troubleshooting guide](/docs/reference/faq) or [open an issue](https://github.com/snelusha/noto/issues) on GitHub.
