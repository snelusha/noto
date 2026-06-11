#!/usr/bin/env bun

import { didYouMeanPlugin, helpPlugin, versionPlugin } from "@crustjs/plugins";

import {
  app,
  checkoutCmd,
  configCmd,
  initCmd,
  notoCmd,
  prevCmd,
  upgradeCmd,
} from "~/commands";
import { initializeCache } from "~/utils/cache";
import { initializeStorage } from "~/utils/storage";
import { checkForUpdate } from "~/utils/update";

import { version } from "package";

await initializeStorage();
await initializeCache();
void checkForUpdate(true);

await app
  .use(versionPlugin(version))
  .use(didYouMeanPlugin())
  .use(helpPlugin())
  .command(notoCmd)
  .command(prevCmd)
  .command(checkoutCmd)
  .command(initCmd)
  .command(upgradeCmd)
  .command(configCmd)
  .execute();

export { app };
