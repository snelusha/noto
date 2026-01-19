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
  // Priority order: explicit parameter > NOTO_MODEL env var > storage config > default
  let selectedModel: AvailableModels | undefined;

  if (model) {
    // Validate explicit model from flag
    if (availableModels.includes(model as AvailableModels)) {
      selectedModel = model as AvailableModels;
    } else {
      p.log.warn(
        color.yellow(
          `Invalid model "${model}". Available models: ${availableModels.join(", ")}. Falling back to default.`,
        ),
      );
      selectedModel = undefined; // Will fall through to next priority
    }
  }

  if (!selectedModel && process.env.NOTO_MODEL) {
    // Validate model from environment variable
    if (availableModels.includes(process.env.NOTO_MODEL as AvailableModels)) {
      selectedModel = process.env.NOTO_MODEL as AvailableModels;
    } else {
      p.log.warn(
        color.yellow(
          `Invalid model "${process.env.NOTO_MODEL}" in NOTO_MODEL. Available models: ${availableModels.join(", ")}. Falling back to config/default.`,
        ),
      );
      selectedModel = undefined; // Will fall through to next priority
    }
  }

  if (!selectedModel) {
    // Check storage configuration
    const storageModel = (await StorageManager.get()).llm?.model;
    if (storageModel && availableModels.includes(storageModel as AvailableModels)) {
      selectedModel = storageModel as AvailableModels;
    }
  }

  // Fall back to default if no valid model found
  if (!selectedModel || !availableModels.includes(selectedModel as AvailableModels)) {
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
