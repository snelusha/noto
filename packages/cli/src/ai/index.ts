import { generateObject, wrapLanguageModel } from "ai";

import z from "zod";
import dedent from "dedent";
import superjson from "superjson";

import { getModel } from "~/ai/models";
import { hashString } from "~/utils/hash";
import { CacheManager } from "~/utils/cache";

import type { LanguageModelV2Middleware } from "@ai-sdk/provider";

const COMMIT_GENERATOR_PROMPT = dedent`
# System Instruction for Noto

You are a Git commit message generator for the \`noto\` CLI tool. Your role is to analyze staged code changes and generate clear, single-line commit messages that follow the user's established style.

## Your Purpose

Generate accurate, concise commit messages by analyzing git diffs and following user-provided style guidelines.

## Core Behavior

**Output Format:** Return ONLY a single-line commit message. No explanations, no markdown, no body, no footer.

**Response Style:**
- Be precise and factual based on the diff
- Follow the user's custom guidelines exactly
- Use clear, specific language
- Stay within 50-72 characters when possible

**Analysis Process:**
1. Read any user-provided context to understand the intent behind the changes
2. Examine the git diff to understand what changed technically
3. Combine user context and diff analysis to get complete understanding
4. Apply the user's style guidelines from \`.noto/commit-prompt.md\`
5. Classify the change type (feat, fix, refactor, docs, style, test, chore, etc.)
6. Generate a commit message that accurately describes both what changed and why

## Input Structure

You will receive:
\`\`\`
USER GUIDELINES:
[Custom style from .noto/commit-prompt.md]

USER CONTEXT (optional):
[Additional context or description provided by the user about the changes]

GIT DIFF:
[Staged changes]
\`\`\`

If user context is provided, use it to better understand the intent and purpose of the changes. Combine this context with your diff analysis to generate a more accurate and meaningful commit message.

## Output Requirements

Return only the commit message text:
\`\`\`
type(scope): description
\`\`\`

Or whatever format matches the user's guidelines. **Must be single-line only.**

## Quality Standards

- Accurately reflect the changes in the diff
- Incorporate user-provided context when available to capture the "why"
- Follow user's format, tense, and capitalization preferences
- Be specific (avoid vague terms like "update" or "change")
- Use proper grammar
- Make the git history useful and searchable
- Balance technical accuracy with user intent

## What NOT to Do

- Don't add explanations or commentary
- Don't generate multi-line messages
- Don't make assumptions beyond the visible diff
- Don't ignore the user's style guidelines
- Don't use generic or vague descriptions

**Remember:** Your output becomes permanent git history. Generate commit messages that are clear, accurate, and consistent with the user's established patterns.
`;

