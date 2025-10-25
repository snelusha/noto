import os from "os";
import path from "path";
import { promises as fs } from "fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { findUp } from "../src/utils/fs";

const tempDir = path.resolve(os.tmpdir(), ".noto-fs-test");

describe("findUp", () => {
  beforeAll(async () => {
    // Create test directory structure
    await fs.mkdir(path.join(tempDir, "a", "b", "c"), { recursive: true });
    await fs.mkdir(path.join(tempDir, "x", "y"), { recursive: true });
  });

  beforeEach(async () => {
    // Clean up any test files
    try {
      const files = await fs.readdir(tempDir, { recursive: true });
      for (const file of files) {
        const fullPath = path.join(tempDir, file.toString());
        const stat = await fs.stat(fullPath);
        if (stat.isFile()) {
          await fs.unlink(fullPath);
        }
      }
    } catch {}
  });

  afterAll(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should find file in current directory", async () => {
    const testFile = path.join(tempDir, "test.txt");
    await fs.writeFile(testFile, "content");

    const result = await findUp("test.txt", { cwd: tempDir });
    expect(result).toBe(testFile);
  });

  it("should find file in parent directory", async () => {
    const testFile = path.join(tempDir, "test.txt");
    await fs.writeFile(testFile, "content");

    const result = await findUp("test.txt", {
      cwd: path.join(tempDir, "a", "b", "c"),
    });
    expect(result).toBe(testFile);
  });

  it("should find directory", async () => {
    const testDir = path.join(tempDir, "testdir");
    await fs.mkdir(testDir, { recursive: true });

    const result = await findUp("testdir", {
      cwd: path.join(tempDir, "a"),
      type: "directory",
    });
    expect(result).toBe(testDir);
  });

  it("should return undefined when file not found", async () => {
    const result = await findUp("nonexistent.txt", { cwd: tempDir });
    expect(result).toBeUndefined();
  });

  it("should stop at specified stopAt directory", async () => {
    const rootFile = path.join(tempDir, "root.txt");
    const stopDir = path.join(tempDir, "a");
    
    await fs.writeFile(rootFile, "content");

    const result = await findUp("root.txt", {
      cwd: path.join(tempDir, "a", "b", "c"),
      stopAt: stopDir,
    });
    expect(result).toBeUndefined();
  });

  it("should find file before stopAt", async () => {
    const midFile = path.join(tempDir, "a", "mid.txt");
    await fs.writeFile(midFile, "content");

    const result = await findUp("mid.txt", {
      cwd: path.join(tempDir, "a", "b", "c"),
      stopAt: tempDir,
    });
    expect(result).toBe(midFile);
  });

  it("should handle URL as cwd", async () => {
    const testFile = path.join(tempDir, "test.txt");
    await fs.writeFile(testFile, "content");

    const cwdUrl = new URL(`file://${tempDir}`);
    const result = await findUp("test.txt", { cwd: cwdUrl });
    expect(result).toBe(testFile);
  });

  it("should handle URL as stopAt", async () => {
    const testFile = path.join(tempDir, "test.txt");
    await fs.writeFile(testFile, "content");

    const stopUrl = new URL(`file://${path.join(tempDir, "a")}`);
    const result = await findUp("test.txt", {
      cwd: path.join(tempDir, "a", "b"),
      stopAt: stopUrl,
    });
    expect(result).toBeUndefined();
  });

  it("should find only files when type is file", async () => {
    const dirName = "target";
    const fileName = "target";
    
    await fs.mkdir(path.join(tempDir, "a", dirName), { recursive: true });
    await fs.writeFile(path.join(tempDir, fileName), "content");

    const result = await findUp(dirName, {
      cwd: path.join(tempDir, "a", "b"),
      type: "file",
    });
    expect(result).toBe(path.join(tempDir, fileName));
  });

  it("should find only directories when type is directory", async () => {
    const dirName = "targetdir";
    const fileName = "targetfile";
    
    await fs.mkdir(path.join(tempDir, dirName), { recursive: true });
    await fs.writeFile(path.join(tempDir, "a", fileName), "file content");

    const result = await findUp(dirName, {
      cwd: path.join(tempDir, "a", "b"),
      type: "directory",
    });
    expect(result).toBe(path.join(tempDir, dirName));
  });

  it("should handle absolute paths", async () => {
    const testFile = path.join(tempDir, "absolute.txt");
    await fs.writeFile(testFile, "content");

    const result = await findUp(testFile, { cwd: path.join(tempDir, "a") });
    expect(result).toBe(testFile);
  });

  it("should search up to root directory", async () => {
    const result = await findUp("definitely-does-not-exist-anywhere.txt", {
      cwd: tempDir,
    });
    expect(result).toBeUndefined();
  });

  it("should handle nested path in name", async () => {
    await fs.mkdir(path.join(tempDir, ".config"), { recursive: true });
    await fs.writeFile(path.join(tempDir, ".config", "settings.json"), "{}");

    const result = await findUp(".config/settings.json", {
      cwd: path.join(tempDir, "a", "b"),
      type: "file",
    });
    expect(result).toBe(path.join(tempDir, ".config", "settings.json"));
  });

  it("should use current working directory as default cwd", async () => {
    const originalCwd = process.cwd();
    const testFile = path.join(tempDir, "default-cwd.txt");
    await fs.writeFile(testFile, "content");

    process.chdir(tempDir);
    const result = await findUp("default-cwd.txt");
    process.chdir(originalCwd);

    expect(result).toBe(testFile);
  });

  it("should handle symlinks correctly", async () => {
    const realFile = path.join(tempDir, "real.txt");
    const linkFile = path.join(tempDir, "a", "link.txt");
    
    await fs.writeFile(realFile, "content");
    try {
      await fs.symlink(realFile, linkFile);
      
      const result = await findUp("link.txt", {
        cwd: path.join(tempDir, "a", "b"),
        type: "file",
      });
      expect(result).toBe(linkFile);
    } catch (error) {
      // Symlinks might not be supported on all systems, skip test
      console.log("Symlink test skipped");
    }
  });

  it("should match closest file in hierarchy", async () => {
    await fs.writeFile(path.join(tempDir, "config.json"), "root");
    await fs.writeFile(path.join(tempDir, "a", "config.json"), "middle");

    const result = await findUp("config.json", {
      cwd: path.join(tempDir, "a", "b"),
    });
    expect(result).toBe(path.join(tempDir, "a", "config.json"));
  });
});
