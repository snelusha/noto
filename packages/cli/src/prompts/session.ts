import { createCliRenderer, type CliRenderer } from "@opentui/core";

export async function withRenderer<T>(
  fn: (renderer: CliRenderer) => Promise<T>,
): Promise<T> {
  const renderer = await createCliRenderer({
    exitOnCtrlC: false,
    useAlternateScreen: true,
  });
  try {
    renderer.start();
    return await fn(renderer);
  } finally {
    renderer.destroy();
  }
}
