import pc from "picocolors";
import clipboardy from "clipboardy";

import { load, dump } from "@/storage";
import { commit } from "@/git";
import { generateCommitMessage } from "@/ai";
import {
  ensureApiKey,
  ensureGitRepository,
  ensureStagedChanges,
  spinner,
} from "@/utils";

import type { ArgumentsCamelCase } from "yargs";

export async function generate(args: ArgumentsCamelCase) {
  const storage = await load();

  await ensureApiKey();
  await ensureGitRepository();

  const diff = await ensureStagedChanges();

  const spin = spinner();

  try {
    spin.start("Generating commit message...");

    const message = await generateCommitMessage(diff);

    storage.lastGeneratedMessage = message;
    await dump();

    spin.success(`Commit Message: ${pc.dim(pc.bold(message))}`);

    if (args.copy) {
      clipboardy.writeSync(message);
      spin.success("Message copied to clipboard!");
    }

    if (args.apply) {
      if (!(await commit(message))) {
        spin.fail("Failed to commit staged changes.");
        process.exit(1);
      }
      spin.success("Staged changes committed!");
    }
  } catch (_) {
    spin.fail("Failed to generate commit message.");
    process.exit(1);
  }
}
