import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { StorageManager } from "@/utils/storage";

import type { LanguageModelV1 } from "ai";

import type { AvailableModels } from "@/ai/types";

import { NotoError } from "@/errors";

const google = createGoogleGenerativeAI({
  apiKey: (await StorageManager.get()).llm?.apiKey ?? "api-key",
});

export const defaultModel: AvailableModels = "gemini-2.0-pro-exp-02-05";

export const models: Record<AvailableModels, LanguageModelV1> = {
  "gemini-1.5-flash": google("gemini-1.5-flash"),
  "gemini-1.5-flash-latest": google("gemini-1.5-flash-latest"),
  "gemini-1.5-flash-8b": google("gemini-1.5-flash-8b"),
  "gemini-1.5-flash-8b-latest": google("gemini-1.5-flash-8b-latest"),
  "gemini-1.5-pro": google("gemini-1.5-pro"),
  "gemini-1.5-pro-latest": google("gemini-1.5-pro-latest"),
  "gemini-2.0-flash-lite-preview-02-05": google(
    "gemini-2.0-flash-lite-preview-02-05"
  ),
  "gemini-2.0-flash-exp": google("gemini-2.0-flash-exp"),
  "gemini-2.0-pro-exp-02-05": google("gemini-2.0-pro-exp-02-05"),
};

export const availableModels = Object.keys(models) as AvailableModels[];

export const getModel = async () => {
  const model = (await StorageManager.get()).llm?.model ?? defaultModel;

  if (!availableModels.includes(model)) {
    throw new NotoError({
      code: "model-not-found",
      message: `model "${model}" not found.`,
    });
  }

  return models[model];
};
