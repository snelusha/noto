import { describe, it, expect } from "vitest";

import { hashString } from "../src/utils/hash";

describe("hashString", () => {
  it("should generate consistent SHA-1 hash for same input", () => {
    const content = "hello world";
    const hash1 = hashString(content);
    const hash2 = hashString(content);
    expect(hash1).toBe(hash2);
  });

  it("should generate different hashes for different inputs", () => {
    const hash1 = hashString("content1");
    const hash2 = hashString("content2");
    expect(hash1).not.toBe(hash2);
  });

  it("should handle empty string", () => {
    const hash = hashString("");
    expect(hash).toBe("e69de29bb2d1d6434b8b29ae775ad8c2e48c5391");
  });

  it("should handle multi-line content", () => {
    const content = "line1\nline2\nline3";
    const hash = hashString(content);
    expect(hash).toHaveLength(40); // SHA-1 produces 40 character hex string
    expect(hash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("should handle unicode characters", () => {
    const content = "Hello 世界 🌍";
    const hash = hashString(content);
    expect(hash).toHaveLength(40);
    expect(hash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("should handle special characters", () => {
    const content = "!@#$%^&*()_+-=[]{}|;':,.<>?/`~";
    const hash = hashString(content);
    expect(hash).toHaveLength(40);
    expect(hash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("should handle very long strings", () => {
    const content = "a".repeat(10000);
    const hash = hashString(content);
    expect(hash).toHaveLength(40);
    expect(hash).toMatch(/^[0-9a-f]{40}$/);
  });

  it("should produce git blob hash format", () => {
    // Git blob hash includes "blob <size>\0" prefix
    const content = "test";
    const hash = hashString(content);
    // Known git hash for "test" blob
    expect(hash).toBe("30d74d258442c7c65512eafab474568dd706c430");
  });

  it("should be case sensitive", () => {
    const hash1 = hashString("Hello");
    const hash2 = hashString("hello");
    expect(hash1).not.toBe(hash2);
  });

  it("should handle whitespace differences", () => {
    const hash1 = hashString("hello world");
    const hash2 = hashString("hello  world");
    const hash3 = hashString("hello\tworld");
    expect(hash1).not.toBe(hash2);
    expect(hash1).not.toBe(hash3);
    expect(hash2).not.toBe(hash3);
  });
});
