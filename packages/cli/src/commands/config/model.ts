import * as p from "@clack/prompts";
import color from "picocolors";

import { baseProcedure } from "~/trpc";

import { models } from "~/ai/models";

import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

import type { AvailableModels } from "~/ai/types";

export const model = baseProcedure
  .meta({
    description: "configure model",
  })
  .mutation(async () => {
    const model = await p.select({
      message: "select a model",
      initialValue: (await StorageManager.get()).llm?.model,
      options: Object.keys(models).map((model) => ({
        label: model,
        value: model,
      })),
    });

    if (p.isCancel(model)) {
      p.log.error(color.red("nothing changed!"));
      return await exit(1);
    }

    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        model: model as AvailableModels,
      },
    }));

    p.log.success(color.green("model configured!"));

    await exit(0);
  });
