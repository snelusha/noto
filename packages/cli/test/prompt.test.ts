import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { getPromptFile } from "../src/utils/prompt";
import * as git from "../src/utils/git";

const tempDir = path.resolve(os.tmpdir(), ".noto-prompt-test");

describe("getPromptFile", () => {
  beforeAll(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  beforeEach(async () => {
    // Clean up
    try {
      await fs.rm(path.join(tempDir, ".noto"), {
        recursive: true,
        force: true,
      });
    } catch {}
    vi.clearAllMocks();
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should find prompt file in .noto directory", async () => {
    const notoDir = path.join(tempDir, ".noto");
    await fs.mkdir(notoDir, { recursive: true });
    const promptPath = path.join(notoDir, "commit-prompt.md");
    await fs.writeFile(promptPath, "# Guidelines");

    vi.spyOn(git, "getGitRoot").mockResolvedValue(tempDir);

    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBe(promptPath);
  });

  it("should return undefined when prompt file does not exist", async () => {
    vi.spyOn(git, "getGitRoot").mockResolvedValue(tempDir);

    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBeUndefined();
  });

  it("should find prompt file in parent directory", async () => {
    const notoDir = path.join(tempDir, ".noto");
    await fs.mkdir(notoDir, { recursive: true });
    const promptPath = path.join(notoDir, "commit-prompt.md");
    await fs.writeFile(promptPath, "# Guidelines");

    const subDir = path.join(tempDir, "sub", "dir");
    await fs.mkdir(subDir, { recursive: true });

    vi.spyOn(git, "getGitRoot").mockResolvedValue(tempDir);

    const originalCwd = process.cwd();
    process.chdir(subDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBe(promptPath);
  });

  it("should stop at git root", async () => {
    const gitRoot = path.join(tempDir, "repo");
    await fs.mkdir(gitRoot, { recursive: true });

    const subDir = path.join(gitRoot, "sub");
    await fs.mkdir(subDir, { recursive: true });

    // Create prompt file outside git root
    const outsideNoto = path.join(tempDir, ".noto");
    await fs.mkdir(outsideNoto, { recursive: true });
    await fs.writeFile(
      path.join(outsideNoto, "commit-prompt.md"),
      "# Outside"
    );

    vi.spyOn(git, "getGitRoot").mockResolvedValue(gitRoot);

    const originalCwd = process.cwd();
    process.chdir(subDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBeUndefined();
  });

  it("should use cwd as stopAt when no git root", async () => {
    const notoDir = path.join(tempDir, ".noto");
    await fs.mkdir(notoDir, { recursive: true });
    const promptPath = path.join(notoDir, "commit-prompt.md");
    await fs.writeFile(promptPath, "# Guidelines");

    vi.spyOn(git, "getGitRoot").mockResolvedValue(null);

    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBe(promptPath);
  });

  it("should only find files, not directories", async () => {
    const notoDir = path.join(tempDir, ".noto");
    await fs.mkdir(notoDir, { recursive: true });
    // Create a directory with the same name instead of a file
    await fs.mkdir(path.join(notoDir, "commit-prompt.md"), {
      recursive: true,
    });

    vi.spyOn(git, "getGitRoot").mockResolvedValue(tempDir);

    const originalCwd = process.cwd();
    process.chdir(tempDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBeUndefined();
  });

  it("should handle nested directory structure", async () => {
    const deepDir = path.join(tempDir, "a", "b", "c", "d");
    await fs.mkdir(deepDir, { recursive: true });

    const notoDir = path.join(tempDir, "a", ".noto");
    await fs.mkdir(notoDir, { recursive: true });
    const promptPath = path.join(notoDir, "commit-prompt.md");
    await fs.writeFile(promptPath, "# Guidelines");

    vi.spyOn(git, "getGitRoot").mockResolvedValue(path.join(tempDir, "a"));

    const originalCwd = process.cwd();
    process.chdir(deepDir);

    const result = await getPromptFile();
    
    process.chdir(originalCwd);

    expect(result).toBe(promptPath);
  });
});
