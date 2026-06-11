import { z } from "zod";

import { arg, commandValidator } from "@crustjs/validate";
import { green } from "@crustjs/style";

import { configSub } from "~/commands/config/base";
import { withIntro } from "~/plugins/context";
import { log } from "~/ui/log";
import { confirm, input } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

export const keyCmd = configSub
  .sub("key")
  .meta({ description: "configure noto api key" })
  .args([
    arg("apiKey", z.string().optional(), {
      description: "noto api key",
    }),
  ])
  .run(
    commandValidator(async ({ args }) => {
      withIntro();

      let apiKey = args.apiKey;

      if ((await StorageManager.get()).llm?.apiKey) {
        let confirmed = false;
        try {
          confirmed = await confirm({
            message:
              "noto api key already configured, do you want to update it?",
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
      }

      if (!apiKey) {
        try {
          apiKey = await input({
            message: "enter your noto api key",
          });
        } catch (error) {
          if (isCancelled(error)) {
            log.error("nothing changed!");
            return await exit(1);
          }
          throw error;
        }
      }

      await StorageManager.update((current) => ({
        ...current,
        llm: {
          ...current.llm,
          apiKey,
        },
      }));

      log.success(green("noto api key configured!"));
      return await exit(0);
    }),
  );
