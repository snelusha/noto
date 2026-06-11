import fs from "node:fs/promises";
import path from "node:path";

import { cacheDir, createStore, field } from "@crustjs/store";
import { z } from "zod";

const UpdateSchema = z.object({
  timestamp: z.number(),
  current: z.string(),
  latest: z.string(),
});

export type Cache = {
  commitGenerationCache?: Record<string, string>;
  update?: z.infer<typeof UpdateSchema>;
};

type CacheFields = {
  commitGenerationCache?: Record<string, string>;
  updateTimestamp?: number;
  updateCurrent?: string;
  updateLatest?: string;
};

let testDirOverride: string | undefined;

function resolveCacheDirectory() {
  return testDirOverride ?? cacheDir("noto");
}

function createCacheStore(directory: string) {
  return createStore({
    dirPath: directory,
    name: "cache",
    fields: {
      commitGenerationCache: field(z.record(z.string(), z.string()).optional()),
      updateTimestamp: field(z.number().optional()),
      updateCurrent: field(z.string().optional()),
      updateLatest: field(z.string().optional()),
    },
  });
}

let cacheStore = createCacheStore(resolveCacheDirectory());

function toCache(fields?: CacheFields): Cache {
  if (!fields) return {};

  const cache: Cache = {};

  if (fields.commitGenerationCache) {
    cache.commitGenerationCache = fields.commitGenerationCache;
  }

  if (
    fields.updateTimestamp !== undefined &&
    fields.updateCurrent &&
    fields.updateLatest
  ) {
    cache.update = {
      timestamp: fields.updateTimestamp,
      current: fields.updateCurrent,
      latest: fields.updateLatest,
    };
  }

  return cache;
}

function fromCache(cache: Cache): CacheFields {
  const fields: CacheFields = {};

  if (cache.commitGenerationCache !== undefined) {
    fields.commitGenerationCache = cache.commitGenerationCache;
  }

  if (cache.update?.timestamp !== undefined) {
    fields.updateTimestamp = cache.update.timestamp;
  }

  if (cache.update?.current !== undefined) {
    fields.updateCurrent = cache.update.current;
  }

  if (cache.update?.latest !== undefined) {
    fields.updateLatest = cache.update.latest;
  }

  return fields;
}

function reconfigureStore() {
  cacheStore = createCacheStore(resolveCacheDirectory());
}

async function migrateLegacyCacheFile() {
  const directory = resolveCacheDirectory();
  const legacyPath = path.join(directory, "cache");
  const nextPath = path.join(directory, "cache.json");

  try {
    await fs.access(legacyPath);
  } catch {
    return;
  }

  try {
    const stat = await fs.stat(legacyPath);
    if (!stat.isFile()) return;
  } catch {
    return;
  }

  try {
    await fs.access(nextPath);
    return;
  } catch {}

  const raw = await fs.readFile(legacyPath, "utf-8");
  const parsed = JSON.parse(raw) as Cache;

  await cacheStore.write(fromCache(parsed));
  await fs.rename(legacyPath, `${legacyPath}.bak`);
}

export async function initializeCache() {
  try {
    await migrateLegacyCacheFile();
  } catch {}
}

export const CacheManager = {
  get storagePath() {
    return path.join(resolveCacheDirectory(), "cache.json");
  },

  set storagePath(storagePath: string) {
    testDirOverride = path.dirname(storagePath);
    reconfigureStore();
  },

  storage: {} as Cache,

  async load(): Promise<Cache> {
    await migrateLegacyCacheFile();
    const fields = await cacheStore.read();
    CacheManager.storage = toCache(fields);
    return CacheManager.storage;
  },

  async save(): Promise<void> {
    await cacheStore.write(fromCache(CacheManager.storage));
  },

  async get(): Promise<Cache> {
    await migrateLegacyCacheFile();
    const fields = await cacheStore.read();
    return structuredClone(toCache(fields));
  },

  async update(
    updater: (current: Cache) => Cache | Promise<Cache>,
  ): Promise<Cache> {
    await migrateLegacyCacheFile();

    const current = await CacheManager.get();
    const next = await updater(current);
    await cacheStore.write(fromCache(next));

    CacheManager.storage = next;
    return next;
  },

  async clear(): Promise<void> {
    await cacheStore.reset();
    CacheManager.storage = {};
  },
};
