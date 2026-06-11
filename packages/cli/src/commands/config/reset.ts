import { green } from "@crustjs/style";

import { configSub } from "~/commands/config/base";
import { withIntro } from "~/plugins/context";
import { log } from "~/ui/log";
import { confirm } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

export const resetCmd = configSub
  .sub("reset")
  .meta({ description: "reset the configuration" })
  .run(async () => {
    withIntro();

    let confirmed = false;
    try {
      confirmed = await confirm({
        message: "are you sure you want to reset the configuration?",
      });
    } catch (error) {
      if (isCancelled(error)) {
        log.error("nothing changed!");
        return await exit(1);
      }
      throw error;
    }

    if (!confirmed) {
      log.error("nothing changed!");
      return await exit(1);
    }

    await StorageManager.clear();
    log.success(green("configuration reset!"));
    return await exit(0);
  });
