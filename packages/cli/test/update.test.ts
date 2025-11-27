import os from "os";
import path from "path";
import { promises as fs } from "fs";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  checkForUpdate,
  getAvailableUpdate,
  markUpdateChecked,
  type UpdateInfo,
} from "~/utils/update";
import { CacheManager } from "~/utils/cache";

// Mock the external dependencies
vi.mock("latest-version", () => ({
  default: vi.fn(),
}));

vi.mock("package", () => ({
  name: "@snelusha/noto",
  version: "1.3.2",
}));

import latestVersion from "latest-version";

const tempDir = path.resolve(os.tmpdir(), ".noto-update-test");
const cachePath = path.resolve(tempDir, "cache");

describe("update utilities", () => {
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    CacheManager.storagePath = cachePath;
    CacheManager.storage = {};
    try {
      await fs.unlink(cachePath);
    } catch {}
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  describe("checkForUpdate", () => {
    it("should return latest version when no cache exists", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.4.0");

      const result = await checkForUpdate();

      expect(result).toEqual({
        latest: "1.4.0",
        current: "1.3.2",
        timestamp: expect.any(Number),
      });
      expect(latestVersion).toHaveBeenCalledWith("@snelusha/noto");
    });

    it("should use cached data when cache is valid and up-to-date", async () => {
      const now = Date.now();
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: now,
          current: "1.3.2",
          latest: "1.3.2",
        },
      }));

      const result = await checkForUpdate();

      expect(result).toEqual({
        latest: "1.3.2",
        current: "1.3.2",
        timestamp: now,
      });
      expect(latestVersion).not.toHaveBeenCalled();
    });

    it("should use cached data when cache is recent but not up-to-date", async () => {
      const now = Date.now();
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: now,
          current: "1.3.2",
          latest: "1.4.0",
        },
      }));

      const result = await checkForUpdate();

      expect(result).toEqual({
        latest: "1.4.0",
        current: "1.3.2",
        timestamp: now,
      });
      expect(latestVersion).not.toHaveBeenCalled();
    });

    it("should fetch new version when cache is old", async () => {
      const oldTimestamp = Date.now() - 13 * 60 * 60 * 1000; // 13 hours ago
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: oldTimestamp,
          current: "1.3.2",
          latest: "1.4.0", // Cache shows update available but is old
        },
      }));

      vi.mocked(latestVersion).mockResolvedValue("1.5.0");

      const result = await checkForUpdate();

      expect(result.latest).toBe("1.5.0");
      expect(latestVersion).toHaveBeenCalled();
    });

    it("should force fetch when force=true", async () => {
      const now = Date.now();
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: now,
          current: "1.3.2",
          latest: "1.3.2",
        },
      }));

      vi.mocked(latestVersion).mockResolvedValue("1.5.0");

      const result = await checkForUpdate(false, true);

      expect(result.latest).toBe("1.5.0");
      expect(latestVersion).toHaveBeenCalled();
    });

    it("should mark update as checked when mark=true", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.4.0");

      await checkForUpdate(true);

      const cache = await CacheManager.get();
      expect(cache.update).toEqual({
        timestamp: expect.any(Number),
        current: "1.3.2",
        latest: "1.4.0",
      });
    });

    it("should return cached data on fetch error", async () => {
      const now = Date.now();
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: now - 13 * 60 * 60 * 1000,
          current: "1.3.2",
          latest: "1.3.5",
        },
      }));

      vi.mocked(latestVersion).mockRejectedValue(new Error("Network error"));

      const result = await checkForUpdate();

      expect(result).toEqual({
        latest: "1.3.5",
        current: "1.3.2",
        timestamp: now - 13 * 60 * 60 * 1000,
      });
    });

    it("should return current version on fetch error with no cache", async () => {
      vi.mocked(latestVersion).mockRejectedValue(new Error("Network error"));

      const result = await checkForUpdate();

      expect(result).toEqual({
        latest: "1.3.2",
        current: "1.3.2",
        timestamp: expect.any(Number),
      });
    });

    it("should ignore invalid cached versions", async () => {
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: Date.now(),
          current: "invalid",
          latest: "1.4.0",
        },
      }));

      vi.mocked(latestVersion).mockResolvedValue("1.4.0");

      const result = await checkForUpdate();

      expect(latestVersion).toHaveBeenCalled();
      expect(result.latest).toBe("1.4.0");
    });
  });

  describe("markUpdateChecked", () => {
    it("should update cache with new update info", async () => {
      const updateInfo: UpdateInfo = {
        latest: "1.4.0",
        current: "1.3.2",
        timestamp: Date.now(),
      };

      await markUpdateChecked(updateInfo);

      const cache = await CacheManager.get();
      expect(cache.update).toEqual({
        timestamp: updateInfo.timestamp,
        current: "1.3.2",
        latest: "1.4.0",
      });
    });

    it("should do nothing when update is null", async () => {
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: Date.now(),
          current: "1.3.2",
          latest: "1.3.2",
        },
      }));

      const cacheBefore = await CacheManager.get();

      await markUpdateChecked(null);

      const cacheAfter = await CacheManager.get();
      expect(cacheAfter.update).toEqual(cacheBefore.update);
    });
  });

  describe("getAvailableUpdate", () => {
    it("should return update info when new version is available", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.4.0");

      const result = await getAvailableUpdate();

      expect(result).toEqual({
        latest: "1.4.0",
        current: "1.3.2",
        timestamp: expect.any(Number),
      });
    });

    it("should return null when already up-to-date", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.3.2");

      const result = await getAvailableUpdate();

      expect(result).toBeNull();
    });

    it("should return null when current version is ahead", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.3.0");

      const result = await getAvailableUpdate();

      expect(result).toBeNull();
    });

    it("should return null when versions are invalid", async () => {
      vi.mocked(latestVersion).mockResolvedValue("invalid-version");

      const result = await getAvailableUpdate();

      expect(result).toBeNull();
    });

    it("should mark update as checked when mark=true", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.4.0");

      await getAvailableUpdate(true);

      const cache = await CacheManager.get();
      expect(cache.update).not.toBeNull();
    });

    it("should force fetch when force=true", async () => {
      const now = Date.now();
      await CacheManager.update((current) => ({
        ...current,
        update: {
          timestamp: now,
          current: "1.3.2",
          latest: "1.3.2",
        },
      }));

      vi.mocked(latestVersion).mockResolvedValue("1.5.0");

      const result = await getAvailableUpdate(false, true);

      expect(result).not.toBeNull();
      expect(result?.latest).toBe("1.5.0");
      expect(latestVersion).toHaveBeenCalled();
    });
  });
});
