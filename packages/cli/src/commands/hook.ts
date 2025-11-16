import path from "path";
import fs from "fs/promises";
import { fileURLToPath, pathToFileURL } from "url";

import { z } from "zod";

import * as p from "@clack/prompts";
import color from "picocolors";

import dedent from "dedent";

import { gitProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { getGitRoot } from "~/utils/git";

const hookName = "prepare-commit-msg";
const symlinkPath = `.git/hooks/${hookName}`;

const hookPath = fileURLToPath(new URL("index.js", import.meta.url));

const isWindows = process.platform === "win32";
const windowsHook = `
#!/usr/bin/env node
import(${JSON.stringify(pathToFileURL(hookPath))})
`.trim();

export const hook = gitProcedure
  .meta({
    description: "manage git hooks for noto",
  })
  .input(z.object({}))
  .mutation(async (opts) => {
    // const { input, ctx } = opts;
    const gitRoot = await getGitRoot();
    if (!gitRoot) {
      p.log.error(color.red("not inside a git repository"));
      return await exit(1);
    }
    const absoluteSymlinkPath = path.join(gitRoot, symlinkPath);
    const exists = await fs
      .lstat(absoluteSymlinkPath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      if (isWindows) {
        const scriptContent = await fs.readFile(absoluteSymlinkPath, "utf8");
        if (scriptContent !== windowsHook) {
          console.warn("Hook is not installed");
          return;
        }
      } else {
        const realpath = await fs.realpath(absoluteSymlinkPath);
        if (realpath !== hookPath) {
          console.warn("Hook is not installed");
          return;
        }
      }

      await fs.rm(absoluteSymlinkPath);

      return await exit(0);

      const realPath = await fs.realpath(absoluteSymlinkPath).catch(() => null);
      if (realPath === hookPath) {
        p.log.info(color.green("noto git hook is already installed."));
        return await exit(0);
      }
    }

    await fs.mkdir(path.dirname(absoluteSymlinkPath), { recursive: true });

    if (isWindows) {
      await fs.writeFile(absoluteSymlinkPath, windowsHook, { mode: 0o755 });
    } else {
      await fs.symlink(hookPath, absoluteSymlinkPath);
      await fs.chmod(absoluteSymlinkPath, 0o755);
    }

    p.log.success(
      color.green(
        `noto git hook installed at ${color.gray(absoluteSymlinkPath)}`,
      ),
    );

    return await exit(0);
  });
