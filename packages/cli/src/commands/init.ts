import fs from "node:fs/promises";

import { z } from "zod";

import dedent from "dedent";
import { commandValidator, flag } from "@crustjs/validate";
import { gray, green, red, yellow } from "@crustjs/style";

import { generateCommitGuidelines } from "~/ai";
import { app } from "~/app";
import { withAuth } from "~/plugins/context";
import { log } from "~/ui/log";
import { confirm, spinner } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { isBareFlag } from "~/utils/argv";
import { getCommits, getGitRoot } from "~/utils/git";
import { getPromptFile } from "~/utils/prompt";
import { exit } from "~/utils/process";

const EMPTY_TEMPLATE = dedent`
  # Commit Message Guidelines
  
  # Add your custom guidelines here.
  # When no guidelines are present, noto will use conventional commits format by default.`;

export const initCmd = app
  .sub("init")
  .meta({ description: "initialize noto in the repository" })
  .flags({
    root: flag(z.boolean().default(false), {
      type: "boolean",
      description: "create the prompt file in the git root",
    }),
    generate: flag(z.boolean().default(false), {
      type: "boolean",
      description: "generate a prompt file based on existing commits",
    }),
    model: flag(z.string().optional(), {
      type: "string",
      description: "specify the model to use",
    }),
  })
  .run(
    commandValidator(async ({ flags }) => {
      await withAuth();

      const root = await getGitRoot();
      let promptFile = root;
      const cwd = process.cwd();
      const existingPromptFile = await getPromptFile();
      let prompt: string | null = null;

      if (existingPromptFile) {
        if (!existingPromptFile.startsWith(cwd)) {
          log.warn(
            dedent`${yellow("a prompt file already exists!")}
                    ${gray(existingPromptFile)}`,
          );

          let shouldContinue = false;
          try {
            shouldContinue = await confirm({
              message:
                "do you want to create in the current directory instead?",
              default: true,
            });
          } catch (error) {
            if (isCancelled(error)) {
              log.error("aborted");
              return await exit(1);
            }
            throw error;
          }

          if (!shouldContinue) {
            log.error("aborted");
            return await exit(1);
          }

          promptFile = cwd;
        } else {
          log.error(
            dedent`${red("a prompt file already exists.")}
                    ${gray(existingPromptFile)}`,
          );
          return await exit(1);
        }
      }

      if (root !== cwd && !flags.root) {
        let shouldUseRoot = true;
        try {
          shouldUseRoot = await confirm({
            message: "do you want to create the prompt file in the git root?",
            default: true,
          });
        } catch (error) {
          if (isCancelled(error)) {
            log.error("aborted");
            return await exit(1);
          }
          throw error;
        }

        if (!shouldUseRoot) promptFile = cwd;
      }

      const commits = await getCommits(20, true);
      let generate = flags.generate;

      if (generate) {
        if (!commits || commits.length < 5) {
          log.error(
            dedent`${red("not enough commits to generate a prompt file.")}
                    ${gray("at least 5 commits are required.")}`,
          );
          return await exit(1);
        }
      } else if (commits && commits.length >= 5) {
        let shouldGenerate = false;
        try {
          shouldGenerate = await confirm({
            message:
              "do you want to generate a prompt file based on existing commits?",
            default: true,
          });
        } catch (error) {
          if (isCancelled(error)) {
            log.error("aborted");
            return await exit(1);
          }
          throw error;
        }

        generate = shouldGenerate;
      }

      if (commits && generate) {
        prompt = await spinner({
          message: "generating commit message guidelines",
          task: async () => generateCommitGuidelines(commits, flags.model),
        });
        log.success(green("generated commit message guidelines!"));
      } else {
        prompt = EMPTY_TEMPLATE;
      }

      try {
        const dir = `${promptFile}/.noto`;
        await fs.mkdir(dir, { recursive: true });

        const filePath = `${dir}/commit-prompt.md`;
        await fs.writeFile(filePath, prompt, "utf-8");

        log.success(dedent`${green("prompt file created!")}
                        ${gray(filePath)}`);
        return await exit(0);
      } catch {
        log.error(red("failed to create the prompt file!"));
        return await exit(1);
      }
    }),
  );
