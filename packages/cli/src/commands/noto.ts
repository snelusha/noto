import * as p from "@clack/prompts";
import color from "picocolors";

import type { Command } from "@/types";

import { withAuth } from "@/middleware/auth";
import { withRepository } from "@/middleware/git";
import { NotoError } from "@/errors";
import { generateCommitMessage } from "@/ai";

const command: Command = {
  name: "noto",
  description: "generate commit message",
  usage: "noto [options]",
  options: [],
  execute: withAuth(
    withRepository(async (options) => {
      const spin = p.spinner();
      try {
        const { diff } = options;

        spin.start("generating commit message");

        const message = await generateCommitMessage(diff);
        spin.stop(color.green(message));
      } catch {
        spin.stop(color.red("failed to generate commit message"), 1);
        console.log();
        process.exit(1);
      }
      console.log();
    })
  ),
};

export default command;
