import { createCli } from "trpc-cli";

import { version } from "package";

import { router } from "~/router";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
}

void createCli({
  name: "noto",
  router,
  version,
}).run();
