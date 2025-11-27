import { describe, expect, it } from "vitest";

import {
  PackageManager,
  type InstallationInfo,
} from "~/utils/installation-info";

describe("installation-info", () => {
  describe("InstallationInfo type", () => {
    it("should accept valid installation info objects", () => {
      const globalNpmInfo: InstallationInfo = {
        packageManager: PackageManager.BUN,
        isGlobal: true,
        updateCommand: "bun add -g @snelusha/noto@latest",
        updateMessage: "Please run bun add -g @snelusha/noto@latest to update",
      };

      expect(globalNpmInfo.packageManager).toBe(PackageManager.BUN);
      expect(globalNpmInfo.isGlobal).toBe(true);
      expect(globalNpmInfo.updateCommand).toBeDefined();
      expect(globalNpmInfo.updateMessage).toBeDefined();
    });

    it("should accept minimal installation info", () => {
      const unknownInfo: InstallationInfo = {
        packageManager: PackageManager.UNKNOWN,
        isGlobal: false,
      };

      expect(unknownInfo.packageManager).toBe(PackageManager.UNKNOWN);
      expect(unknownInfo.isGlobal).toBe(false);
      expect(unknownInfo.updateCommand).toBeUndefined();
      expect(unknownInfo.updateMessage).toBeUndefined();
    });

    it("should accept local installation info", () => {
      const localInfo: InstallationInfo = {
        packageManager: PackageManager.YARN,
        isGlobal: false,
        updateMessage:
          "Locally installed. Please update via your project's package.json.",
      };

      expect(localInfo.packageManager).toBe(PackageManager.YARN);
      expect(localInfo.isGlobal).toBe(false);
      expect(localInfo.updateMessage).toContain("package.json");
    });

    it("should accept npx-like installation info", () => {
      const npxInfo: InstallationInfo = {
        packageManager: PackageManager.NPX,
        isGlobal: false,
        updateMessage: "Running via npx, update not applicable.",
      };

      expect(npxInfo.packageManager).toBe(PackageManager.NPX);
      expect(npxInfo.isGlobal).toBe(false);
      expect(npxInfo.updateMessage).toContain("npx");
    });
  });
});
