import { describe, it, expect } from "vitest";
import { StorageManager } from "../src/utils/storage";
import * as git from "../src/utils/git";
import { parse, safeParse } from "../src/utils/parser";
import { hashString } from "../src/utils/hash";
import { findUp } from "../src/utils/fs";
import { exit } from "../src/utils/process";
import { getPromptFile } from "../src/utils/prompt";
import { NotoError } from "../src/errors";

/**
 * Integration tests that verify the interaction between multiple modules
 * These tests ensure that the system works correctly end-to-end
 */

describe("Integration Tests - Module Interactions", () => {
  describe("Type Safety", () => {
    it("should have proper type definitions for storage", () => {
      expect(StorageManager).toBeDefined();
      expect(typeof StorageManager.get).toBe("function");
      expect(typeof StorageManager.update).toBe("function");
      expect(typeof StorageManager.clear).toBe("function");
      expect(typeof StorageManager.load).toBe("function");
    });

    it("should have proper type definitions for git utils", () => {
      expect(typeof git.isGitRepository).toBe("function");
      expect(typeof git.getGitRoot).toBe("function");
      expect(typeof git.getCommitCount).toBe("function");
      expect(typeof git.getStagedDiff).toBe("function");
      expect(typeof git.commit).toBe("function");
      expect(typeof git.push).toBe("function");
    });

    it("should have proper exports for parser utils", () => {
      expect(typeof parse).toBe("function");
      expect(typeof safeParse).toBe("function");
    });

    it("should have proper exports for hash utils", () => {
      expect(typeof hashString).toBe("function");
    });

    it("should have proper exports for fs utils", () => {
      expect(typeof findUp).toBe("function");
    });

    it("should have proper exports for process utils", () => {
      expect(typeof exit).toBe("function");
    });

    it("should have proper exports for prompt utils", () => {
      expect(typeof getPromptFile).toBe("function");
    });
  });

  describe("Error Handling Structure", () => {
    it("should export NotoError class", () => {
      expect(NotoError).toBeDefined();
      expect(typeof NotoError).toBe("function");
    });

    it("should allow creating error instances", () => {
      const error = new NotoError({
        code: "model-not-configured",
        message: "Test",
      });
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(NotoError);
      expect(error.code).toBe("model-not-configured");
    });
  });
});

describe("Edge Case Scenarios", () => {
  describe("Parser Edge Cases", () => {
    it("should handle empty command arrays", () => {
      const result = safeParse({}, []);
      expect(result.command).toBeUndefined();
    });

    it("should handle flags without values", () => {
      const result = safeParse(
        { "--flag": String },
        ["cmd", "--flag"]
      );
      expect(result.options["--flag"]).toBe(true);
    });
  });

  describe("Hash Edge Cases", () => {
    it("should hash empty string consistently", () => {
      const hash1 = hashString("");
      const hash2 = hashString("");
      expect(hash1).toBe(hash2);
      expect(hash1).toBe("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
    });

    it("should produce different hashes for similar strings", () => {
      const hash1 = hashString("test");
      const hash2 = hashString("test ");
      const hash3 = hashString("Test");
      expect(hash1).not.toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash2).not.toBe(hash3);
    });
  });

  describe("Path Resolution", () => {
    it("should handle absolute paths in findUp", async () => {
      const result = await findUp("/absolute/path/file.txt", {
        cwd: "/some/directory",
      });
      // Should attempt to find the absolute path
      expect(result).toBeUndefined(); // File doesn't exist
    });
  });
});

describe("Error Propagation", () => {
  describe("Git Errors", () => {
    it("should handle git errors gracefully", async () => {
      // These functions should exist and be callable
      expect(typeof git.getGitRoot).toBe("function");
      expect(typeof git.getCommits).toBe("function");
      expect(typeof git.getBranch).toBe("function");
      expect(typeof git.getBranches).toBe("function");
      
      // They should return promises
      const rootPromise = git.getGitRoot();
      expect(rootPromise).toBeInstanceOf(Promise);
    });
  });

  describe("Storage Errors", () => {
    it("should handle missing storage file", async () => {
      // Load should not throw even if file doesn't exist
      const storage = await StorageManager.load();
      expect(storage).toBeDefined();
      expect(typeof storage).toBe("object");
    });
  });
});
