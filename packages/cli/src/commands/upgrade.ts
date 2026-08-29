import { spawn } from "node:child_process";

import { z } from "zod";

import * as p from "@clack/prompts";
import color from "picocolors";
import semver from "semver";

import { baseProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { CacheManager } from "~/utils/cache";
import { getAvailableUpdate } from "~/utils/update";
import { getInstallationInfo } from "~/utils/installation-info";

import { version } from "package";

import type { UpdateTag } from "~/utils/update";

export function resolveTargetVersion(target: string): string | null {
  return semver.valid(target.trim());
}

async function getUpdateCommand(
  targetVersion: string,
  isExplicitTarget: boolean = false,
): Promise<string | null> {
  const installationInfo = await getInstallationInfo();
  if (!installationInfo.updateCommand) {
    if (installationInfo.updateMessage) {
      if (isExplicitTarget) {
        p.log.error(
          `noto ${targetVersion} cannot be installed automatically. ${installationInfo.updateMessage}`,
        );
        await exit(1, false);
        return null;
      }

      p.log.warn(installationInfo.updateMessage);
      await exit(0, false);
      return null;
    }

    p.log.error("unable to determine update command for your installation.");
    await exit(1, false);
    return null;
  }

  return installationInfo.updateCommand.replace("@latest", `@${targetVersion}`);
}

async function performUpgrade(updateCommand: string): Promise<void> {
  const updateProcess = spawn(updateCommand, {
    stdio: "pipe",
    shell: true,
  });

  const spin = p.spinner();
  spin.start("upgrading noto");
  try {
    await new Promise<void>((resolve, reject) => {
      updateProcess.on("error", reject);
      updateProcess.on("close", (code) => {
        if (code === 0) resolve();
        else reject();
      });
    });
    spin.stop(color.green("noto has been updated successfully!"));
  } catch {
    p.log.error(
      `automatic update failed. please try updating manually by running: ${updateCommand}`,
    );
    return await exit(1, false);
  }

  await CacheManager.update((current) => ({
    ...current,
    update: undefined,
  }));

  return await exit(0, false);
}

export const upgrade = baseProcedure
  .meta({
    description: "upgrade noto",
  })
  .input(
    z.object({
      target: z.string().optional().meta({
        positional: true,
        description: "exact version to install",
      }),
      stable: z.boolean().optional().meta({
        description: "upgrade to the latest stable version",
      }),
      beta: z.boolean().optional().meta({
        description: "upgrade to the latest beta version",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    if (input.stable && input.beta) {
      p.log.error("please choose either --stable or --beta option, not both.");
      return await exit(1, false);
    }

    if (input.target !== undefined && (input.stable || input.beta)) {
      p.log.error("a target version cannot be used with --stable or --beta.");
      return await exit(1, false);
    }

    if (input.target !== undefined) {
      const targetVersion = resolveTargetVersion(input.target);
      if (!targetVersion) {
        p.log.error(
          "please provide an exact valid version, for example: noto upgrade 2.0.0",
        );
        return await exit(1, false);
      }

      const updateCommand = await getUpdateCommand(targetVersion, true);
      if (!updateCommand) return;

      return await performUpgrade(updateCommand);
    }

    const tag: UpdateTag = input.stable
      ? "stable"
      : input.beta
        ? "beta"
        : "auto";

    const spin = p.spinner();
    spin.start("fetching latest version");
    const update = await getAvailableUpdate(true, true, tag);
    if (!update) {
      spin.stop(
        `You're already on the latest version of noto (${color.dim(`which is ${version}`)})`,
      );
      return await exit(0, false);
    }

    spin.stop(
      `noto ${color.green(update.latest)} is out! You are on ${color.dim(update.current)}.`,
    );

    const isPrerelease = semver.prerelease(update.latest) !== null;
    const upgradeVersion =
      isPrerelease || tag === "beta" ? "beta" : update.latest;

    const updateCommand = await getUpdateCommand(upgradeVersion);
    if (!updateCommand) return;

    return await performUpgrade(updateCommand);
  });
