import { defineConfig } from "bunup";

import { version } from "package";

export default defineConfig({
  entry: ["src/index.ts"],
  minify: true,
  banner: "#!/usr/bin/env bun",
  footer: "// Made by a human on earth!",
  env: {
    NODE_ENV: "production",
    VERSION: version,
  },
});
