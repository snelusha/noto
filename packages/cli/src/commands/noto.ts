import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { withAuth } from "~/middleware/auth";
import { repositoryProcedure, withRepository } from "~/middleware/git";

import { generateCommitMessage } from "~/ai";

import { StorageManager } from "~/utils/storage";

import { commit, isFirstCommit, INIT_COMMIT_MESSAGE, push } from "~/utils/git";
import { exit } from "~/utils/process";

import type { Command } from "~/types";

export const noto = repositoryProcedure
  .meta({
    default: true,
  })
  .query(() => console.log("noto command executed"));

const availableTypes = [
  "chore",
  "feat",
  "fix",
  "docs",
  "refactor",
  "perf",
  "test",
];

const commitTypeOptions = availableTypes.map((type) => ({
  label: type,
  value: type,
}));

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [
    {
      type: String,
      flag: "--type",
      alias: "-t",
      description: "generate commit message based on type",
    },
    {
      type: String,
      flag: "--message",
      alias: "-m",
      description: "provide context for the commit message",
    },
    {
      type: Boolean,
      flag: "--copy",
      alias: "-c",
      description: "copy the generated commit message to clipboard",
    },
    {
      type: Boolean,
      flag: "--apply",
      alias: "-a",
      description: "commit the generated message directly",
    },
    {
      type: Boolean,
      flag: "--push",
      alias: "-p",
      description: "commit and push the changes",
    },
    {
      type: Boolean,
      flag: "--manual",
      description: "commit and push the changes",
    },
  ],
  execute: withAuth(
    withRepository(async (options) => {
      const spin = p.spinner();
      try {
        const { diff } = options;

        const manual = options["--manual"];
        if (manual) {
          const message = await p.text({
            message: "edit the generated commit message",
            placeholder: "chore: init repo",
          });

          if (p.isCancel(message)) {
            p.log.error(color.red("nothing changed!"));
            return await exit(1);
          }

          p.log.step(color.green(message));

          await StorageManager.update((current) => ({
            ...current,
            lastGeneratedMessage: message,
          }));

          const success = await commit(message);
          if (success) {
            p.log.step(color.dim("commit successful"));
          } else {
            p.log.error(color.red("failed to commit changes"));
          }

          return await exit(0);
        }
        const type = options["--type"];

        if (
          (typeof type === "string" && !availableTypes.includes(type)) ||
          typeof type === "boolean"
        ) {
          const type = await p.select({
            message: "select the type of commit message",
            options: commitTypeOptions,
          });

          if (p.isCancel(type)) {
            p.log.error(color.red("nothing selected!"));
            return await exit(1);
          }

          options.type = type;
        } else if (typeof type === "string") {
          options.type = type;
        }

        const context = options["--message"];
        if (typeof context === "string") {
          options.context = context;
        } else if (typeof context === "boolean") {
          const context = await p.text({
            message: "provide context for the commit message",
            placeholder: "describe the changes",
          });

          if (p.isCancel(context)) {
            p.log.error(color.red("nothing changed!"));
            return await exit(1);
          }

          options.context = context;
        }

        spin.start("generating commit message");

        let message = null;

        if (!(await isFirstCommit())) {
          message = await generateCommitMessage(
            diff,
            options.type,
            options.context,
          );
        } else {
          message = INIT_COMMIT_MESSAGE;
        }

        spin.stop(color.white(message));

        const editedMessage = await p.text({
          message: "edit the generated commit message",
          initialValue: message,
          placeholder: message,
        });

        if (p.isCancel(editedMessage)) {
          p.log.error(color.red("nothing changed!"));
          return await exit(1);
        }

        message = editedMessage;
        p.log.step(color.green(message));

        await StorageManager.update((current) => ({
          ...current,
          lastGeneratedMessage: message,
        }));

        if (options["--copy"]) {
          clipboard.writeSync(message);
          p.log.step(color.dim("copied commit message to clipboard"));
        }

        if (options["--apply"]) {
          const success = await commit(message);
          if (success) {
            p.log.step(color.dim("commit successful"));
          } else {
            p.log.error(color.red("failed to commit changes"));
          }
        }

        if (options["--push"]) {
          const success = await push();
          if (success) {
            p.log.step(color.dim("push successful"));
          } else {
            p.log.error(color.red("failed to push changes"));
          }
        }

        return await exit(0);
      } catch {
        spin.stop(color.red("failed to generate commit message"), 1);
        return await exit(1);
      }
    }),
  ),
};

export default command;
