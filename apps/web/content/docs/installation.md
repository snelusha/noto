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

```bash
npm install -g @snelusha/noto
```

That's it! You can now use `noto` from anywhere in your terminal.

> **Coming Soon**
>
> We're working on additional installation methods:
>
> - **Homebrew** support for macOS/Linux users
> - **Single native executable** for zero-dependency installation
>
> Track progress: [Homebrew support](https://github.com/snelusha/noto/issues/171) · [Native executable](https://github.com/snelusha/noto/issues/158)

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

**Having trouble?** Check out our [troubleshooting guide](/docs/troubleshooting) or [open an issue](https://github.com/snelusha/noto/issues) on GitHub.
