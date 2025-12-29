import { spawn } from "node:child_process";

import { z } from "zod";
import * as p from "@clack/prompts";
import color from "picocolors";
import semver from "semver";

import { baseProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { CacheManager } from "~/utils/cache";
import { getAvailableUpdate, type Channel } from "~/utils/update";
import { getInstallationInfo } from "~/utils/installation-info";

import { version } from "package";

export const upgrade = baseProcedure
  .meta({
    description: "upgrade noto",
  })
  .input(
    z.object({
      stable: z.boolean().optional().meta({
        description: "force upgrade to the latest stable version",
      }),
      beta: z.boolean().optional().meta({
        description: "force upgrade to the latest beta version",
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    // Validate that only one channel flag is used at a time
    if (input.stable && input.beta) {
      p.log.error("cannot use both --stable and --beta flags at the same time");
      return await exit(1, false);
    }

    const channel: Channel = input.stable
      ? "stable"
      : input.beta
        ? "beta"
        : "auto";

    const spin = p.spinner();
    spin.start("fetching latest version");
    const update = await getAvailableUpdate(true, true, channel);
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

    let versionTag: string;
    if (channel === "beta") {
      versionTag = "@beta";
    } else if (channel === "stable") {
      versionTag = `@${update.latest}`;
    } else {
      // auto mode: use existing logic based on the fetched version
      versionTag = isPrerelease ? "@beta" : `@${update.latest}`;
    }

    const updateCommand = installationInfo.updateCommand.replace(
      "@latest",
      versionTag,
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
