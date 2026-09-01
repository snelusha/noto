import { z } from "zod";

export const AvailableModelsSchema = z.enum([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.1-pro-preview",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-pro-latest",
  "gemini-flash-latest",
  "gemini-flash-lite-latest",
]);

export type AvailableModels = z.infer<typeof AvailableModelsSchema>;
