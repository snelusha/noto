import path from "node:path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

it("noto should just work", async () => {
  const binPath = path.resolve(__dirname, "../dist/index.js");
  const proc = await exec(process.execPath, [binPath, "--version"], {
    throwOnError: false,
  });
  expect(proc.stderr).toBe("");
  expect(proc.stdout).toMatch(/\d+\.\d+\.\d+/);
});
