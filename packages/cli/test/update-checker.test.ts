import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { checkForUpdates } from "~/utils/update-checker";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe("update-checker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.NOTO_VERSION;
  });

  it("should detect when update is available", async () => {
    process.env.NOTO_VERSION = "1.2.0";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "v1.3.2" }, { name: "v1.2.0" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(true);
    expect(result.currentVersion).toBe("1.2.0");
    expect(result.latestVersion).toBe("1.3.2");
  });

  it("should detect when already on latest version", async () => {
    process.env.NOTO_VERSION = "1.3.2";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "v1.3.2" }, { name: "v1.2.0" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(false);
    expect(result.currentVersion).toBe("1.3.2");
    expect(result.latestVersion).toBe("1.3.2");
  });

  it("should handle tags without v prefix", async () => {
    process.env.NOTO_VERSION = "1.2.0";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "1.3.2" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(true);
    expect(result.latestVersion).toBe("1.3.2");
  });

  it("should skip check if checked recently", async () => {
    const recentTime = Date.now() - 1000; // 1 second ago

    const result = await checkForUpdates({
      lastUpdateCheck: recentTime,
    });

    expect(result.hasUpdate).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("should handle fetch errors gracefully", async () => {
    process.env.NOTO_VERSION = "1.2.0";

    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(false);
  });

  it("should handle missing version in dev mode", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "v1.3.2" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(false);
  });

  it("should correctly compare semantic versions", async () => {
    process.env.NOTO_VERSION = "1.2.9";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "v1.3.0" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(true);
  });

  it("should not show update for older tags", async () => {
    process.env.NOTO_VERSION = "2.0.0";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ name: "v1.9.9" }],
    });

    const result = await checkForUpdates({});

    expect(result.hasUpdate).toBe(false);
  });
});