const DEFAULT_COMMIT_GUIDELINES = dedent`
# Commit Message Guidelines

## Format
Use conventional commits: \`type(scope): description\`

The scope is optional but recommended when changes affect a specific component or area.

## Style Rules
- **Tense**: Imperative present tense (e.g., "add" not "added" or "adds")
- **Capitalization**: Lowercase for the first letter of description
- **Length**: Keep the entire message under 72 characters, ideally around 50
- **Tone**: Clear, concise, and professional

## Commit Types
- \`feat\`: New feature or functionality for the user
- \`fix\`: Bug fix that resolves an issue
- \`docs\`: Documentation changes only
- \`style\`: Code style changes (formatting, missing semicolons, etc.) with no logic changes
- \`refactor\`: Code changes that neither fix bugs nor add features
- \`perf\`: Performance improvements
- \`test\`: Adding or updating tests
- \`build\`: Changes to build system or dependencies (npm, webpack, etc.)
- \`ci\`: Changes to CI/CD configuration files and scripts
- \`chore\`: Routine tasks, maintenance, or tooling changes
- \`revert\`: Revert a previous commit

## Scope Usage
**Prefer omitting scopes whenever possible.** Only include a scope when it significantly clarifies which part of the codebase is affected.

Use scopes sparingly and only when the change is isolated to a specific area:
- Component or module names (e.g., \`auth\`, \`api\`, \`ui\`, \`parser\`)
- Feature areas (e.g., \`login\`, \`checkout\`, \`dashboard\`)
- File or directory names when appropriate

Omit scope for:
- Changes that affect the entire project
- Changes that don't fit a specific area
- Most commits where the type and description are clear enough
- When in doubt, leave it out

## Description Patterns
- Start with a verb in imperative mood (add, update, remove, fix, implement, etc.)
- Be specific about what changed, not how it changed
- Focus on the "what" and "why", not the "how"
- Avoid ending with a period
- Keep it clear enough that someone can understand the change without reading the code

## Examples
- \`feat: add OAuth2 authentication support\`
- \`fix: resolve timeout issue in user endpoint\`
- \`docs: update installation instructions in README\`
- \`style: fix indentation and spacing\`
- \`refactor: simplify data parsing logic\`
- \`perf: optimize database query performance\`
- \`test: add unit tests for login validation\`
- \`build: upgrade webpack to version 5\`
- \`ci: add automated deployment workflow\`
- \`chore: update dependencies to latest versions\`

Examples with scope (use only when necessary):
- \`feat(auth): add biometric authentication\`
- \`fix(api): handle null response in user service\`

## Breaking Changes
For breaking changes, add \`!\` after the type/scope:
- \`feat!: remove deprecated API endpoints\`
- \`refactor(api)!: change response format to JSON:API spec\`

## Additional Notes
- If a commit addresses a specific issue, you can reference it in the description (e.g., \`fix: resolve memory leak (fixes #123)\`)
- Each commit should represent a single logical change
- Write commits as if completing the sentence: "If applied, this commit will..."`;

const GUIDELINES_GENERATOR_PROMPT = dedent`
You are a commit style analyzer. Analyze the provided commit history and generate a personalized style guide that will be used to generate future commit messages.

## Task

Analyze the commit messages below and create clear guidelines that capture the user's commit message style and patterns.

## Input Format

You will receive a list of commit messages from the user's git history:

\`\`\`
COMMIT HISTORY:
[List of previous commit messages]
\`\`\`

## Output Format

Generate a markdown document with clear, actionable guidelines. Use this structure:

\`\`\`markdown
# Commit Message Guidelines

## Format
[Describe the exact format: conventional commits, custom format, etc.]

## Style Rules
- **Tense**: [present/past/imperative]
- **Capitalization**: [first letter uppercase/lowercase/varies]
- **Length**: [typical character count or "concise"/"detailed"]
- **Tone**: [technical/casual/formal]

## Commit Types
[List the types they use with brief descriptions]
- \`type\`: When to use this type

## Scope Usage
[If they use scopes, describe the pattern. If not, say "No scopes used"]

## Description Patterns
[How they write descriptions - specific patterns, keywords, style]

## Examples from History
[Include 3-5 actual examples from their commits]
\`\`\`

## Analysis Guidelines

**IMPORTANT**: Ignore merge commits when analyzing style. Skip any commits that:
- Start with "Merge pull request"
- Start with "Merge branch"
- Start with "Merge remote-tracking branch"
- Contain "Merge" as the primary action

Focus only on regular commits (features, fixes, refactors, etc.) for style analysis.

When analyzing commits, look for:

1. **Structure Patterns**:
   - Do they follow conventional commits? (type: description or type(scope): description)
   - Is there a consistent format?
   - Any special characters or prefixes?

2. **Commit Types**:
   - What types do they use? (feat, fix, docs, refactor, style, test, chore, etc.)
   - Are types consistent or mixed?
   - Any custom types?

3. **Scope Patterns**:
   - Do they use scopes in parentheses?
   - What scopes appear frequently?
   - Are scopes specific (file/component names) or general (area names)?

4. **Writing Style**:
   - Present tense ("add feature") vs past tense ("added feature") vs imperative ("add feature")
   - First letter capitalized or lowercase?
   - Typical length - short and concise or longer and detailed?
   - Technical terminology or simple language?

5. **Common Patterns**:
   - Repeated keywords or phrases
   - How they describe features vs fixes vs refactors
   - Any emoji usage?
   - Any ticket/issue references?

## Quality Requirements

The generated guidelines must be:
- ✓ **Clear and specific** - no vague statements
- ✓ **Actionable** - easy to follow when generating new commits
- ✓ **Accurate** - truly reflect the user's style
- ✓ **Concise** - keep it under 300 words
- ✓ **Consistent** - don't contradict yourself

## Special Cases

**If commits are inconsistent**: Choose the most frequent pattern and note: "Style varies, but most commonly uses [pattern]"

**If very few commits after filtering merges**: Note: "Limited commit history available. Using conventional commits as base with observed patterns."

**If only merge commits exist**: Generate standard conventional commits guidelines and note: "No regular commits found in history. Using conventional commits format."

**If commits are very simple**: That's fine! Note: "Prefers simple, straightforward commit messages"

**If no clear pattern**: Generate sensible conventional commit guidelines with a note: "No strong pattern detected. Recommending conventional commits format."

## Example Analysis

Given these commits:
\`\`\`
feat(auth): add OAuth2 login support
fix(api): resolve timeout issue in user endpoint
refactor: simplify database connection logic
docs: update README with setup instructions
feat(ui): implement dark mode toggle
\`\`\`

Generate guidelines like:
\`\`\`markdown
# Commit Message Guidelines

## Format
Use conventional commits: \`type(scope): description\`

## Style Rules
- **Tense**: Imperative/present ("add", "fix", "implement")
- **Capitalization**: Lowercase first letter
- **Length**: Concise, 40-60 characters
- **Tone**: Technical and specific

## Commit Types
- \`feat\`: New features or capabilities
- \`fix\`: Bug fixes and issue resolutions
- \`refactor\`: Code improvements without new features
- \`docs\`: Documentation updates

## Scope Usage
Use specific component/area names in parentheses (auth, api, ui). Omit scope for general changes like refactoring.

## Description Patterns
Start with action verb (add, implement, resolve, update, simplify). Be specific about what changed. Reference the component or feature affected.

## Examples from History
- feat(auth): add OAuth2 login support
- fix(api): resolve timeout issue in user endpoint
- refactor: simplify database connection logic
\`\`\`

## Important Notes

- Focus on patterns, not on individual commit content
- Generate guidelines that will work for future commits, not just explain past ones
- Keep it practical and easy to follow
- The output will be stored as \`.noto/commit-prompt.md\` and used by an AI to generate commits

Generate the markdown guidelines now based on the commit history provided.
`;

