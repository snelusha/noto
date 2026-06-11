import { vi } from "vitest";

const memoryCache = vi.hoisted(() => ({
  storage: {} as Record<string, unknown>,
  path: "",
}));

vi.mock("~/utils/cache", () => ({
  CacheManager: {
    get storagePath() {
      return memoryCache.path;
    },
    set storagePath(value: string) {
      memoryCache.path = value;
    },
    get storage() {
      return memoryCache.storage;
    },
    set storage(value: Record<string, unknown>) {
      memoryCache.storage = value;
    },
    async get() {
      return structuredClone(memoryCache.storage);
    },
    async update(updater: (current: Record<string, unknown>) => unknown) {
      memoryCache.storage = structuredClone(
        await updater(structuredClone(memoryCache.storage)),
      );
      return structuredClone(memoryCache.storage);
    },
    async load() {
      return structuredClone(memoryCache.storage);
    },
    async clear() {
      memoryCache.storage = {};
    },
    async save() {},
  },
  initializeCache: async () => {},
}));

export { memoryCache };
