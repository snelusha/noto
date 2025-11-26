# Commit Message Guidelines

## Format

Use conventional commits: `type(cli): description`

## Style Rules

- **Tense**: Imperative/present ("remove", "update", "add", "fix")
- **Capitalization**: Lowercase first letter
- **Length**: Concise, aiming for under 70 characters
- **Tone**: Technical and specific

## Commit Types

- `feat`: New features or capabilities
- `fix`: Bug fixes and issue resolutions
- `refactor`: Code improvements without adding new features
- `docs`: Documentation updates
- `test`: Adding or modifying tests
- `chore`: Routine tasks, dependency updates, releases, or build process changes

## Scope Usage

Use specific component/area names in parentheses. The primary scope observed is `cli`.

## Description Patterns

Start with an action verb (add, remove, update, fix, handle). Be specific about what changed and the area affected. Use backticks for code or variable names.

## Examples from History

- chore(cli): remove legacy parser
- refactor(cli): update imports with alias
- test(cli): add tests for `cleanupLegacyStorage`