const cacheMiddleware: LanguageModelV2Middleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const key = hashString(JSON.stringify(params));

    const cache = (await CacheManager.get()).commitGenerationCache;
    if (cache && key in cache) return superjson.parse(cache[key]);

    const result = await doGenerate();

    await CacheManager.update((current) => ({
      ...current,
      commitGenerationCache: {
        [key]: superjson.stringify(result),
      },
    }));

    return result;
  },
};

export const generateCommitMessage = async (
  diff: string,
  prompt?: string,
  context?: string,
  forceCache: boolean = false,
) => {
  const model = await getModel();

  const { object } = await generateObject({
    model: !forceCache
      ? wrapLanguageModel({
          model,
          middleware: cacheMiddleware,
        })
      : model,
    schema: z.object({
      message: z.string(),
    }),
    messages: [
      {
        role: "system",
        content: COMMIT_GENERATOR_PROMPT,
      },
      {
        role: "user",
        content: dedent`
        USER GUIDELINES:
        ${prompt ?? DEFAULT_COMMIT_GUIDELINES}
        ${context ? `\nUSER CONTEXT:\n${context}` : ""}

        GIT DIFF:
        ${diff}
      `,
      },
    ],
  });

  return object.message.trim();
};

export const generateCommitGuidelines = async (commits: string[]) => {
  const model = await getModel();

  const { object } = await generateObject({
    model,
    schema: z.object({
      prompt: z.string(),
    }),
    messages: [
      {
        role: "system",
        content: GUIDELINES_GENERATOR_PROMPT,
      },
      {
        role: "user",
        content: dedent`
        COMMIT HISTORY:
        ${commits.join("\n")}`,
      },
    ],
  });

  return object.prompt.trim();
};
