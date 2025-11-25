import os from "os";
import { join, resolve } from "path";
import { z } from "zod";

import { createStorage } from "~/utils/base-storage";
import { AvailableModelsSchema } from "~/ai/types";

const ConfigSchema = z.object({
  llm: z
    .object({
      apiKey: z.string().optional(),
      model: AvailableModelsSchema.optional().or(z.string()),
    })
    .optional(),
  lastGeneratedMessage: z.string().optional(),
});

export type Storage = z.infer<typeof ConfigSchema>;

export const StorageManager = createStorage({
  path: resolve(join(os.homedir(), ".config", "noto"), ".notorc"),
  schema: ConfigSchema,
});

export async function cleanupLegacyStorage(): Promise<void> {
  try {
    const current = await StorageManager.get();
    await StorageManager.update(() => current);
  } catch {}
}
