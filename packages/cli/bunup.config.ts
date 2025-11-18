import { defineConfig } from "bunup";

export default defineConfig({
  entry: ["src/index.ts"],
  minify: true,
  banner: "#!/usr/bin/env node",
  footer: "// Made by a human on earth!",
});
