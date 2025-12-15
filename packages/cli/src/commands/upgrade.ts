import { spawn } from "node:child_process";

import * as p from "@clack/prompts";
import color from "picocolors";
import semver from "semver";
import { z } from "zod";

import { baseProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { CacheManager } from "~/utils/cache";
import { getAvailableUpdate } from "~/utils/update";
import { getInstallationInfo } from "~/utils/installation-info";

import { version } from "package";

export const upgrade = baseProcedure
  .meta({
    description: "upgrade noto",
  })
  .input(
    z.object({
      stable: z.boolean().optional().meta({
        description: "upgrade to the latest stable version",
      }),
      prerelease: z.boolean().optional().meta({
        description: "upgrade to the latest prerelease version",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;
    const spin = p.spinner();
    spin.start("fetching latest version");
    const update = await getAvailableUpdate(true, true, {
      forceStable: input?.stable,
      forcePrerelease: input?.prerelease,
    });
    if (!update) {
      spin.stop(
        `You're already on the latest version of noto (${color.dim(`which is ${version}`)})`,
      );
      return await exit(0, false);
    }

    spin.stop(
      `noto ${color.green(update.latest)} is out! You are on ${color.dim(update.current)}.`,
    );

    const installationInfo = await getInstallationInfo();
    if (!installationInfo.updateCommand) {
      if (installationInfo.updateMessage) {
        p.log.warn(installationInfo.updateMessage);
        return await exit(0, false);
      }

      p.log.error("unable to determine update command for your installation.");
      return await exit(1, false);
    }

    const isPrerelease = semver.prerelease(update.latest) !== null;

    const updateCommand = installationInfo.updateCommand.replace(
      "@latest",
      isPrerelease ? "@beta" : `@${update.latest}`,
    );

    const updateProcess = spawn(updateCommand, {
      stdio: "pipe",
      shell: true,
    });

    spin.start("upgrading noto");
    try {
      await new Promise<void>((resolve, reject) => {
        updateProcess.on("close", (code) => {
          if (code === 0) resolve();
          else reject();
        });
      });
      spin.stop(color.green("noto has been updated successfully!"));
    } catch {
      p.log.error(
        `automatic update failed. please try updating manually by running: ${installationInfo.updateCommand}`,
      );
      return await exit(1, false);
    }

    await CacheManager.update((current) => ({
      ...current,
      update: undefined,
    }));

    return await exit(0, false);
  });
