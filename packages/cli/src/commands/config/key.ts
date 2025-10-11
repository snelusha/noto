import { z } from "trpc-cli";

import * as p from "@clack/prompts";
import color from "picocolors";

import { baseProcedure } from "~/trpc";

import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

export const key = baseProcedure
  .meta({ description: "configure noto api key" })
  .input(z.string().optional().describe("apiKey"))
  .mutation(async (opts) => {
    const { input } = opts;

    let apiKey = input;

    if ((await StorageManager.get()).llm?.apiKey) {
      const confirm = await p.confirm({
        message: "noto api key already configured, do you want to update it?",
      });

      if (p.isCancel(confirm) || !confirm) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }
    }

    if (!apiKey) {
      const result = await p.text({
        message: "enter your noto api key",
      });

      if (p.isCancel(result)) {
        p.log.error(color.red("nothing changed!"));
        return await exit(1);
      }

      apiKey = result as string;
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        apiKey,
      },
    }));

    p.log.success(color.green("noto api key configured!"));

    await exit(0);
  });
