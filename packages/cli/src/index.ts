import { createCli } from "trpc-cli";

import { version as packageVersion } from "package";

import { router } from "~/router";

import { cleanupLegacyStorage } from "~/utils/storage";
import { setPositionalArgs } from "~/utils/positionals";
import { checkForUpdate } from "~/utils/update";

const argv = process.argv.slice(2);
const separator = argv.indexOf("--");
const args = separator === -1 ? argv : argv.slice(0, separator);
setPositionalArgs(separator === -1 ? [] : argv.slice(separator + 1));

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
}).run({ argv: args });
