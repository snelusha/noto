import { describe, it, expect, vi } from "vitest";

import { getBranch, getStagedDiff, git } from "~/utils/git";

vi.mock("simple-git", () => {
  return {
    simpleGit: () => ({
      diff: vi.fn(),
      raw: vi.fn(),
    }),
  };
});

describe("getBranch", () => {
  it("returns null when HEAD is unavailable", async () => {
    vi.mocked(git.raw).mockRejectedValueOnce(new Error("ambiguous argument 'HEAD'"));

    await expect(getBranch()).resolves.toBeNull();
  });
});

describe("getStagedDiff", () => {
  it("should return the diff of staged changes", async () => {
    const diffText =
      "diff --git a/file1.txt b/file1.txt\n--- a/file1.txt\n+++ b/file1.txt\n@@ -1 +1 @@\n-Hello\n+Hi\n";
    vi.mocked(git.diff).mockResolvedValueOnce(diffText);
    const result = await getStagedDiff();
    expect(result).toEqual(diffText);
  });

  it("should return an empty string when there is no diff", async () => {
    vi.mocked(git.diff).mockResolvedValueOnce("");
    const result = await getStagedDiff();
    expect(result).toEqual("");
  });
});
