import * as p from "@clack/prompts";
import color from "picocolors";
import dedent from "dedent";

import { getAvailableUpdate } from "~/utils/update";

import { getInstallationInfo } from "~/utils/installation-info";

export async function displayUpdateNotice() {
  const update = await getAvailableUpdate();
  if (update) {
    const installationInfo = await getInstallationInfo();
    const ins = installationInfo.updateMessage;
    p.log.warn(
      dedent`A new version of noto is available: ${color.dim(update.current)} → ${color.green(update.latest)}
      ${ins ?? ""}`.trim(),
    );
  }
}

export const exit = async (code?: number, displayUpdate: boolean = true) => {
  if (displayUpdate) await displayUpdateNotice();

  await new Promise((resolve) => setTimeout(resolve, 1));
  console.log();
  process.exit(code);
};
