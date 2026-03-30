import path from "node:path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

it("noto should just work", async () => {
  const binPath = path.resolve(__dirname, "../dist/index.js");
  // OpenTUI requires Bun; the bundled CLI imports @opentui/core (Bun-native).
  const proc = await exec("bun", [binPath, "--version"], {
    throwOnError: false,
  });
  expect(proc.stderr).toBe("");
  expect(proc.stdout).toMatch(/\d+\.\d+\.\d+/);
});
