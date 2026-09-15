import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { APICallError, RetryError } from "ai";

import { prepareCommand } from "~/cli-runtime";

import { generateCommitMessage } from "~/ai";

import { commit, push } from "~/utils/git";
import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

export async function noto(input: {
  message?: string | boolean;
  copy?: boolean;
  preview?: boolean;
  push?: boolean;
  force?: boolean;
  manual?: string | boolean;
  model?: string;
}): Promise<void> {
  const ctx = await prepareCommand({
    authRequired: true,
    repoRequired: true,
    diffRequired: true,
    promptRequired: true,
  });

  const spin = p.spinner();
  try {
    const manual = input.manual;
    if (manual) {
      let message: string;
      if (typeof manual === "string") {
        message = manual.trim();
        if (!message) {
          p.log.error(color.red("commit message cannot be empty!"));
          return await exit(1);
        }
      } else {
        const enteredMessage = await p.text({
          message: "enter the commit message",
          placeholder: "chore: init repo",
        });

        if (p.isCancel(enteredMessage)) {
          p.log.error(color.red("nothing changed!"));
          return await exit(1);
        }

        message = enteredMessage as string;
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

    let context = input.message;
    if (typeof context === "string") {
      context = context.trim();
    } else if (typeof context === "boolean" && context === true) {
      const enteredContext = await p.text({
        message: "provide context for the commit message",
        placeholder: "describe the changes",
      });

      if (p.isCancel(enteredContext)) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }

      context = enteredContext as string;
    }

    spin.start("generating commit message");

    let message = null;

    message = await generateCommitMessage(
      ctx.git.diff as string,
      ctx.noto.prompt as string,
      typeof context === "string" ? context : undefined,
      input.force,
      input.model,
    );

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

    if (input.copy) {
      clipboard.writeSync(message);
      p.log.step(color.dim("copied commit message to clipboard"));
    }

    if (!input.preview) {
      const success = await commit(message);
      if (success) {
        p.log.step(color.dim("commit successful"));
      } else {
        p.log.error(color.red("failed to commit changes"));
      }
    }

    if (input.push) {
      const success = await push();
      if (success) {
        p.log.step(color.dim("push successful"));
      } else {
        p.log.error(color.red("failed to push changes"));
      }
    }

    return await exit(0);
  } catch (e) {
    let msg: string | undefined;

    if (RetryError.isInstance(e) && APICallError.isInstance(e.lastError)) {
      msg = safeParseErrorMessage(e.lastError.responseBody);
    }

    const suffix = msg ? `\n${msg}` : "";
    spin.stop(color.red(`failed to generate commit message${suffix}`));
    await exit(1);
  }
}

function safeParseErrorMessage(body: unknown): string | undefined {
  if (typeof body !== "string") return;
  try {
    const parsed = JSON.parse(body);
    return parsed?.error?.message ?? parsed?.message;
  } catch {
    return;
  }
}
