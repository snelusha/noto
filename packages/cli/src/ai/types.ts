import { z } from "zod";

export const AvailableModelsSchema = z.enum([
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-2.0-flash-lite-preview-02-05",
  "gemini-2.0-flash-exp",
  "gemini-2.0-pro-exp-02-05",
]);

export type AvailableModels = z.infer<typeof AvailableModelsSchema>;
