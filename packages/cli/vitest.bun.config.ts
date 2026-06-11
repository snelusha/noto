import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
      "~/test": path.resolve(__dirname, "test"),
      package: path.resolve(__dirname, "package.json"),
    },
  },
  test: {
    pool: "forks",
    experimental: {
      viteModuleRunner: false,
      nodeLoader: false,
    },
    reporters: [["default", { summary: false }]],
    include: ["test/storage.test.ts"],
  },
});
