import os from "node:os";
import path from "node:path";
import fs from "node:fs/promises";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { CacheManager } from "~/utils/cache";

vi.mock("latest-version", () => ({
  default: vi.fn(),
}));

vi.mock("package", () => ({
  name: "@snelusha/noto",
  version: "1.3.6-beta.0",
}));

import latestVersion from "latest-version";

import { checkForUpdate, getAvailableUpdate } from "~/utils/update";

const tempDir = path.resolve(os.tmpdir(), ".noto-update-prerelease-test");
const cachePath = path.resolve(tempDir, "cache");

describe("update utilities - prerelease", () => {
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

  describe("prerelease to stable downgrade", () => {
    it("should return update when current is prerelease and latest stable is lower", async () => {
      vi.mocked(latestVersion).mockResolvedValue("1.3.5");

      // When on prerelease 1.3.6-beta.0 and stable is 1.3.5 (lower),
      // should still offer the update when tag="stable"
      const result = await getAvailableUpdate(false, false, "stable");

      expect(result).not.toBeNull();
      expect(result).toEqual({
        latest: "1.3.5",
        current: "1.3.6-beta.0",
        timestamp: expect.any(Number),
      });
    });

    it("should prefer stable over beta prerelease when auto tag on prerelease", async () => {
      vi.mocked(latestVersion)
        .mockResolvedValueOnce("1.3.6-beta.5") // beta version
        .mockResolvedValueOnce("1.3.6"); // stable version

      // When on prerelease 1.3.6-beta.0 with tag="auto",
      // should prefer stable 1.3.6 over beta 1.3.6-beta.5
      const result = await checkForUpdate(false, false, "auto");

      expect(result).toEqual({
        latest: "1.3.6",
        current: "1.3.6-beta.0",
        timestamp: expect.any(Number),
      });
      expect(latestVersion).toHaveBeenCalledTimes(2);
    });
  });
});
