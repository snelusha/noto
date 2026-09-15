import fs from "node:fs/promises";
import path from "node:path";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { prepareCommand } from "~/cli-runtime";

import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";
import { getCommits, getGitRoot } from "~/utils/git";
import { generateCommitGuidelines } from "~/ai";

const EMPTY_TEMPLATE = dedent`
  # Commit Message Guidelines
  
  # Add your custom guidelines here.
  # When no guidelines are present, noto will use conventional commits format by default.`;

export async function init(input: {
  root?: boolean;
  generate?: boolean;
  message?: string | boolean;
  force?: boolean;
  model?: string;
}): Promise<void> {
  await prepareCommand({ authRequired: true, repoRequired: true });

  const root = await getGitRoot();

  let promptFile = root;
  const cwd = process.cwd();

  const existingPromptFile = await getPromptFile();

  let prompt: string | null = null;

  if (existingPromptFile && input.force) {
    promptFile = path.dirname(path.dirname(existingPromptFile));
  } else if (existingPromptFile) {
    if (!existingPromptFile.startsWith(cwd)) {
      p.log.warn(
        dedent`${color.yellow("a prompt file already exists!")}
                  ${color.gray(existingPromptFile)}`,
      );

      const shouldContinue = await p.confirm({
        message: "do you want to create in the current directory instead?",
        initialValue: true,
      });

      if (p.isCancel(shouldContinue) || !shouldContinue) {
        p.log.error("aborted");
        return await exit(1);
      }

      promptFile = cwd;
    } else {
      p.log.error(
        dedent`${color.red("a prompt file already exists.")}
                  ${color.gray(existingPromptFile)}`,
      );
      return await exit(1);
    }
  }

  if (!input.force && root !== cwd && !input.root) {
    const shouldUseRoot = await p.confirm({
      message: "do you want to create the prompt file in the git root?",
      initialValue: true,
    });

    if (p.isCancel(shouldUseRoot)) {
      p.log.error("aborted");
      return await exit(1);
    }

    if (!shouldUseRoot) promptFile = cwd;
  }

  let context = input.message;
  if (typeof context === "string") {
    context = context.trim();
    if (!context) {
      p.log.error(color.red("guideline context cannot be empty!"));
      return await exit(1);
    }
  } else if (context === true) {
    const enteredContext = await p.text({
      message: "provide context for the commit message guidelines",
      placeholder: "describe your project's commit message style",
    });

    if (p.isCancel(enteredContext)) {
      p.log.error("aborted");
      return await exit(1);
    }

    context = enteredContext.trim();
    if (!context) {
      p.log.error(color.red("guideline context cannot be empty!"));
      return await exit(1);
    }
  }

  const commits = await getCommits(20, true);
  let generate = input.generate || typeof context === "string";

  if (input.generate && (!commits || commits.length < 5)) {
    p.log.error(
      dedent`${color.red("not enough commits to generate a prompt file.")}
                ${color.gray("at least 5 commits are required.")}`,
    );
    return await exit(1);
  }

  if (!generate && commits && commits.length >= 5) {
    const shouldGenerate = await p.confirm({
      message:
        "do you want to generate a prompt file based on existing commits?",
      initialValue: true,
    });

    if (p.isCancel(shouldGenerate)) {
      p.log.error("aborted");
      return await exit(1);
    }

    generate = shouldGenerate;
  }

  const spin = p.spinner();

  if (generate) {
    spin.start("generating commit message guidelines");
    prompt = await generateCommitGuidelines(
      commits ?? [],
      input.model,
      typeof context === "string" ? context : undefined,
    );
    spin.stop(color.green("generated commit message guidelines!"));
  } else {
    prompt = EMPTY_TEMPLATE;
  }

  try {
    const dir = `${promptFile}/.noto`;
    await fs.mkdir(dir, { recursive: true });

    const filePath = `${dir}/commit-prompt.md`;
    await fs.writeFile(filePath, prompt, "utf-8");

    p.log.success(dedent`${color.green("prompt file created!")}
                      ${color.gray(filePath)}`);
    return await exit(0);
  } catch {
    p.log.error(color.red("failed to create the prompt file!"));
  }
}
