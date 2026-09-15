import * as p from "@clack/prompts";
import color from "picocolors";

import { prepareCommand } from "~/cli-runtime";

import { StorageManager } from "~/utils/storage";
import { exit } from "~/utils/process";

export async function reset(): Promise<void> {
  await prepareCommand();
  const confirm = await p.confirm({
    message: "are you sure you want to reset the configuration?",
  });

  if (p.isCancel(confirm) || !confirm) {
    p.log.error(color.red("nothing changed!"));
    return await exit(1);
  }

  await StorageManager.clear();

  p.log.success(color.green("configuration reset!"));

  await exit(0);
}
