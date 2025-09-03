import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { getStagedDiff, isGitRepository } from "~/utils/git";
import { exit } from "~/utils/process";

import { t } from "~/trpc";

import type { Command } from "~/types";

interface WithRepositoryOptions {
  enabled?: boolean;
}

export const repositoryProcedure = t.procedure.use(async ({ next }) => {
  const isRepo = await isGitRepository();
  if (!isRepo) {
    p.log.error(
      dedent`${color.red("no git repository found in cwd.")}
        ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
    );
    return await exit(1);
  }

  const diff = await getStagedDiff();

  return next({
    ctx: {
      isRepo,
      diff,
    },
  });
});

export const withRepository = (
  fn: Command["execute"],
  options: WithRepositoryOptions = { enabled: true },
): Command["execute"] => {
  return async (opts) => {
    const isRepo = await isGitRepository();
    if (!isRepo && options.enabled) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
          ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
      );
      return await exit(1);
    }

    opts.isRepo = isRepo;

    if (isRepo) {
      const diff = await getStagedDiff();
      if (!diff && options.enabled) {
        p.log.error(
          dedent`${color.red("no staged changes found.")}
          ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`,
        );
        return await exit(1);
      }

      opts.diff = diff;
    }

    return fn(opts);
  };
};
