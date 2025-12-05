import { spawn } from "node:child_process";

import * as p from "@clack/prompts";
import color from "picocolors";

import { baseProcedure } from "~/trpc";

import { exit } from "~/utils/process";
import { getAvailableUpdate } from "~/utils/update";
import { getInstallationInfo } from "~/utils/installation-info";

import { version } from "package";

export const upgrade = baseProcedure
  .meta({
    description: "upgrade noto",
  })
  .mutation(async () => {
    const spin = p.spinner();
    spin.start("fetching latest version");
    const update = await getAvailableUpdate(true, true);
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

    const isPrerelease = update.latest.includes("beta");

    const updateCommand = isPrerelease
      ? installationInfo.updateCommand.replace("@latest", "@beta")
      : installationInfo.updateCommand;

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
    return await exit(0, false);
  });
