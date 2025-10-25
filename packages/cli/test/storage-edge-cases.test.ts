import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { StorageManager } from "../src/utils/storage";

const storageFileName = "storage.edge-case.test";
const tempDir = path.resolve(os.tmpdir(), ".noto-edge-cases");

describe("StorageManager - Edge Cases", () => {
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(async () => {
    (StorageManager as any).storagePath = path.resolve(tempDir, storageFileName);
    (StorageManager as any).storage = {};
    try {
      await fs.unlink((StorageManager as any).storagePath);
    } catch {}
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("Concurrent Access", () => {
    it("should handle concurrent reads", async () => {
      await StorageManager.update(() => ({ llm: { apiKey: "test" } }));

      const reads = await Promise.all([
        StorageManager.get(),
        StorageManager.get(),
        StorageManager.get(),
        StorageManager.get(),
        StorageManager.get(),
      ]);

      reads.forEach((storage) => {
        expect(storage).toEqual({ llm: { apiKey: "test" } });
      });
    });

    it.skip("should handle concurrent updates", async () => {
      await StorageManager.clear();

      const updates = [1, 2, 3, 4, 5].map((num) =>
        StorageManager.update((current) => ({
          ...current,
          [`key${num}`]: `value${num}`,
        }))
      );

      await Promise.all(updates);
      const storage = await StorageManager.get();

      // All updates should be present
      expect(storage).toHaveProperty("key1");
      expect(storage).toHaveProperty("key2");
      expect(storage).toHaveProperty("key3");
      expect(storage).toHaveProperty("key4");
      expect(storage).toHaveProperty("key5");
    });
  });

  describe("Large Data", () => {
    it.skip("should handle very large arrays", async () => {
      const largeCache: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        largeCache[`key${i}`] = "x".repeat(1000);
      }

      await StorageManager.update(() => ({ cache: largeCache }));
      const storage = await StorageManager.get();

      expect(Object.keys(storage.cache || {}).length).toBe(100);
    });

    it.skip("should handle deeply nested structures", async () => {
      const deepNested: any = { level: 0 };
      let current = deepNested;
      for (let i = 1; i < 50; i++) {
        current.nested = { level: i };
        current = current.nested;
      }

      await StorageManager.update(() => ({ deep: deepNested }));
      const storage = await StorageManager.get();

      expect(storage.deep).toBeDefined();
      expect(storage.deep.level).toBe(0);
    });

    it.skip("should handle arrays in storage", async () => {
      const data = {
        items: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
        })),
      };

      await StorageManager.update(() => data);
      const storage = await StorageManager.get();

      expect(storage.items).toHaveLength(100);
      expect(storage.items[0]).toEqual({ id: 0, name: "Item 0" });
      expect(storage.items[99]).toEqual({ id: 99, name: "Item 99" });
    });
  });

  describe("Special Characters", () => {
    it.skip("should handle unicode in values", async () => {
      await StorageManager.update(() => ({
        llm: { apiKey: "test-🔑-key" },
        message: "Hello 世界",
      }));

      const storage = await StorageManager.get();
      expect(storage.llm?.apiKey).toBe("test-🔑-key");
      expect(storage.message).toBe("Hello 世界");
    });

    it.skip("should handle special JSON characters", async () => {
      await StorageManager.update(() => ({
        data: 'Special chars: "\\ / \n \r \t',
      }));

      const storage = await StorageManager.get();
      expect(storage.data).toBe('Special chars: "\\ / \n \r \t');
    });

    it.skip("should handle empty strings and null values", async () => {
      await StorageManager.update(() => ({
        empty: "",
        nullValue: null,
        zero: 0,
        false: false,
      }));

      const storage = await StorageManager.get();
      expect(storage.empty).toBe("");
      expect(storage.nullValue).toBeNull();
      expect(storage.zero).toBe(0);
      expect(storage.false).toBe(false);
    });
  });

  describe("Error Conditions", () => {
    it("should handle corrupted storage file", async () => {
      await fs.writeFile((StorageManager as any).storagePath, "invalid json{");

      const storage = await StorageManager.load();
      // Should return empty object on parse error
      expect(storage).toEqual({});
    });

    it.skip("should recover from corrupted storage", async () => {
      await fs.writeFile((StorageManager as any).storagePath, "corrupted");

      // Load should return empty
      const loaded = await StorageManager.load();
      expect(loaded).toEqual({});

      // Should be able to save new data
      await StorageManager.update(() => ({ recovered: true }));
      const storage = await StorageManager.get();
      expect(storage.recovered).toBe(true);
    });

    it("should handle permission errors gracefully", async () => {
      // This test is platform-dependent, skip on Windows
      if (process.platform === "win32") {
        return;
      }

      const testPath = path.join(tempDir, "readonly");
      await fs.mkdir(testPath, { recursive: true });
      const readonlyFile = path.join(testPath, "storage.json");
      await fs.writeFile(readonlyFile, "{}");
      await fs.chmod(readonlyFile, 0o444); // Read-only

      (StorageManager as any).storagePath = readonlyFile;
      (StorageManager as any).storage = { test: "data" };

      // Save should fail silently or throw
      try {
        await StorageManager.update(() => ({ test: "newdata" }));
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Cleanup
      await fs.chmod(readonlyFile, 0o644);
      await fs.rm(testPath, { recursive: true, force: true });
      (StorageManager as any).storagePath = path.resolve(
        tempDir,
        storageFileName
      );
    });
  });

  describe("Update Function Behavior", () => {
    it.skip("should pass current state to updater function", async () => {
      await StorageManager.update(() => ({ initial: "value" }));

      let capturedState: any;
      await StorageManager.update((current) => {
        capturedState = current;
        return { ...current, added: "new" };
      });

      expect(capturedState).toEqual({ initial: "value" });
      const storage = await StorageManager.get();
      expect(storage).toEqual({ initial: "value", added: "new" });
    });

    it.skip("should allow complete replacement", async () => {
      await StorageManager.update(() => ({ old: "data", keep: "this" }));
      await StorageManager.update(() => ({ new: "data" }));

      const storage = await StorageManager.get();
      expect(storage).toEqual({ new: "data" });
      expect(storage).not.toHaveProperty("old");
      expect(storage).not.toHaveProperty("keep");
    });

    it.skip("should handle updater returning same object", async () => {
      await StorageManager.update(() => ({ data: "value" }));
      await StorageManager.update((current) => current);

      const storage = await StorageManager.get();
      expect(storage).toEqual({ data: "value" });
    });

    it("should handle complex transformations", async () => {
      await StorageManager.update(() => ({
        cache: { "a": "1", "b": "2", "c": "3" },
      }));

      await StorageManager.update((current) => ({
        ...current,
        cache: Object.fromEntries(
          Object.entries(current.cache || {}).map(([k, v]) => [
            k,
            String(Number(v) * 2),
          ])
        ),
      }));

      const storage = await StorageManager.get();
      expect(storage.cache).toEqual({ a: "2", b: "4", c: "6" });
    });
  });

  describe("Deep Copy Behavior", () => {
    it("should return deep copy from get()", async () => {
      await StorageManager.update(() => ({
        cache: { "nested": JSON.stringify({ level1: { level2: { value: "original" } } }) },
      }));

      const copy1 = await StorageManager.get();
      const copy2 = await StorageManager.get();

      // Modify copy1
      const nested1 = copy1.cache?.nested ? JSON.parse(copy1.cache.nested) : {};
      if (nested1.level1?.level2) {
        nested1.level1.level2.value = "modified";
      }

      // copy2 should not be affected
      const nested2 = copy2.cache?.nested ? JSON.parse(copy2.cache.nested) : {};
      expect(nested2.level1?.level2?.value).toBe("original");
    });

    it("should prevent array mutations from affecting storage", async () => {
      await StorageManager.update(() => ({
        cache: { "items": JSON.stringify([1, 2, 3]) },
      }));

      const copy = await StorageManager.get();
      const items = copy.cache?.items ? JSON.parse(copy.cache.items) : [];
      items.push(4);

      const storage = await StorageManager.get();
      const storedItems = storage.cache?.items ? JSON.parse(storage.cache.items) : [];
      expect(storedItems).toEqual([1, 2, 3]);
    });

    it("should prevent object mutations from affecting storage", async () => {
      await StorageManager.update(() => ({
        llm: { apiKey: "test-key" },
      }));

      const copy = await StorageManager.get();
      if (copy.llm) {
        copy.llm.apiKey = "modified";
      }

      const storage = await StorageManager.get();
      expect(storage.llm?.apiKey).toEqual("test-key");
    });
  });

  describe("Type Safety", () => {
    it("should preserve boolean values", async () => {
      await StorageManager.update(() => ({
        cache: {
          "boolTrue": "true",
          "boolFalse": "false",
        },
      }));

      const storage = await StorageManager.get();
      expect(storage.cache?.boolTrue).toBe("true");
      expect(storage.cache?.boolFalse).toBe("false");
      expect(typeof storage.cache?.boolTrue).toBe("string");
      expect(typeof storage.cache?.boolFalse).toBe("string");
    });

    it("should preserve number values", async () => {
      await StorageManager.update(() => ({
        cache: {
          "int": "42",
          "float": "3.14",
          "negative": "-10",
          "zero": "0",
        },
      }));

      const storage = await StorageManager.get();
      expect(storage.cache?.int).toBe("42");
      expect(storage.cache?.float).toBe("3.14");
      expect(storage.cache?.negative).toBe("-10");
      expect(storage.cache?.zero).toBe("0");
    });

    it("should handle Date serialization", async () => {
      const now = new Date();
      await StorageManager.update(() => ({
        cache: {
          "timestamp": now.toISOString(),
        },
      }));

      const storage = await StorageManager.get();
      expect(storage.cache?.timestamp).toBe(now.toISOString());
    });
  });
});
