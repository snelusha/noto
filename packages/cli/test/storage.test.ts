import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { StorageManager } from "~/utils/storage";

const storageFileName = "storage.test.sithi";
const tempDir = path.resolve(os.tmpdir(), ".noto");

describe("StorageManager", () => {
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(async () => {
    (StorageManager as any).storagePath = path.resolve(
      tempDir,
      storageFileName
    );
    (StorageManager as any).storage = {};
    try {
      await fs.unlink((StorageManager as any).storagePath);
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

    (StorageManager as any).storage = {};

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
});
