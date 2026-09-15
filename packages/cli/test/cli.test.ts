import path from "node:path";

import { exec } from "tinyexec";

import { expect, it } from "vitest";

const binPath = path.resolve(__dirname, "../dist/index.js");

it("prints the package version", async () => {
  const proc = await exec(process.execPath, [binPath, "--version"], {
    throwOnError: false,
  });
  expect(proc.stderr).toBe("");
  expect(proc.stdout).toMatch(/^\d+\.\d+\.\d+/);
});

it("renders Crust help for the root and nested commands", async () => {
  const root = await exec(process.execPath, [binPath, "--help"], {
    throwOnError: false,
  });
  const nested = await exec(
    process.execPath,
    [binPath, "config", "key", "--help"],
    {
      throwOnError: false,
    },
  );

  expect(root.exitCode).toBe(0);
  expect(root.stdout).toContain("Commands:");
  expect(root.stdout).toContain("config");
  expect(root.stdout).toContain("upgrade");
  expect(nested.exitCode).toBe(0);
  expect(nested.stdout).toContain("[apiKey]");
});
