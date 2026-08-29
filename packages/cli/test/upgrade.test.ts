import { describe, expect, it } from "vitest";

import { resolveTargetVersion } from "~/commands/upgrade";

describe("upgrade target versions", () => {
  it("accepts and normalizes exact stable and prerelease versions", () => {
    expect(resolveTargetVersion("2.0.0")).toBe("2.0.0");
    expect(resolveTargetVersion(" v2.0.0-beta.3 ")).toBe("2.0.0-beta.3");
  });

  it("rejects tags, ranges, and incomplete versions", () => {
    expect(resolveTargetVersion("latest")).toBeNull();
    expect(resolveTargetVersion("^2.0.0")).toBeNull();
    expect(resolveTargetVersion("2.0")).toBeNull();
  });
});
