import dedent from "dedent";
import { cyan, dim, red } from "@crustjs/style";

import { renderIntro } from "~/ui/intro";
import { log } from "~/ui/log";
import { getStagedDiff, isGitRepository } from "~/utils/git";
import { StorageManager } from "~/utils/storage";
import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";

import fs from "node:fs/promises";

export type GitContext = {
  isRepository: boolean;
  diff: string | false;
};

export type NotoContext = {
  prompt: string | null;
};

export async function requireAuth() {
  const storage = await StorageManager.get();
  const apiKey = process.env.NOTO_API_KEY || storage.llm?.apiKey;

  if (!apiKey) {
    log.error(
      dedent`${red("noto api key is missing.")}
        ${dim(`run ${cyan("`noto config key`")} to set it up.`)}`,
    );
    await exit(1);
  }
}

export async function loadGitContext(options?: {
  repoRequired?: boolean;
  diffRequired?: boolean;
  promptRequired?: boolean;
}): Promise<{ git: GitContext; noto: NotoContext }> {
  const repoRequired = options?.repoRequired ?? true;
  const diffRequired = options?.diffRequired ?? false;
  const promptRequired = options?.promptRequired ?? false;

  const isRepository = await isGitRepository();

  if (repoRequired && !isRepository) {
    log.error(
      dedent`${red("no git repository found in cwd.")}
          ${dim(`run ${cyan("`git init`")} to initialize a new repository.`)}`,
    );
    await exit(1);
  }

  const diff = isRepository ? await getStagedDiff() : false;

  if (diffRequired && !diff) {
    log.error(
      dedent`${red("no staged changes found.")}
          ${dim(`run ${cyan("`git add <file>`")} or ${cyan("`git add .`")} to stage changes.`)}`,
    );
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

  return {
    git: {
      isRepository,
      diff,
    },
    noto: {
      prompt,
    },
  };
}

export function withIntro() {
  renderIntro();
}

export async function withAuth() {
  withIntro();
  await requireAuth();
}

export async function withGit(options?: {
  repoRequired?: boolean;
  diffRequired?: boolean;
  promptRequired?: boolean;
}) {
  withIntro();
  return loadGitContext(options);
}

export async function withAuthedGit(options?: {
  repoRequired?: boolean;
  diffRequired?: boolean;
  promptRequired?: boolean;
}) {
  withIntro();
  await requireAuth();
  return loadGitContext(options);
}
