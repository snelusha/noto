import { describe, it, expect, vi, beforeEach } from "vitest";

const mockDiff = vi.fn();

vi.mock("simple-git", () => {
  return {
    default: vi.fn(() => ({
      diff: mockDiff,
      checkIsRepo: vi.fn(),
      revparse: vi.fn(),
      raw: vi.fn(),
      log: vi.fn(),
      branch: vi.fn(),
      checkout: vi.fn(),
      checkoutLocalBranch: vi.fn(),
      commit: vi.fn(),
      push: vi.fn(),
    })),
  };
});

describe("getStagedDiff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the diff of staged changes", async () => {
    const { getStagedDiff } = await import("~/utils/git");
    const diffText =
      "diff --git a/file1.txt b/file1.txt\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1 +1 @@\n-Hello\n+Hi\n";
    mockDiff.mockResolvedValueOnce(diffText);
    const result = await getStagedDiff();
    expect(result).toEqual(diffText);
  });

  it("should return an empty string when there is no diff", async () => {
    const { getStagedDiff } = await import("~/utils/git");
    mockDiff.mockResolvedValueOnce("");
    const result = await getStagedDiff();
    expect(result).toEqual("");
  });
});
