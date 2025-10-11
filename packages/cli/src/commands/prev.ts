import { z } from "trpc-cli";

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
      apply: z
        .boolean()
        .meta({ description: "commit the last generated message", alias: "a" }),
      edit: z.boolean().meta({
        description: "edit the last generated commit message",
        alias: "e",
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

    const isEditMode = input.edit;
    const isAmend = input.amend;

    if (isAmend && !isEditMode) {
      p.log.error(color.red("the --amend option requires the --edit option"));
      return await exit(1);
    }

    p.log.step(
      isEditMode
        ? color.white(lastGeneratedMessage)
        : color.green(lastGeneratedMessage),
    );

    if (isEditMode) {
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

      await StorageManager.update((current) => ({
        ...current,
        lastGeneratedMessage: editedMessage,
      }));

      p.log.step(color.green(lastGeneratedMessage));
    }

    if (input.copy) {
      clipboard.writeSync(lastGeneratedMessage);
      p.log.step(
        color.dim("copied last generated commit message to clipboard"),
      );
    }

    if (input.apply || isAmend) {
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

      const success = await commit(lastGeneratedMessage, isAmend);
      if (success) {
        p.log.step(color.dim("commit successful"));
      } else {
        p.log.error(color.red("failed to commit changes"));
      }
    }

    return await exit(0);
  });
