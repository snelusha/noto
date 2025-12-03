import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  PackageManager,
  type InstallationInfo,
  getInstallationInfo,
} from "~/utils/installation-info";

vi.mock("node:fs");
vi.mock("node:child_process");
vi.mock("~/utils/git");

describe("installation-info", () => {
  describe("getInstallationInfo()", () => {
    let originalArgv: string[];
    let originalCwd: () => string;
    let originalPlatform: NodeJS.Platform;

    beforeEach(async () => {
      originalArgv = process.argv;
      originalCwd = process.cwd;
      originalPlatform = process.platform;
      vi.clearAllMocks();

      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");
      const gitUtils = await import("~/utils/git");

      vi.mocked(fs.realpathSync).mockImplementation((path) => path.toString());
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(childProcess.execSync).mockReturnValue(Buffer.from(""));
      vi.mocked(gitUtils.isGitRepository).mockResolvedValue(false);
    });

    afterEach(() => {
      process.argv = originalArgv;
      process.cwd = originalCwd;
      Object.defineProperty(process, "platform", {
        value: originalPlatform,
      });
      vi.restoreAllMocks();
    });

    it("should return UNKNOWN when process.argv[1] is undefined", async () => {
      process.argv = ["node"];

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.UNKNOWN);
      expect(result.isGlobal).toBe(false);
    });

    it("should detect local git clone installation", async () => {
      const fs = await import("node:fs");
      const gitUtils = await import("~/utils/git");

      process.argv = ["node", "/home/user/project/src/index.ts"];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/project/src/index.ts",
      );
      vi.mocked(gitUtils.isGitRepository).mockResolvedValue(true);

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.UNKNOWN);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("git pull");
    });

    it("should detect npx installation", async () => {
      const fs = await import("node:fs");

      process.argv = [
        "node",
        "/home/user/.npm/_npx/abc123/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/.npm/_npx/abc123/node_modules/@snelusha/noto/dist/index.js",
      );

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.NPX);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("npx");
    });

    it("should detect pnpx installation", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/.pnpm/dlx/abc123/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/.pnpm/dlx/abc123/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.PNPX);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("pnpx");
    });

    it("should detect global pnpm installation", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/.local/share/pnpm/global/5/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/.local/share/pnpm/global/5/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.PNPM);
      expect(result.isGlobal).toBe(true);
      expect(result.updateCommand).toBe("pnpm add -g @snelusha/noto@latest");
      expect(result.updateMessage).toContain("pnpm add -g");
    });

    it("should detect Homebrew installation on macOS", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/opt/homebrew/lib/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/opt/homebrew/lib/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        return Buffer.from("noto");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.HOMEBREW);
      expect(result.isGlobal).toBe(true);
      expect(result.updateMessage).toContain("brew upgrade");
    });

    it("should detect global yarn installation", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/.yarn/global/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/.yarn/global/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.YARN);
      expect(result.isGlobal).toBe(true);
      expect(result.updateCommand).toBe(
        "yarn global add @snelusha/noto@latest",
      );
      expect(result.updateMessage).toContain("yarn global add");
    });

    it("should detect bunx installation", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/.bun/install/global/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/.bun/install/global/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.BUN);
      expect(result.isGlobal).toBe(true);
      expect(result.updateCommand).toBe("bun add -g @snelusha/noto@latest");
      expect(result.updateMessage).toContain("bun add -g");
    });

    it("should detect local installation with yarn.lock", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p.toString().includes("yarn.lock");
      });
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.YARN);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("package.json");
    });

    it("should detect local installation with pnpm-lock.yaml", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p.toString().includes("pnpm-lock.yaml");
      });
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.PNPM);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("package.json");
    });

    it("should detect local installation with bun.lockb", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/home/user/project/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p.toString().includes("bun.lockb");
      });
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.BUN);
      expect(result.isGlobal).toBe(false);
      expect(result.updateMessage).toContain("package.json");
    });

    it("should default to global npm installation", async () => {
      const fs = await import("node:fs");
      const childProcess = await import("node:child_process");

      process.argv = [
        "node",
        "/usr/local/lib/node_modules/@snelusha/noto/dist/index.js",
      ];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockReturnValue(
        "/usr/local/lib/node_modules/@snelusha/noto/dist/index.js",
      );
      vi.mocked(childProcess.execSync).mockImplementation(() => {
        throw new Error("not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.NPM);
      expect(result.isGlobal).toBe(true);
      expect(result.updateCommand).toBe("npm install -g @snelusha/noto@latest");
      expect(result.updateMessage).toContain("npm install -g");
    });

    it("should return UNKNOWN on error", async () => {
      const fs = await import("node:fs");

      process.argv = ["node", "/some/path"];
      process.cwd = vi.fn().mockReturnValue("/home/user/project");
      vi.mocked(fs.realpathSync).mockImplementation(() => {
        throw new Error("File not found");
      });

      const result = await getInstallationInfo();

      expect(result.packageManager).toBe(PackageManager.UNKNOWN);
      expect(result.isGlobal).toBe(false);
    });
  });
});
