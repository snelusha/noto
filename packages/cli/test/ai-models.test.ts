import { describe, it, expect, vi, beforeEach } from "vitest";

import type { AvailableModels } from "../src/ai/types";

// Mock storage before importing models
vi.mock("../src/utils/storage", () => ({
  StorageManager: {
    get: vi.fn().mockResolvedValue({}),
    update: vi.fn(),
  },
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: vi.fn(() => (modelName: string) => ({
    modelId: modelName,
    provider: "google",
  })),
}));

describe("AI Models", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const storage = await import("../src/utils/storage");
    vi.mocked(storage.StorageManager.get).mockResolvedValue({});
  });

  describe("DEFAULT_MODEL", () => {
    it("should be gemini-2.0-flash", async () => {
      const { DEFAULT_MODEL } = await import("../src/ai/models");
      expect(DEFAULT_MODEL).toBe("gemini-2.0-flash");
    });
  });

  describe("models", () => {
    it("should include all expected models", async () => {
      const { models } = await import("../src/ai/models");
      const expectedModels: AvailableModels[] = [
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-1.5-flash-8b-latest",
        "gemini-1.5-pro",
        "gemini-1.5-pro-latest",
        "gemini-2.0-flash-001",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite-preview-02-05",
        "gemini-2.5-flash-preview-04-17",
        "gemini-2.5-pro-preview-05-06",
      ];

      expectedModels.forEach((modelName) => {
        expect(models).toHaveProperty(modelName);
      });
    });

    it("should have correct number of models", async () => {
      const { models } = await import("../src/ai/models");
      expect(Object.keys(models)).toHaveLength(11);
    });

    it("should have model instances for each key", async () => {
      const { models } = await import("../src/ai/models");
      Object.entries(models).forEach(([key, model]) => {
        expect(model).toBeDefined();
        expect(typeof model).toBe("object");
      });
    });
  });

  describe("availableModels", () => {
    it("should be an array of model names", async () => {
      const { availableModels } = await import("../src/ai/models");
      expect(Array.isArray(availableModels)).toBe(true);
      expect(availableModels.length).toBeGreaterThan(0);
    });

    it("should include all model keys from models object", async () => {
      const { models, availableModels } = await import("../src/ai/models");
      const modelKeys = Object.keys(models);
      expect(availableModels).toEqual(modelKeys);
    });

    it("should include gemini-2.0-flash", async () => {
      const { availableModels } = await import("../src/ai/models");
      expect(availableModels).toContain("gemini-2.0-flash");
    });

    it("should include flash models", async () => {
      const { availableModels } = await import("../src/ai/models");
      const flashModels = availableModels.filter((m) => m.includes("flash"));
      expect(flashModels.length).toBeGreaterThan(0);
    });

    it("should include pro models", async () => {
      const { availableModels } = await import("../src/ai/models");
      const proModels = availableModels.filter((m) => m.includes("pro"));
      expect(proModels.length).toBeGreaterThan(0);
    });
  });

  describe("getModel", () => {
    it("should return model from storage when valid", async () => {
      const storage = await import("../src/utils/storage");
      const mockStorage = {
        llm: { model: "gemini-1.5-pro" as AvailableModels },
      };
      vi.mocked(storage.StorageManager.get).mockResolvedValue(mockStorage);

      const { getModel } = await import("../src/ai/models");
      const model = await getModel();
      
      expect(model).toBeDefined();
      expect(storage.StorageManager.update).not.toHaveBeenCalled();
    });

    it("should use default model when storage has no model", async () => {
      const storage = await import("../src/utils/storage");
      const mockStorage = { llm: {} };
      vi.mocked(storage.StorageManager.get).mockResolvedValue(mockStorage);

      const { getModel } = await import("../src/ai/models");
      const model = await getModel();
      
      expect(model).toBeDefined();
      expect(storage.StorageManager.update).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should use default model when storage is empty", async () => {
      const storage = await import("../src/utils/storage");
      vi.mocked(storage.StorageManager.get).mockResolvedValue({});

      const { getModel } = await import("../src/ai/models");
      const model = await getModel();
      
      expect(model).toBeDefined();
      expect(storage.StorageManager.update).toHaveBeenCalled();
    });

    it("should handle flash-8b models", async () => {
      const storage = await import("../src/utils/storage");
      const mockStorage = {
        llm: { model: "gemini-1.5-flash-8b" as AvailableModels },
      };
      vi.mocked(storage.StorageManager.get).mockResolvedValue(mockStorage);

      const { getModel } = await import("../src/ai/models");
      const model = await getModel();
      
      expect(model).toBeDefined();
    });
  });
});
