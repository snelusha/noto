import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { gitProcedure } from "~/trpc";

import { getCommits, getGitRoot } from "~/utils/git";
import { findUp } from "~/utils/fs";
import { exit } from "~/utils/process";

export const init = gitProcedure
  .meta({
    description: "initialize a new noto prompt file",
  })
  .mutation(async (opts) => {
    const {} = opts;

    const root = await getGitRoot();
    if (!root) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
          ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
      );
      return await exit(1);
    }

    const cwd = process.cwd();

    const existing = await findUp(".noto/prompt.md", {
      type: "file",
      cwd: root || cwd,
    });

    if (existing) {
      if (!existing.startsWith(cwd)) {
        p.log.warn(
          dedent`${color.yellow("a prompt file already exists!")}
                    ${color.gray(existing)}`,
        );

        const shouldContinue = await p.confirm({
          message: "do you want to create in the current directory anyway?",
          initialValue: false,
        });

        if (p.isCancel(shouldContinue) || !shouldContinue) {
          p.log.error("aborted");
          return await exit(1);
        }
      } else {
        p.log.error(
          dedent`${color.red("a prompt file already exists.")}
                    ${color.gray(existing)}`,
        );
        return await exit(1);
      }
    }

    const commits = await getCommits();
    if (commits.length > 5) {
      const shouldGenerate = await p.confirm({
        message: `do you want to generate a prompt based on your commit history?`,
        initialValue: true,
      });

      if (p.isCancel(shouldGenerate)) {
        p.log.error("aborted");
        return await exit(1);
      }

      if (shouldGenerate) {
        for (const commit of commits) {
          console.log(commit);
        }
      }
    }
  });
