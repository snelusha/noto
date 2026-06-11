import path from "node:path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

it("noto should just work", async () => {
  const cliPath = path.resolve(__dirname, "../src/cli.ts");
  const proc = await exec("bun", [cliPath, "--version"], {
    throwOnError: false,
  });
  expect(proc.stderr).toBe("");
  expect(proc.stdout).toMatch(/\d+\.\d+\.\d+/);
});
