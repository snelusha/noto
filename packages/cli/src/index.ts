import { createCli } from "trpc-cli";

import { version } from "package";

import { router } from "~/router";

void createCli({ name: "noto", router, version }).run();
