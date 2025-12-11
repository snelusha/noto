import os from "node:os";
import path from "node:path";
import { z } from "zod";

import { createStorage } from "~/utils/base-storage";

const CacheSchema = z.object({
  commitGenerationCache: z.record(z.string(), z.string()).optional(),
  update: z
    .object({
      timestamp: z.number(),
      current: z.string(),
      latest: z.string(),
    })
    .optional(),
});

export type Cache = z.infer<typeof CacheSchema>;

export const CacheManager = createStorage({
  path: path.resolve(path.join(os.homedir(), ".cache", "noto"), "cache"),
  schema: CacheSchema,
});
