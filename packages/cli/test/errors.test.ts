import { describe, it, expect } from "vitest";

import { NotoError } from "../src/errors";

describe("NotoError", () => {
  it("should create error with code and message", () => {
    const error = new NotoError({
      code: "model-not-configured",
      message: "Model is not configured",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(NotoError);
    expect(error.code).toBe("model-not-configured");
    expect(error.message).toBe("Model is not configured");
  });

  it("should create error with code only", () => {
    const error = new NotoError({
      code: "model-not-found",
    });

    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe("model-not-found");
    expect(error.message).toBe("");
  });

  it("should support model-not-configured code", () => {
    const error = new NotoError({
      code: "model-not-configured",
      message: "Test message",
    });

    expect(error.code).toBe("model-not-configured");
  });

  it("should support model-not-found code", () => {
    const error = new NotoError({
      code: "model-not-found",
      message: "Test message",
    });

    expect(error.code).toBe("model-not-found");
  });

  it("should preserve error prototype chain", () => {
    const error = new NotoError({
      code: "model-not-configured",
    });

    expect(error instanceof NotoError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });

  it("should allow error to be caught and checked", () => {
    try {
      throw new NotoError({
        code: "model-not-found",
        message: "Model not available",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(NotoError);
      if (error instanceof NotoError) {
        expect(error.code).toBe("model-not-found");
        expect(error.message).toBe("Model not available");
      }
    }
  });

  it("should have correct error name", () => {
    const error = new NotoError({
      code: "model-not-configured",
      message: "Test",
    });

    expect(error.name).toBe("Error");
  });

  it("should be differentiable from regular errors", () => {
    const notoError = new NotoError({
      code: "model-not-configured",
    });
    const regularError = new Error("Regular error");

    expect(notoError instanceof NotoError).toBe(true);
    expect(regularError instanceof NotoError).toBe(false);
  });

  it("should support error with empty message", () => {
    const error = new NotoError({
      code: "model-not-found",
      message: "",
    });

    expect(error.code).toBe("model-not-found");
    expect(error.message).toBe("");
  });

  it("should support error with long message", () => {
    const longMessage = "A".repeat(1000);
    const error = new NotoError({
      code: "model-not-configured",
      message: longMessage,
    });

    expect(error.message).toBe(longMessage);
    expect(error.message).toHaveLength(1000);
  });
});
