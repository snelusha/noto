import { z } from "zod";

export const AvailableModelsSchema = z.enum([
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.5-pro",
  "gemini-3-pro-preview",
]);

export type AvailableModels = z.infer<typeof AvailableModelsSchema>;
