import { CancelledError } from "@crustjs/prompts";

export function isCancelled(error: unknown): error is CancelledError {
  return error instanceof CancelledError;
}
