import { z } from "zod";

import clipboard from "clipboardy";
import { APICallError, RetryError } from "ai";
import { commandValidator, flag } from "@crustjs/validate";

import { generateCommitMessage } from "~/ai";
import { app } from "~/app";
import { withAuthedGit } from "~/plugins/context";
import { log } from "~/ui/log";
import { input, spinner } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { isBareFlag } from "~/utils/argv";
import { commit, push } from "~/utils/git";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

function safeParseErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "string") return;
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.message ?? parsed?.message;
  } catch {
    return;
  }
}

export const notoCmd = app
  .meta({ description: "generate a commit message" })
  .flags({
    message: flag(z.string().optional(), {
      type: "string",
      short: "m",
      description: "provide context for commit message",
    }),
    copy: flag(z.boolean().default(false), {
      type: "boolean",
      short: "c",
      description: "copy the generated message to clipboard",
    }),
    preview: flag(z.boolean().default(false), {
      type: "boolean",
      short: "p",
      description: "preview the generated message without committing",
    }),
    push: flag(z.boolean().default(false), {
      type: "boolean",
      description: "commit and push the changes",
    }),
    force: flag(z.boolean().default(false), {
      type: "boolean",
      short: "f",
      description: "bypass cache and force regeneration of commit message",
    }),
    manual: flag(z.string().optional(), {
      type: "string",
      description: "custom commit message",
    }),
    model: flag(z.string().optional(), {
      type: "string",
      description: "specify the model to use",
    }),
  })
  .run(
    commandValidator(async ({ flags }) => {
      const { git, noto } = await withAuthedGit({
        diffRequired: true,
        promptRequired: true,
      });

      const manualPrompt = isBareFlag(
        process.argv.slice(2),
        "manual",
        "manual",
      );
      const messagePrompt = isBareFlag(process.argv.slice(2), "m", "message");

      try {
        if (flags.manual !== undefined || manualPrompt) {
          let message: string;

          if (typeof flags.manual === "string") {
            message = flags.manual.trim();
            if (!message) {
              log.error("commit message cannot be empty!");
              return await exit(1);
            }
          } else {
            try {
              message = await input({
                message: "enter the commit message",
                placeholder: "chore: init repo",
              });
            } catch (error) {
              if (isCancelled(error)) {
                log.error("nothing changed!");
                return await exit(1);
              }
              throw error;
            }
          }

          log.step(message);

          await StorageManager.update((current) => ({
            ...current,
            lastGeneratedMessage: message,
          }));

          const success = await commit(message);
          if (success) {
            log.dim("commit successful");
          } else {
            log.error("failed to commit changes");
          }

          return await exit(0);
        }

        let context = flags.message;
        if (typeof context === "string") {
          context = context.trim();
        } else if (messagePrompt) {
          try {
            context = await input({
              message: "provide context for the commit message",
              placeholder: "describe the changes",
            });
          } catch (error) {
            if (isCancelled(error)) {
              log.error("nothing changed!");
              return await exit(1);
            }
            throw error;
          }
        }

        const message = await spinner({
          message: "generating commit message",
          task: async () =>
            generateCommitMessage(
              git.diff as string,
              noto.prompt as string,
              typeof context === "string" ? context : undefined,
              flags.force,
              flags.model,
            ),
        });

        let editedMessage: string;
        try {
          editedMessage = await input({
            message: "edit the generated commit message",
            default: message,
            placeholder: message,
          });
        } catch (error) {
          if (isCancelled(error)) {
            log.error("nothing changed!");
            return await exit(1);
          }
          throw error;
        }

        log.step(editedMessage);

        await StorageManager.update((current) => ({
          ...current,
          lastGeneratedMessage: editedMessage,
        }));

        if (flags.copy) {
          clipboard.writeSync(editedMessage);
          log.dim("copied commit message to clipboard");
        }

        if (!flags.preview) {
          const success = await commit(editedMessage);
          if (success) {
            log.dim("commit successful");
          } else {
            log.error("failed to commit changes");
          }
        }

        if (flags.push) {
          const success = await push();
          if (success) {
            log.dim("push successful");
          } else {
            log.error("failed to push changes");
          }
        }

        return await exit(0);
      } catch (error) {
        let msg: string | undefined;

        if (
          RetryError.isInstance(error) &&
          APICallError.isInstance(error.lastError)
        ) {
          msg = safeParseErrorMessage(error.lastError.responseBody);
        }

        const suffix = msg ? `\n${msg}` : "";
        log.error(`failed to generate commit message${suffix}`);
        await exit(1);
      }
    }),
  );
