import { configSub } from "~/commands/config/base";
import { keyCmd } from "~/commands/config/key";
import { modelCmd } from "~/commands/config/model";
import { resetCmd } from "~/commands/config/reset";

export const configCmd = configSub
  .command(keyCmd)
  .command(modelCmd)
  .command(resetCmd);
