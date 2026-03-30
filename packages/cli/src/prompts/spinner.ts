import {
  BoxRenderable,
  TextRenderable,
  createCliRenderer,
  type CliRenderer,
} from "@opentui/core";

import { isInteractive } from "~/prompts/tty";

const FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export type SpinnerHandle = {
  start: (message: string) => void;
  stop: (finalMessage?: string, _exitCode?: number) => Promise<void>;
};

function spinnerTui(): SpinnerHandle {
  let renderer: CliRenderer | null = null;
  let label: TextRenderable | null = null;
  let tick: ReturnType<typeof setInterval> | null = null;
  let frame = 0;
  let ready: Promise<void> = Promise.resolve();
  let spinMsg = "";

  return {
    start(message: string) {
      spinMsg = message;
      ready = (async () => {
        renderer = await createCliRenderer({
          exitOnCtrlC: false,
          useAlternateScreen: true,
        });
        const box = new BoxRenderable(renderer, {
          id: "noto-spinner",
          flexDirection: "row",
          padding: 1,
          width: "100%",
        });
        label = new TextRenderable(renderer, {
          id: "noto-spinner-label",
          content: `${FRAMES[0]} ${message}`,
        });
        box.add(label);
        renderer.root.add(box);
        renderer.start();
        tick = setInterval(() => {
          frame = (frame + 1) % FRAMES.length;
          if (label && renderer) {
            label.content = `${FRAMES[frame]} ${spinMsg}`;
            renderer.requestRender();
          }
        }, 80);
      })();
    },

    async stop(finalMessage?: string, _exitCode?: number) {
      await ready;
      if (tick) {
        clearInterval(tick);
        tick = null;
      }
      if (renderer) {
        renderer.destroy();
        renderer = null;
      }
      label = null;
      if (finalMessage !== undefined) {
        console.log(finalMessage);
      }
    },
  };
}

function spinnerPlain(): SpinnerHandle {
  let tick: ReturnType<typeof setInterval> | null = null;
  let frame = 0;
  let msg = "";

  return {
    start(message: string) {
      msg = message;
      process.stdout.write(`${FRAMES[0]} ${message}`);
      tick = setInterval(() => {
        frame = (frame + 1) % FRAMES.length;
        process.stdout.write(`\r${FRAMES[frame]} ${msg}`);
      }, 80);
    },

    async stop(finalMessage?: string, _exitCode?: number) {
      if (tick) {
        clearInterval(tick);
        tick = null;
      }
      process.stdout.write("\r\x1b[K");
      if (finalMessage !== undefined) {
        console.log(finalMessage);
      }
    },
  };
}

export function spinner(): SpinnerHandle {
  return isInteractive() ? spinnerTui() : spinnerPlain();
}
