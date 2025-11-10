---
title: Introduction
description: Learn what noto is and why you should use it.
---

noto (/nōto/, meaning "notebook" in Japanese) is a tool that generates commit messages for your Git projects. It analyzes your staged changes and uses [Gemini](https://gemini.google/about/) to create clean, context-aware commit messages instantly.

## Why noto?

Writing good commit messages is hard, We've all been there:

- Staring at a black commit message box, unsure what to write.
- Defaulting to vague messages like "fix bug" or "update stuff".
- Struggling to maintain consistency across team commits.
- Spending more time writing commit messages than actually coding.

noto solves this by doing the thinking for you. It analyzes your actual code changes and generates meaningful, professional commit messages in seconds—so you can focus on what matters: writing great code.

## How It Works

```bash
# Stage your changes
git add .

# Generate and apply a commit messsage
noto -a

# That's it! ✨
```

## Features

- **Lightning Fast** - Generate messages in seconds, not minutes
- **Context-Aware** - Analyzes actual code changes, not just file names
- **Customizable Guidelines** - Define your own commit message style with noto init
- **Git Integration** - Apply, edit, or copy messages directly
- **Smart Defaults** - Works great out of the box, customizable when you need it

## What's New

🎉 `noto init` - Set up custom commit message guidelines for your project! noto can analyze your existing commit history and generate a guidelines file that matches your team's style, or you can start with a template and customize it yourself.

## Genesis

noto was born from a simple need: keeping commit messages clean on a university project with colleagues. As someone who values a well-maintained Git history, I built noto to make writing commit messages effortless and consistent. It worked so well that I decided to share it with the world.

**Ready to upgrade your commits?** Let's get you started with [installation](/docs/installation) and setup.
