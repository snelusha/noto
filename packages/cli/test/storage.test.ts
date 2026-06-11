import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { StorageManager, cleanupLegacyStorage } from "~/utils/storage";

const tempDir = path.resolve(os.tmpdir(), ".noto-storage-test");

describe("StorageManager", () => {
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(async () => {
    StorageManager.storagePath = path.resolve(tempDir, "notorc.json");
    StorageManager.storage = {};
    try {
      await fs.unlink(StorageManager.storagePath);
    } catch {}
    try {
      await fs.unlink(path.join(tempDir, ".notorc"));
    } catch {}
    try {
      await fs.unlink(path.join(tempDir, ".notorc.bak"));
    } catch {}
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("load() returns empty storage if file does not exist", async () => {
    const storage = await StorageManager.load();
    expect(storage).toEqual({});
  });

  it("save() writes storage to file and load() reads it back", async () => {
    const testStorage = { llm: { apiKey: "noto-api-key" } };
    await StorageManager.update(() => testStorage);

    StorageManager.storage = {};

    const loadedStorage = await StorageManager.load();
    expect(loadedStorage).toEqual({ llm: { apiKey: "noto-api-key" } });
  });

  it("get() returns a deep copy of the storage", async () => {
    await StorageManager.update(() => ({
      llm: { apiKey: "noto-api-key-updated" },
    }));

    const storageCopy = await StorageManager.get();
    expect(storageCopy).toEqual({ llm: { apiKey: "noto-api-key-updated" } });

    if (storageCopy.llm) storageCopy.llm.apiKey = "noto-api-key-modified";

    const internalStorage = await StorageManager.get();
    expect(internalStorage).toEqual({
      llm: { apiKey: "noto-api-key-updated" },
    });
  });

  it("clear() removes all data from storage", async () => {
    await StorageManager.update(() => ({
      llm: { apiKey: "noto-api-key" },
    }));

    await StorageManager.clear();
    const storage = await StorageManager.get();
    expect(storage).toEqual({});
  });

  it("cleanupLegacyStorage() migrates legacy .notorc and removes cache field", async () => {
    const legacyStorage = {
      llm: { apiKey: "test-key", model: "gpt-4" },
      lastGeneratedMessage: "test message",
      cache: { someHash: "some commit message" },
    };

    const legacyPath = path.join(tempDir, ".notorc");
    await fs.writeFile(
      legacyPath,
      JSON.stringify(legacyStorage, null, 2),
      "utf-8",
    );

    await cleanupLegacyStorage();

    const cleanedStorage = await StorageManager.get();
    expect(cleanedStorage).toEqual({
      llm: { apiKey: "test-key", model: "gpt-4" },
      lastGeneratedMessage: "test message",
    });
    expect(cleanedStorage).not.toHaveProperty("cache");

    const fileContent = await fs.readFile(StorageManager.storagePath, "utf-8");
    const parsedFile = JSON.parse(fileContent);
    expect(parsedFile).not.toHaveProperty("cache");
    expect(parsedFile.llmApiKey).toBe("test-key");
  });

  it("cleanupLegacyStorage() handles missing file gracefully", async () => {
    try {
      await fs.unlink(StorageManager.storagePath);
    } catch {}

    await expect(cleanupLegacyStorage()).resolves.toBeUndefined();
  });

  it("cleanupLegacyStorage() does nothing if cache field doesn't exist", async () => {
    const modernStorage = {
      llm: { apiKey: "test-key" },
      lastGeneratedMessage: "test message",
    };

    await StorageManager.update(() => modernStorage);

    await cleanupLegacyStorage();

    const storage = await StorageManager.get();
    expect(storage).toEqual(modernStorage);
  });
});
