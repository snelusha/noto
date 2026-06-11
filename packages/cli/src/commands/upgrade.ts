import { spawn } from "node:child_process";

import { z } from "zod";

import semver from "semver";
import { commandValidator, flag } from "@crustjs/validate";
import { dim, green } from "@crustjs/style";

import { app } from "~/app";
import { withIntro } from "~/plugins/context";
import { log } from "~/ui/log";
import { spinner } from "~/ui/prompts";
import { CacheManager } from "~/utils/cache";
import { getInstallationInfo } from "~/utils/installation-info";
import { exit } from "~/utils/process";
import { getAvailableUpdate } from "~/utils/update";

import { version } from "package";

import type { UpdateTag } from "~/utils/update";

async function performUpgrade(targetVersion: string): Promise<void> {
  const installationInfo = await getInstallationInfo();
  if (!installationInfo.updateCommand) {
    if (installationInfo.updateMessage) {
      log.warn(installationInfo.updateMessage);
      return await exit(0, false);
    }

    log.error("unable to determine update command for your installation.");
    return await exit(1, false);
  }

  const updateCommand = installationInfo.updateCommand.replace(
    "@latest",
    `@${targetVersion}`,
  );

  const updateProcess = spawn(updateCommand, {
    stdio: "pipe",
    shell: true,
  });

  try {
    await spinner({
      message: "upgrading noto",
      task: async () =>
        new Promise<void>((resolve, reject) => {
          updateProcess.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error("upgrade failed"));
          });
        }),
    });
    log.success(green("noto has been updated successfully!"));
  } catch {
    log.error(
      `automatic update failed. please try updating manually by running: ${installationInfo.updateCommand}`,
    );
    return await exit(1, false);
  }

  await CacheManager.update((current) => ({
    ...current,
    update: undefined,
  }));

  return await exit(0, false);
}

export const upgradeCmd = app
  .sub("upgrade")
  .meta({ description: "upgrade noto" })
  .flags({
    stable: flag(z.boolean().default(false), {
      type: "boolean",
      description: "upgrade to the latest stable version",
    }),
    beta: flag(z.boolean().default(false), {
      type: "boolean",
      description: "upgrade to the latest beta version",
    }),
  })
  .run(
    commandValidator(async ({ flags }) => {
      withIntro();

      if (flags.stable && flags.beta) {
        log.error("please choose either --stable or --beta option, not both.");
        return await exit(1, false);
      }

      const tag: UpdateTag = flags.stable
        ? "stable"
        : flags.beta
          ? "beta"
          : "auto";

      const update = await spinner({
        message: "fetching latest version",
        task: async () => getAvailableUpdate(true, true, tag),
      });

      if (!update) {
        log.dim(
          `You're already on the latest version of noto (which is ${version})`,
        );
        return await exit(0, false);
      }

      log.step(
        `noto ${green(update.latest)} is out! You are on ${dim(update.current)}.`,
      );

      const isPrerelease = semver.prerelease(update.latest) !== null;
      const upgradeVersion =
        isPrerelease || tag === "beta" ? "beta" : update.latest;

      return await performUpgrade(upgradeVersion);
    }),
  );
