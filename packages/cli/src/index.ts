import omelette from "omelette";
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
}).run({
  completion: async () => {
    const completion = omelette("noto");

    completion.on("complete", function (fragment, { reply }) {
      reply(["your-command-1", "your-command-2", "--your-flag"]);
    });

    if (process.argv.includes("--setup-completion")) {
      completion.setupShellInitFile();
    } else if (process.argv.includes("--remove-completion")) {
      completion.cleanupShellInitFile();
    }
    return completion;
  },
});
