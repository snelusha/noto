import { createGoogleGenerativeAI } from "@ai-sdk/google";

import { StorageManager } from "~/utils/storage";

import type { LanguageModelV2 } from "@ai-sdk/provider";

import type { AvailableModels } from "~/ai/types";

const google = createGoogleGenerativeAI({
  apiKey:
    process.env.NOTO_API_KEY ||
    (await StorageManager.get()).llm?.apiKey ||
    "api-key",
});

export const DEFAULT_MODEL: AvailableModels = "gemini-2.5-flash-lite";

export const models: Record<AvailableModels, LanguageModelV2> = {
  "gemini-2.5-flash": google("gemini-2.5-flash"),
  "gemini-2.5-flash-lite": google("gemini-2.5-flash-lite"),
  "gemini-2.5-pro": google("gemini-2.5-pro"),
  "gemini-3-flash-preview": google("gemini-3-flash-preview"),
  "gemini-3-pro-preview": google("gemini-3-pro-preview"),
};

export const availableModels = Object.keys(models) as AvailableModels[];

export const getModel = async () => {
  let model = (await StorageManager.get()).llm?.model;

  if (!model || !availableModels.includes(model as AvailableModels)) {
    model = DEFAULT_MODEL;
    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        model: DEFAULT_MODEL,
      },
    }));
  }

  return models[model as AvailableModels];
};
