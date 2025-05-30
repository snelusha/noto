<h1 align="center">noto ✨</h1>
<p align="center"><sup>(/nōto/, <em>notebook</em> in Japanese)</sup></p>
<img src="https://github.com/snelusha/static/blob/main/noto/banner-sharp.png?raw=true" align="center"></img>

## Features

- **Instant Commit Messages**: Generate clear, context-aware messages based on staged changes.

- **Seamless Git Integration**: Apply messages directly, skip the copy-paste.

- **Interactive Editing:** Easily refine your commit message with the new `--edit` flag.

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

Set the `NOTO_API_KEY` environment variable globally os it's available across your system.

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

If you ever need to reset your configuration, you can now run:

```bash
noto config reset
```

## Usage

Generate a new commit message:

```bash
noto
```

Apply the generated commit message to your current commit:

```bash
noto --apply # or simply noto -a
```

Copy the generated commit message to your clipboard:

```bash
noto --copy # or simply noto -c
```

Specify the commit type for your commit message:

```bash
noto --type # or simply noto -t

noto --type chore # or simply noto -t chore
```

Combine all flags to specify the commit type, and apply the generated commit message in one go:

```bash
noto --type feat --apply  # or simply: noto -t feat -a
```

This command will generate a commit message for a "feat" commit, let you refine it interactively, and then apply it directly to your current commit.

Retrieve the previously generated commit message:

```bash
noto prev
```

Amend the previously generated commit message:

```bash
noto prev --amend --edit # or simply: noto prev --amend -e
```

> Note: When using the `--amend` flag with the noto prev command, the `--edit` (`-e`) flag is also required. This combination will allow you to modify (amend) the previous commit message before applying it.

Note: All of the flags shown above (`--apply`, `--copy`, `--type`, `--edit`) can also be used with the `noto prev` command to work with the previously generated commit message.

Switch between branches in you git repo with an interactive prompt:

```bash
noto checkout
```

To copy the selected branch to your clipboard immediately after choosing it, use the new `-c` flag:

```bash
noto branch
```

To list all branches, including remote branches, use the -r flag

```bash
noto branch -r
```

Delete local branches:

```bash
noto branch delete
```

If you need to force delete a branch, you can use the force flag:

```bash
noto branch delete --force # simply: noto branch delete -f
```

## Pro Tips

- 🚀 Get fast commits on the fly with `noto -a` to streamline your workflow!

## Contributing

We welcome contributions and suggestions! If you have ideas or improvements, feel free to reach out or open a pull request.

Thank you for using `noto`! If you have any feedback or suggestions, feel free to reach out or contribute to the project. ✨

## License

This project is licensed under the MIT License.
© 2024 [Sithija Nelusha Silva](https://github.com/snelusha)
