import { describe, it, expect, vi, afterEach } from "vitest";

import { exit } from "../src/utils/process";

describe("exit", () => {
  const originalExit = process.exit;
  const exitMock = vi.fn();

  afterEach(() => {
    process.exit = originalExit;
    vi.clearAllMocks();
  });

  it("should call process.exit with code 0 by default", async () => {
    process.exit = exitMock as any;
    
    const exitPromise = exit();
    
    // Wait for the timeout
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(exitMock).toHaveBeenCalledWith(undefined);
  });

  it("should call process.exit with provided code", async () => {
    process.exit = exitMock as any;
    
    const exitPromise = exit(1);
    
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(exitMock).toHaveBeenCalledWith(1);
  });

  it("should call process.exit with code 0", async () => {
    process.exit = exitMock as any;
    
    const exitPromise = exit(0);
    
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(exitMock).toHaveBeenCalledWith(0);
  });

  it("should call process.exit with custom error codes", async () => {
    process.exit = exitMock as any;
    
    const exitPromise = exit(42);
    
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(exitMock).toHaveBeenCalledWith(42);
  });

  it("should wait 1ms before exiting", async () => {
    process.exit = exitMock as any;
    
    const start = Date.now();
    const exitPromise = exit(0);
    
    await new Promise((resolve) => setTimeout(resolve, 10));
    const elapsed = Date.now() - start;
    
    expect(elapsed).toBeGreaterThanOrEqual(1);
    expect(exitMock).toHaveBeenCalled();
  });

  it("should log empty line before exit", async () => {
    process.exit = exitMock as any;
    const consoleLogSpy = vi.spyOn(console, "log");
    
    const exitPromise = exit(0);
    
    await new Promise((resolve) => setTimeout(resolve, 10));
    
    expect(consoleLogSpy).toHaveBeenCalledWith();
    consoleLogSpy.mockRestore();
  });
});
