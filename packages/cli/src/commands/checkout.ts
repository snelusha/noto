import { z } from "zod";

import clipboard from "clipboardy";
import { arg, commandValidator, flag } from "@crustjs/validate";
import { bold, green, red } from "@crustjs/style";

import { app } from "~/app";
import { withGit } from "~/plugins/context";
import { log } from "~/ui/log";
import { confirm, filter } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { isBareFlag } from "~/utils/argv";
import {
  checkout as checkoutBranch,
  checkoutLocalBranch,
  getBranches,
  getCurrentBranch,
} from "~/utils/git";
import { exit } from "~/utils/process";

export const checkoutCmd = app
  .sub("checkout")
  .meta({ description: "checkout a branch" })
  .args([
    arg("branch", z.string().optional(), {
      description: "branch to checkout",
    }),
  ])
  .flags({
    copy: flag(z.boolean().default(false), {
      type: "boolean",
      short: "c",
      description: "copy the selected branch to clipboard",
    }),
    create: flag(z.string().optional(), {
      type: "string",
      short: "b",
      description: "create a new branch",
    }),
  })
  .run(
    commandValidator(async ({ args, flags }) => {
      await withGit();

      const branches = await getBranches();
      if (!branches) {
        log.error("failed to fetch branches");
        return await exit(1);
      }

      const currentBranch = await getCurrentBranch();
      const createBare = isBareFlag(process.argv.slice(2), "b", "create");
      const createFlag = createBare || typeof flags.create === "string";
      const targetBranch =
        typeof flags.create === "string" ? flags.create : args.branch;

      if (createFlag && targetBranch) {
        if (branches.includes(targetBranch)) {
          log.error(
            `branch ${red(targetBranch)} already exists in the repository`,
          );
          return await exit(1);
        }

        const result = await checkoutLocalBranch(targetBranch);
        if (!result) {
          log.error(`failed to create and checkout ${bold(targetBranch)}`);
          return await exit(1);
        }

        log.success(`created and checked out ${green(targetBranch)}`);
        return await exit(0);
      }

      if (targetBranch) {
        if (!branches.includes(targetBranch)) {
          log.error(
            `branch ${red(targetBranch)} does not exist in the repository`,
          );

          let createBranch = false;
          try {
            createBranch = await confirm({
              message: `do you want to create branch ${green(targetBranch)}?`,
            });
          } catch (error) {
            if (isCancelled(error)) {
              log.error("aborted");
              return await exit(1);
            }
            throw error;
          }

          if (createBranch) {
            const result = await checkoutLocalBranch(targetBranch);
            if (!result) {
              log.error(`failed to create and checkout ${bold(targetBranch)}`);
              return await exit(1);
            }

            log.success(`created and checked out ${green(targetBranch)}`);
            return await exit(0);
          }

          return await exit(1);
        }

        if (targetBranch === currentBranch) {
          log.error(`${red("already on branch")} ${green(targetBranch)}`);
          return await exit(1);
        }

        const result = await checkoutBranch(targetBranch);
        if (!result) {
          log.error(`failed to checkout ${bold(targetBranch)}`);
          return await exit(1);
        }

        log.success(`checked out ${green(targetBranch)}`);
        return await exit(0);
      }

      if (branches.length === 0) {
        log.error("no branches found in the repository");
        return await exit(1);
      }

      let branch: string;
      try {
        branch = await filter({
          message: "select a branch to checkout",
          choices: branches.map((name) => ({
            label: name === currentBranch ? `${name} (current branch)` : name,
            value: name,
            hint: name === currentBranch ? "current branch" : undefined,
          })),
          default: currentBranch,
        });
      } catch (error) {
        if (isCancelled(error)) {
          log.error("nothing selected!");
          return await exit(1);
        }
        throw error;
      }

      if (!branch) {
        log.error("no branch selected");
        return await exit(1);
      }

      if (flags.copy) {
        clipboard.writeSync(branch);
        log.success(`copied ${green(branch)} to clipboard`);
        return await exit(0);
      }

      if (branch === currentBranch) {
        log.error(red("already on branch"));
        return await exit(1);
      }

      const result = await checkoutBranch(branch);
      if (!result) {
        log.error(`failed to checkout ${bold(branch)}`);
        return await exit(1);
      }

      log.success(`checked out ${green(branch)}`);
      return await exit(0);
    }),
  );
