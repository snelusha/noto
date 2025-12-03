import * as fs from "node:fs";
import * as path from "node:path";
import * as childProcess from "node:child_process";
import process from "node:process";

import { isGitRepository } from "~/utils/git";

export enum PackageManager {
  NPM = "npm",
  YARN = "yarn",
  PNPM = "pnpm",
  PNPX = "pnpx",
  BUN = "bun",
  BUNX = "bunx",
  HOMEBREW = "homebrew",
  NPX = "npx",
  UNKNOWN = "unknown",
}

export interface InstallationInfo {
  packageManager: PackageManager;
  isGlobal: boolean;
  updateCommand?: string;
  updateMessage?: string;
}

export async function getInstallationInfo(): Promise<InstallationInfo> {
  const cliPath = process.argv[1];
  if (!cliPath) {
    return { packageManager: PackageManager.UNKNOWN, isGlobal: false };
  }

  const root = process.cwd();

  try {
    const realPath = fs.realpathSync(cliPath).replace(/\\/g, "/");
    const normalizedRoot = root.replace(/\\/g, "/");
    const isGit = await isGitRepository();

    if (
      isGit &&
      normalizedRoot &&
      realPath.startsWith(normalizedRoot) &&
      !realPath.includes("/node_modules/")
    ) {
      return {
        packageManager: PackageManager.UNKNOWN,
        isGlobal: false,
        updateMessage:
          'Running from a local git clone. Please update with "git pull".',
      };
    }

    if (realPath.includes("/.npm/_npx") || realPath.includes("/npm/_npx")) {
      return {
        packageManager: PackageManager.NPX,
        isGlobal: false,
        updateMessage: "Running via npx, update not applicable.",
      };
    }

    if (process.platform === "darwin") {
      try {
        childProcess.execSync('brew list -1 | grep -q "^noto$"', {
          stdio: "ignore",
        });
        return {
          packageManager: PackageManager.HOMEBREW,
          isGlobal: true,
          updateMessage:
            'Installed via Homebrew. Please update with "brew upgrade".',
        };
      } catch {}
    }

    if (
      realPath.includes("/pnpm/dlx") ||
      realPath.includes("/pnpm-cache/dlx")
    ) {
      return {
        packageManager: PackageManager.PNPX,
        isGlobal: false,
        updateMessage: "Running via pnpx, update not applicable.",
      };
    }

    if (realPath.includes("/pnpm/global")) {
      const updateCommand = "pnpm add -g @snelusha/noto@latest";
      return {
        packageManager: PackageManager.PNPM,
        isGlobal: true,
        updateCommand,
        updateMessage: `Please run ${updateCommand} to update`,
      };
    }

    if (realPath.includes("/.yarn/global")) {
      const updateCommand = "yarn global add @snelusha/noto@latest";
      return {
        packageManager: PackageManager.YARN,
        isGlobal: true,
        updateCommand,
        updateMessage: `Please run ${updateCommand} to update`,
      };
    }

    if (realPath.includes("/bunx")) {
      return {
        packageManager: PackageManager.BUNX,
        isGlobal: false,
        updateMessage: "Running via bunx, update not applicable.",
      };
    }
    if (realPath.includes("/.bun/install/global")) {
      const updateCommand = "bun add -g @snelusha/noto@latest";
      return {
        packageManager: PackageManager.BUN,
        isGlobal: true,
        updateCommand,
        updateMessage: `Please run ${updateCommand} to update`,
      };
    }

    if (
      normalizedRoot &&
      realPath.startsWith(`${normalizedRoot}/node_modules`)
    ) {
      let pm = PackageManager.NPM;
      if (fs.existsSync(path.join(root, "yarn.lock"))) {
        pm = PackageManager.YARN;
      } else if (fs.existsSync(path.join(root, "pnpm-lock.yaml"))) {
        pm = PackageManager.PNPM;
      } else if (
        fs.existsSync(path.join(root, "bun.lockb")) ||
        fs.existsSync(path.join(root, "bun.lock"))
      ) {
        pm = PackageManager.BUN;
      }
      return {
        packageManager: pm,
        isGlobal: false,
        updateMessage:
          "Locally installed. Please update via your project's package.json.",
      };
    }

    const updateCommand = "npm install -g @snelusha/noto@latest";
    return {
      packageManager: PackageManager.NPM,
      isGlobal: true,
      updateCommand,
      updateMessage: `Please run ${updateCommand} to update`,
    };
  } catch {
    return { packageManager: PackageManager.UNKNOWN, isGlobal: false };
  }
}
