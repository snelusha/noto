import * as p from "@clack/prompts";
import color from "picocolors";

import clipboard from "clipboardy";

import { withAuth } from "@/middleware/auth";
import { withRepository } from "@/middleware/git";

import { generateCommitMessage } from "@/ai";

import { commit } from "@/utils/git";

import type { Command } from "@/types";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [
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
  ],
  execute: withAuth(
    withRepository(async (options) => {
      const spin = p.spinner();
      try {
        const { diff } = options;

        spin.start("generating commit message");

        const message = await generateCommitMessage(diff);
        spin.stop(color.green(message));

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
      } catch {
        spin.stop(color.red("failed to generate commit message"), 1);
        process.exit(1);
      } finally {
        process.stdout.write("\n");
      }
    })
  ),
};

export default command;
