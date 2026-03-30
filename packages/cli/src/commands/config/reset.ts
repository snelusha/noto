import * as p from "~/prompts";
import color from "picocolors";

import { baseProcedure } from "~/trpc";

import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

export const reset = baseProcedure
  .meta({
    description: "reset the configuration",
  })
  .mutation(async () => {
    const confirm = await p.confirm({
      message: "are you sure you want to reset the configuration?",
    });

    if (p.isCancel(confirm) || !confirm) {
      p.log.error(color.red("nothing changed!"));
      return await exit(1);
    }

    await StorageManager.clear();

    p.log.success(color.green("configuration reset!"));

    await exit(0);
  });
