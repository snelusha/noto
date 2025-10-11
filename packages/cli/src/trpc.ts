import fs from "node:fs/promises";

import { trpcServer } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "~/utils/git";
import { StorageManager } from "~/utils/storage";
import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";

import type { TrpcCliMeta } from "trpc-cli";

export type Meta = TrpcCliMeta & {
  intro?: boolean;
  authRequired?: boolean;
  repoRequired?: boolean;
  diffRequired?: boolean;
  promptRequired?: boolean;
};

export const t = trpcServer.initTRPC.meta<Meta>().create({
  defaultMeta: {
    intro: true,
    authRequired: true,
    repoRequired: true,
    diffRequired: false,
    promptRequired: false,
  },
});

export const authMiddleware = t.middleware(async (opts) => {
  const { meta, next } = opts;

  const storage = await StorageManager.get();
  const apiKey = process.env.NOTO_API_KEY || storage.llm?.apiKey;

  if (meta?.authRequired && !apiKey) {
    p.log.error(
      dedent`${color.red("noto api key is missing.")}
        ${color.dim(`run ${color.cyan("`noto config key`")} to set it up.`)}`,
    );
    return await exit(1);
  }

  return next();
});

export const gitMiddleware = t.middleware(async (opts) => {
  const { meta, next } = opts;

  const isRepository = await isGitRepository();
  if (meta?.repoRequired && !isRepository) {
    p.log.error(
      dedent`${color.red("no git repository found in cwd.")}
          ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
    );
    return await exit(1);
  }

  const diff = isRepository && (await getStagedDiff());
  if (meta?.diffRequired && !diff) {
    p.log.error(
      dedent`${color.red("no staged changes found.")}
          ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`,
    );
    return await exit(1);
  }

  let prompt: string | null = null;

  if (meta?.promptRequired) {
    const promptPath = await getPromptFile();

    if (promptPath) {
      try {
        prompt = await fs.readFile(promptPath, "utf-8");
      } catch {}
    }
  }

  return next({
    ctx: {
      noto: {
        prompt,
      },
      git: {
        isRepository,
        diff,
      },
    },
  });
});

export const baseProcedure = t.procedure.use((opts) => {
  const { meta, next } = opts;

  if (meta?.intro) {
    console.log();
    p.intro(`${color.bgCyan(color.black(" @snelusha/noto "))}`);
  }

  return next();
});

export const authProcedure = baseProcedure.use(authMiddleware);

export const gitProcedure = baseProcedure.use(gitMiddleware);

export const authedGitProcedure = baseProcedure
  .use(authMiddleware)
  .use(gitMiddleware);
