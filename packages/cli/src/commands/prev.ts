import { z } from "zod";

import dedent from "dedent";
import clipboard from "clipboardy";
import { commandValidator, flag } from "@crustjs/validate";
import { cyan, dim, red } from "@crustjs/style";

import { app } from "~/app";
import { withGit } from "~/plugins/context";
import { log } from "~/ui/log";
import { input } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { commit } from "~/utils/git";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

export const prevCmd = app
  .sub("prev")
  .meta({ description: "access the last generated commit" })
  .flags({
    copy: flag(z.boolean().default(false), {
      type: "boolean",
      short: "c",
      description: "copy the last commit to clipboard",
    }),
    preview: flag(z.boolean().default(false), {
      type: "boolean",
      short: "p",
      description: "preview the last generated message without committing",
    }),
    amend: flag(z.boolean().default(false), {
      type: "boolean",
      description: "amend the last commit with the last message",
    }),
  })
  .run(
    commandValidator(async ({ flags }) => {
      const { git } = await withGit({ repoRequired: false });

      let lastGeneratedMessage = (await StorageManager.get())
        .lastGeneratedMessage;

      if (!lastGeneratedMessage) {
        log.error(red("no previous commit message found"));
        return await exit(1);
      }

      const isAmend = flags.amend;

      if (flags.preview) {
        log.step(lastGeneratedMessage);
      } else {
        if (!git.isRepository) {
          log.error(
            dedent`${red("no git repository found in cwd.")}
              ${dim(`run ${cyan("`git init`")} to initialize a new repository.`)}`,
          );
          return await exit(1);
        }

        try {
          lastGeneratedMessage = await input({
            message: "edit the last generated commit message",
            default: lastGeneratedMessage,
            placeholder: lastGeneratedMessage,
          });
        } catch (error) {
          if (isCancelled(error)) {
            log.error(red("nothing changed!"));
            return await exit(1);
          }
          throw error;
        }

        log.step(lastGeneratedMessage);
      }

      if (flags.copy) {
        clipboard.writeSync(lastGeneratedMessage);
        log.dim("copied last generated commit message to clipboard");
      }

      if (!git.diff && !isAmend) {
        log.error(
          dedent`${red("no staged changes found.")}
              ${dim(`run ${cyan("`git add <file>`")} or ${cyan("`git add .`")} to stage changes.`)}`,
        );
        return await exit(1);
      }

      await StorageManager.update((current) => ({
        ...current,
        lastGeneratedMessage,
      }));

      const success = await commit(lastGeneratedMessage, isAmend);
      if (success) {
        log.dim("commit successful");
      } else {
        log.error(red("failed to commit changes"));
      }

      return await exit(0);
    }),
  );
