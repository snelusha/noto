import { green } from "@crustjs/style";

import { models } from "~/ai/models";
import { configSub } from "~/commands/config/base";
import { withIntro } from "~/plugins/context";
import { log } from "~/ui/log";
import { select } from "~/ui/prompts";
import { isCancelled } from "~/ui/cancel";
import { exit } from "~/utils/process";
import { StorageManager } from "~/utils/storage";

import type { AvailableModels } from "~/ai/types";

export const modelCmd = configSub
  .sub("model")
  .meta({ description: "configure model" })
  .run(async () => {
    withIntro();

    let model: AvailableModels;
    try {
      model = await select({
        message: "select a model",
        default: (await StorageManager.get()).llm?.model as
          | AvailableModels
          | undefined,
        choices: Object.keys(models).map((name) => ({
          label: name,
          value: name as AvailableModels,
        })),
      });
    } catch (error) {
      if (isCancelled(error)) {
        log.error("nothing changed!");
        return await exit(1);
      }
      throw error;
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        model,
      },
    }));

    log.success(green("model configured!"));
    return await exit(0);
  });
