import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { gitProcedure } from "~/trpc";

import {
  checkout as checkoutBranch,
  getCurrentBranch,
  getBranches,
  checkoutLocalBranch,
} from "~/utils/git";
import { exit } from "~/utils/process";

export const checkout = gitProcedure
  .meta({
    description: "checkout a branch",
  })
  .input(
    z.object({
      copy: z.boolean().meta({
        description: "copy the selected branch to clipboard",
        alias: "c",
      }),
      create: z
        .union([z.boolean(), z.string()])
        .optional()
        .meta({ description: "create a new branch", alias: "b" }),
      branch: z.string().optional().meta({ positional: true }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    const branches = await getBranches();
    if (!branches) {
      p.log.error("failed to fetch branches");
      return await exit(1);
    }

    const currentBranch = await getCurrentBranch();

    const targetBranch =
      typeof input.create === "string" ? input.create : input.branch;
    const createFlag =
      input.create === true || typeof input.create === "string";

    if (createFlag && targetBranch) {
      if (branches.includes(targetBranch)) {
        p.log.error(
          `branch ${color.red(targetBranch)} already exists in the repository`,
        );
        return await exit(1);
      }

      const result = await checkoutLocalBranch(targetBranch);
      if (!result) {
        p.log.error(
          `failed to create and checkout ${color.bold(targetBranch)}`,
        );
        return await exit(1);
      }

      p.log.success(`created and checked out ${color.green(targetBranch)}`);
      return await exit(0);
    }

    if (targetBranch) {
      if (!branches.includes(targetBranch)) {
        p.log.error(
          `branch ${color.red(targetBranch)} does not exist in the repository`,
        );

        const createBranch = await p.confirm({
          message: `do you want to create branch ${color.green(targetBranch)}?`,
        });

        if (p.isCancel(createBranch)) {
          p.log.error("aborted");
          return await exit(1);
        }

        if (createBranch) {
          const result = await checkoutLocalBranch(targetBranch);
          if (!result) {
            p.log.error(
              `failed to create and checkout ${color.bold(targetBranch)}`,
            );
            return await exit(1);
          }

          p.log.success(`created and checked out ${color.green(targetBranch)}`);
          return await exit(0);
        }

        return await exit(1);
      }

      if (targetBranch === currentBranch) {
        p.log.error(
          `${color.red("already on branch")} ${color.green(targetBranch)}`,
        );
        return await exit(1);
      }

      const result = await checkoutBranch(targetBranch);
      if (!result) {
        p.log.error(`failed to checkout ${color.bold(targetBranch)}`);
        return await exit(1);
      }

      p.log.success(`checked out ${color.green(targetBranch)}`);
      return await exit(0);
    }

    if (branches.length === 0) {
      p.log.error("no branches found in the repository");
      return await exit(1);
    }

    const branch = await p.select({
      message: "select a branch to checkout",
      options: branches.map((branch) => ({
        value: branch,
        label: color.bold(
          branch === currentBranch ? color.green(branch) : branch,
        ),
        hint: branch === currentBranch ? "current branch" : undefined,
      })),
      initialValue: currentBranch,
    });

    if (p.isCancel(branch)) {
      p.log.error("nothing selected!");
      return await exit(1);
    }

    if (!branch) {
      p.log.error("no branch selected");
      return await exit(1);
    }

    if (input.copy) {
      clipboard.writeSync(branch);
      p.log.success(`copied ${color.green(branch)} to clipboard`);
      return await exit(0);
    }

    if (branch === currentBranch) {
      p.log.error(`${color.red("already on branch")}`);
      return await exit(1);
    }

    const result = await checkoutBranch(branch!);
    if (!result) {
      p.log.error(`failed to checkout ${color.bold(branch)}`);
      return await exit(1);
    }

    p.log.success(`checked out ${color.green(branch)}`);
    await exit(0);
  });
