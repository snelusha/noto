import { defineConfig } from "bunup";

import { version } from "package";

import type { DefineConfigItem } from "bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  minify: true,
  banner: "#!/usr/bin/env node",
  footer: "// Made by a human on earth!",
  env: {
    NODE_ENV: "production",
    VERSION: version,
  },
}) as DefineConfigItem;
