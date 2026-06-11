import dedent from "dedent";
import { dim, green } from "@crustjs/style";

import { log } from "~/ui/log";
import { getAvailableUpdate } from "~/utils/update";

export async function displayUpdateNotice() {
  const update = await getAvailableUpdate();
  if (!update) return;

  log.warn(
    dedent`A new version of noto is available: ${dim(update.current)} → ${green(update.latest)}
      Please run \`noto upgrade\` to update`.trim(),
  );
}
