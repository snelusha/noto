import fs from "node:fs/promises";

import * as p from "@clack/prompts";
import color from "picocolors";
import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "~/utils/git";
import { isPrerelease } from "~/utils/installation-info";
import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

export interface NotoContext {
  git: { isRepository: boolean; diff: string | null };
  noto: { prompt: string | null };
}

export async function prepareCommand(
  options: {
    authRequired?: boolean;
    repoRequired?: boolean;
    diffRequired?: boolean;
    promptRequired?: boolean;
    inspectGit?: boolean;
    intro?: boolean;
  } = {},
): Promise<NotoContext> {
  const {
    authRequired = false,
    repoRequired = false,
    diffRequired = false,
    promptRequired = false,
    inspectGit = false,
    intro = true,
  } = options;

  if (intro) {
    console.log();
    if (isPrerelease)
      p.intro(`${color.bgGreen(color.black(" @snelusha/noto [Prerelease] "))}`);
    else p.intro(`${color.bgCyan(color.black(" @snelusha/noto "))}`);
  }

  if (authRequired) {
    const storage = await StorageManager.get();
    const apiKey = process.env.NOTO_API_KEY || storage.llm?.apiKey;
    if (!apiKey) {
      p.log.error(dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`);
      await exit(1);
    }
  }

  const shouldInspectGit =
    inspectGit || repoRequired || diffRequired || promptRequired;
  const isRepository = shouldInspectGit && (await isGitRepository());
  if (repoRequired && !isRepository) {
    p.log.error(dedent`${color.red("no git repository found in cwd.")}
      ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`);
    await exit(1);
  }

  const diff = isRepository ? await getStagedDiff() : null;
  if (diffRequired && !diff) {
    p.log.error(dedent`${color.red("no staged changes found.")}
      ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`);
    await exit(1);
  }

  let prompt: string | null = null;
  if (promptRequired) {
    const promptPath = await getPromptFile();
    if (promptPath) {
      try {
        prompt = await fs.readFile(promptPath, "utf-8");
      } catch {}
    }
  }

  return { git: { isRepository, diff }, noto: { prompt } };
}
