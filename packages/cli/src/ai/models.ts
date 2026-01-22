import { createGoogleGenerativeAI } from "@ai-sdk/google";

import * as p from "@clack/prompts";
import color from "picocolors";

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

export const getModel = async (model?: string) => {
  let selectedModel: AvailableModels | undefined;

  if (model) {
    if (availableModels.includes(model as AvailableModels))
      selectedModel = model as AvailableModels;
    else selectedModel = DEFAULT_MODEL;
  }

  const NOTO_MODEL = process.env.NOTO_MODEL;
  if (!selectedModel && NOTO_MODEL) {
    if (availableModels.includes(NOTO_MODEL as AvailableModels))
      selectedModel = NOTO_MODEL as AvailableModels;
    else selectedModel = DEFAULT_MODEL;
  }

  if (!selectedModel) {
    const storageModel = (await StorageManager.get()).llm?.model;
    if (
      storageModel &&
      availableModels.includes(storageModel as AvailableModels)
    )
      selectedModel = storageModel as AvailableModels;
  }

  if (!selectedModel) {
    selectedModel = DEFAULT_MODEL;
    await StorageManager.update((current) => ({
      ...current,
      llm: {
        ...current.llm,
        model: DEFAULT_MODEL,
      },
    }));
  }

  return models[selectedModel as AvailableModels];
};
