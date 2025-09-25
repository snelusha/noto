import fs from "node:fs/promises";

import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { gitProcedure } from "~/trpc";

import { getCommits, getGitRoot } from "~/utils/git";
import { findUp } from "~/utils/fs";
import { exit } from "~/utils/process";
import { generatePrompt } from "~/ai";

export const init = gitProcedure
  .meta({
    description: "initialize a new noto prompt file",
  })
  .input(
    z.object({
      root: z.boolean().meta({
        description: "create the prompt file in the git root",
      }),
      generate: z.boolean().meta({
        description: "generate a prompt based on commit history",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    const root = await getGitRoot();
    if (!root) {
      p.log.error(
        dedent`${color.red("no git repository found in cwd.")}
          ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
      );
      return await exit(1);
    }

    let promptDir = root;
    const cwd = process.cwd();

    const existing = await findUp(".noto/prompt.md", {
      type: "file",
      cwd: root || cwd,
    });

    let prompt: string;

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

        promptDir = cwd;
      } else {
        p.log.error(
          dedent`${color.red("a prompt file already exists.")}
                    ${color.gray(existing)}`,
        );
        return await exit(1);
      }
    }

    if (root !== cwd && !input.root) {
      const shouldUseRoot = await p.confirm({
        message: "do you want to create the prompt file in the git root?",
        initialValue: true,
      });

      if (p.isCancel(shouldUseRoot)) {
        p.log.error("aborted");
        return await exit(1);
      }

      if (!shouldUseRoot) {
        promptDir = cwd;
      }
    }

    const commits = await getCommits();

    let generate = input.generate;

    if (generate) {
      if (commits.length < 5) {
        p.log.error(
          dedent`${color.red("not enough commits to generate a prompt.")}
                    ${color.dim("make at least 5 commits to generate a prompt.")}`,
        );
        return await exit(1);
      }
    } else if (commits.length >= 5) {
      const shouldGenerate = await p.confirm({
        message: `do you want to generate a prompt based on your commit history?`,
        initialValue: true,
      });

      if (p.isCancel(shouldGenerate)) {
        p.log.error("aborted");
        return await exit(1);
      }

      generate = shouldGenerate;
    }

    // todo: add default prompt
    prompt ||= dedent`# Noto Prompt`;

    if (generate) {
      prompt = await generatePrompt(commits);
    }

    p.log.success(
      color.green(
        `prompt file created at ${color.gray(`${promptDir}/.noto/prompt.md`)}`,
      ),
    );

    const dir = `${promptDir}/.noto`;
    await fs.mkdir(dir, { recursive: true });
    const file = `${dir}/prompt.md`;
    await fs.writeFile(file, prompt, "utf-8");
  });
