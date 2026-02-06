import { z } from "zod";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";
import clipboard from "clipboardy";

import { gitProcedure } from "~/trpc";

import { StorageManager } from "~/utils/storage";

import { commit } from "~/utils/git";
import { exit } from "~/utils/process";

export const prev = gitProcedure
  .meta({
    description: "access the last generated commit",
    repoRequired: false,
  })
  .input(
    z.object({
      copy: z
        .boolean()
        .meta({ description: "copy the last commit to clipboard", alias: "c" }),
      preview: z.boolean().meta({
        description: "preview the last generated message without committing",
        alias: "p",
      }),
      amend: z.boolean().meta({
        description: "amend the last commit with the last message",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input, ctx } = opts;

    let lastGeneratedMessage = (await StorageManager.get())
      .lastGeneratedMessage;

    if (!lastGeneratedMessage) {
      p.log.error(color.red("no previous commit message found"));
      return await exit(1);
    }

    const isAmend = input.amend;

    if (input.preview) {
      p.log.step(color.green(lastGeneratedMessage));
    } else {
      p.log.step(color.white(lastGeneratedMessage));

      const editedMessage = await p.text({
        message: "edit the last generated commit message",
        initialValue: lastGeneratedMessage,
        placeholder: lastGeneratedMessage,
      });

      if (p.isCancel(editedMessage)) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }

      lastGeneratedMessage = editedMessage;
      p.log.step(color.green(lastGeneratedMessage));
    }

    if (input.copy) {
      clipboard.writeSync(lastGeneratedMessage);
      p.log.step(
        color.dim("copied last generated commit message to clipboard"),
      );
    }

    if (!input.preview) {
      if (!ctx.git.isRepository) {
        p.log.error(
          dedent`${color.red("no git repository found in cwd.")}
              ${color.dim(`run ${color.cyan("`git init`")} to initialize a new repository.`)}`,
        );
        return await exit(1);
      }

      if (!ctx.git.diff && !isAmend) {
        p.log.error(
          dedent`${color.red("no staged changes found.")}
              ${color.dim(`run ${color.cyan("`git add <file>`")} or ${color.cyan("`git add .`")} to stage changes.`)}`,
        );
        return await exit(1);
      }

      await StorageManager.update((current) => ({
        ...current,
        lastGeneratedMessage,
      }));

      const success = await commit(lastGeneratedMessage, isAmend);
      if (success) {
        p.log.step(color.dim("commit successful"));
      } else {
        p.log.error(color.red("failed to commit changes"));
      }
    }

    return await exit(0);
  });
