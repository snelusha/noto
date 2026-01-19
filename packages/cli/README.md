<h1 align="center">noto ✨</h1>
<p align="center"><sup>(/nōto/, <em>notebook</em> in Japanese)</sup></p>
<img src="https://github.com/snelusha/static/blob/main/noto/banner-lts.png?raw=true" align="center"></img>

## Features

- **Instant Commit Messages**: Generate clear, context-aware messages based on staged changes.

- **Seamless Git Integration**: Auto-commit by default, with a preview-only option.

- **Interactive Editing:** Edit the generated message in-line before committing (no flag needed).

- **Enhanced Configuration:** Manage your LLM model preferences with an improved configuration interface.

## Installation

Install noto globally using npm:

```bash
npm install -g @snelusha/noto
```

After installation, you can run `noto` from any terminal.

## Prerequisites

Before using noto, you must configure your [Google Generative API](https://aistudio.google.com/app/apikey) key. You can now provide your API key in two ways:

### 1. Using an environment variable (recommended)

Set the `NOTO_API_KEY` environment variable globally so it's available across your system.

#### macOS/Linux (eg., in .bashrc, .zshrc or .profile)

```bash
export NOTO_API_KEY=your_api_key_here
```

Then reload your terminal or run:

```bash
source ~/.zshrc # or ~/.bashrc or ~/.profile
```

#### Windows (Command Prompt or PowerShell):

```bash
setx NOTO_API_KEY "your_api_key_here"
```

> Note: You may need to restart your terminal (or system) for changes to take effect.

### 2. Using the built-in configuration command

```bash
noto config key # or simply noto config key YOUR_API_KEY
```

> noto will first look for the `NOTO_API_KEY` environment variable. If it's not found, it will fall back to the local configuration.

You can also configure a specific Gemini mode (optional):

```bash
noto config model
```

Alternatively, you can specify the model using the `NOTO_MODEL` environment variable:

```bash
export NOTO_MODEL=gemini-2.5-flash
```

> The model priority order is: `--model` flag > `NOTO_MODEL` environment variable > config file > default model.

If you ever need to reset your configuration, you can now run:

```bash
noto config reset
```

## Usage

Generate and commit with a new commit message (default behavior):

```bash
noto
```

Preview the generated message without committing:

```bash
noto --preview # or simply noto -p
```

Copy the generated commit message to your clipboard:

```bash
noto --copy # or simply noto -c
```

Specify a model to use (overrides config file and environment variable):

```bash
noto --model gemini-2.5-flash
```

Retrieve the previously generated commit message:

```bash
noto prev
```

Amend the previously generated commit message:

```bash
noto prev --amend --edit # or simply: noto prev --amend -e
```

> Note: When using the `--amend` flag with the noto prev command, the `--edit` (`-e`) flag is also required. This combination will allow you to modify (amend) the previous commit message before applying it.

Note: `--preview` and `--copy` can also be used with the `noto prev` command. `--edit` applies only when using `noto prev --amend`.

Switch between branches in your git repo with an interactive prompt:

```bash
noto checkout
```

Create and switch to a new branch:

```bash
noto checkout -b new-branch-name
```

Update noto to the latest version:

```bash
noto upgrade
```

> noto will automatically detect your installation method and update itself accordingly.

## Pro Tips

- 🚀 Get fast commits on the fly with `noto` - it commits by default!

## Contributing

We welcome contributions and suggestions! If you have ideas or improvements, feel free to open a pull request or reach out with feedback. ✨

Thank you for using noto!

## License

This project is licensed under the MIT License.
© 2024-2026 [Sithija Nelusha Silva](https://github.com/snelusha)
