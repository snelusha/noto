import {
  BoxRenderable,
  InputRenderable,
  InputRenderableEvents,
  TextRenderable,
} from "@opentui/core";

import { listenCancel } from "~/prompts/cancel-keys";
import { cancel } from "~/prompts/cancel";
import { textFallback } from "~/prompts/fallback";
import { stripAnsi } from "~/prompts/strip-ansi";
import { isInteractive } from "~/prompts/tty";
import { withRenderer } from "~/prompts/session";

export type TextPromptOptions = {
  message: string;
  placeholder?: string;
  initialValue?: string;
};

export async function text(
  opts: TextPromptOptions,
): Promise<string | typeof cancel> {
  if (!isInteractive()) {
    return textFallback(opts);
  }

  return withRenderer(async (renderer) => {
    return new Promise<string | typeof cancel>((resolve) => {
      const outer = new BoxRenderable(renderer, {
        id: "noto-text-prompt",
        flexDirection: "column",
        gap: 1,
        padding: 1,
        width: "100%",
        height: "100%",
      });

      const title = new TextRenderable(renderer, {
        id: "noto-text-msg",
        content: stripAnsi(opts.message),
      });

      const input = new InputRenderable(renderer, {
        id: "noto-text-input",
        placeholder: opts.placeholder ?? "",
        value: opts.initialValue ?? "",
        width: Math.max(20, Math.min(renderer.width - 4, 80)),
      });

      outer.add(title);
      outer.add(input);
      renderer.root.add(outer);

      let settled = false;
      const finish = (value: string | typeof cancel) => {
        if (settled) return;
        settled = true;
        offCancel();
        input.off(InputRenderableEvents.ENTER, onEnter);
        resolve(value);
      };

      const offCancel = listenCancel(renderer, () => finish(cancel));

      const onEnter = () => {
        finish(input.value);
      };

      input.on(InputRenderableEvents.ENTER, onEnter);

      input.focus();
      renderer.focusRenderable(input);
    });
  });
}
