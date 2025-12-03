import * as p from "@clack/prompts";
import color from "picocolors";
import dedent from "dedent";

import { getAvailableUpdate } from "~/utils/update";

export async function displayUpdateNotice() {
  const update = await getAvailableUpdate();
  if (update)
    p.log.warn(
      dedent`A new version of noto is available: ${color.dim(update.current)} → ${color.green(update.latest)}
      Please run \`noto upgrade\` to update`.trim(),
    );
}

export const exit = async (code?: number, displayUpdate: boolean = true) => {
  if (displayUpdate) await displayUpdateNotice();

  await new Promise((resolve) => setTimeout(resolve, 1));
  console.log();
  process.exit(code);
};
