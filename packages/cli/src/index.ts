import { createCli } from "trpc-cli";

import { version as packageVersion } from "package";

import { router } from "~/router";

import { cleanupLegacyStorage } from "~/utils/storage";
import { checkForUpdate } from "~/utils/update";

const args = process.argv.slice(2);

const version = process.env.VERSION ?? packageVersion;

if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
}

void cleanupLegacyStorage();
void checkForUpdate(true);

void createCli({
  name: "noto",
  router,
  version,
}).run();
