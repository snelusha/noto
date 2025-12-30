import { spawn } from "node:child_process";

import { z } from "zod";

import * as p from "@clack/prompts";
import color from "picocolors";
import semver from "semver";
import latestVersion, { VersionNotFoundError } from "latest-version";

import { baseProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { CacheManager } from "~/utils/cache";
import { getAvailableUpdate } from "~/utils/update";
import { getInstallationInfo } from "~/utils/installation-info";

import { name, version } from "package";

import type { UpdateTag } from "~/utils/update";

async function performUpgrade(targetVersion: string): Promise<void> {
  const installationInfo = await getInstallationInfo();
  if (!installationInfo.updateCommand) {
    if (installationInfo.updateMessage) {
      p.log.warn(installationInfo.updateMessage);
      await exit(0, false);
    }

    p.log.error("unable to determine update command for your installation.");
    await exit(1, false);
    return;
  }

  const updateCommand = installationInfo.updateCommand.replace(
    "@latest",
    `@${targetVersion}`,
  );

  const updateProcess = spawn(updateCommand, {
    stdio: "pipe",
    shell: true,
  });

  const spin = p.spinner();
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
      `automatic update failed. please try updating manually by running: ${installationInfo.updateCommand.replace("@latest", `@${targetVersion}`)}`,
    );
    await exit(1, false);
    return;
  }

  await CacheManager.update((current) => ({
    ...current,
    update: undefined,
  }));

  await exit(0, false);
}

export const upgrade = baseProcedure
  .meta({
    description: "upgrade noto",
  })
  .input(
    z.object({
      stable: z.boolean().optional().meta({
        description: "upgrade to the latest stable version",
      }),
      beta: z.boolean().optional().meta({
        description: "upgrade to the latest beta version",
      }),
      version: z.string().optional().meta({
        description: "target version to upgrade to",
        positional: true,
      }),
    }),
  )
  .mutation(async (opts) => {
    const { input } = opts;

    if (input.stable && input.beta) {
      p.log.error("please choose either --stable or --beta option, not both.");
      return await exit(1, false);
    }

    if (input.version && (input.stable || input.beta)) {
      p.log.error(
        "please choose either a specific version or --stable/--beta option, not both.",
      );
      return await exit(1, false);
    }

    if (input.version) {
      const spin = p.spinner();
      spin.start("validating version");

      const targetVersion = semver.clean(input.version);
      if (!targetVersion) {
        spin.stop();
        p.log.error(`invalid version format: ${color.red(input.version)}`);
        return await exit(1, false);
      }

      if (semver.lte(targetVersion, "1.3.4")) {
        spin.stop();
        p.log.error(
          `version ${color.red(targetVersion)} is not supported. the upgrade command requires version > 1.3.4`,
        );
        return await exit(1, false);
      }

      if (semver.eq(targetVersion, version)) {
        spin.stop();
        p.log.error(
          `you're already on version ${color.green(version)}`,
        );
        return await exit(1, false);
      }

      try {
        await latestVersion(name, { version: targetVersion });
      } catch (error) {
        spin.stop();
        if (error instanceof VersionNotFoundError) {
          p.log.error(
            `version ${color.red(targetVersion)} does not exist for ${name}`,
          );
        } else {
          p.log.error(`failed to validate version: ${error}`);
        }
        return await exit(1, false);
      }

      spin.stop(
        `upgrading noto from ${color.dim(version)} to ${color.green(targetVersion)}`,
      );

      return await performUpgrade(targetVersion);
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

    return await performUpgrade(upgradeVersion);
  });
