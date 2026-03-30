/** Sentinel for cancelled prompts (Clack-compatible `isCancel` checks). */
export const cancel = Symbol("noto-prompt-cancel");

export function isCancel(value: unknown): boolean {
  return value === cancel;
}
