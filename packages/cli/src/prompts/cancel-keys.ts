import type { CliRenderer } from "@opentui/core";

/** Listen for Escape / Ctrl+C and invoke `onCancel`. Returns an unsubscribe function. */
export function listenCancel(
  renderer: CliRenderer,
  onCancel: () => void,
): () => void {
  const handler = (key: { name: string; ctrl: boolean }) => {
    if (key.name === "escape") {
      onCancel();
    }
    if (key.ctrl && key.name === "c") {
      onCancel();
    }
  };
  renderer.keyInput.on("keypress", handler);
  return () => {
    renderer.keyInput.off("keypress", handler);
  };
}
