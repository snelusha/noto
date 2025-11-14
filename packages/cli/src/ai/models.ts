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

export const DEFAULT_MODEL: AvailableModels = "gemini-2.0-flash";

export const models: Record<AvailableModels, LanguageModelV2> = {
  "gemini-1.5-flash": google("gemini-1.5-flash"),
  "gemini-1.5-flash-latest": google("gemini-1.5-flash-latest"),
  "gemini-1.5-flash-8b": google("gemini-1.5-flash-8b"),
  "gemini-1.5-flash-8b-latest": google("gemini-1.5-flash-8b-latest"),
  "gemini-1.5-pro": google("gemini-1.5-pro"),
  "gemini-1.5-pro-latest": google("gemini-1.5-pro-latest"),
  "gemini-2.0-flash-001": google("gemini-2.0-flash-001"),
  "gemini-2.0-flash": google("gemini-2.0-flash"),
  "gemini-2.0-flash-lite-preview-02-05": google(
    "gemini-2.0-flash-lite-preview-02-05",
  ),
  "gemini-2.5-flash-preview-04-17": google("gemini-2.5-flash-preview-04-17"),
  "gemini-2.5-pro-preview-05-06": google("gemini-2.5-pro-preview-05-06"),
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
