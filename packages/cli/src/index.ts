import { createCli } from "trpc-cli";

import { version } from "package";

import { router } from "~/router";
import { initTRPC } from "@trpc/server";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
}

const hookName = "prepare-commit-msg";
const symlinkPath = `.git/hooks/${hookName}`;

export const isCalledFromGitHook = process.argv[1]
  .replace(/\\/g, "/")
  .endsWith(`/${symlinkPath}`);

if (isCalledFromGitHook) {
  console.log("Called from git hook");

  const caller = initTRPC.create().createCallerFactory(router)({});
  await caller.noto({
    copy: false,
    push: false,
    force: false,
    manual: false,
    message: false,
    apply: true,
  });
  process.exit(0);
}

void createCli({
  name: "noto",
  router,
  version,
}).run({});
