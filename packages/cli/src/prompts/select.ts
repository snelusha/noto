import {
  BoxRenderable,
  SelectRenderable,
  SelectRenderableEvents,
  TextRenderable,
} from "@opentui/core";

import { listenCancel } from "~/prompts/cancel-keys";
import { cancel } from "~/prompts/cancel";
import { selectFallback } from "~/prompts/fallback";
import { stripAnsi } from "~/prompts/strip-ansi";
import { isInteractive } from "~/prompts/tty";
import { withRenderer } from "~/prompts/session";

export type SelectOption<T> = {
  value: T;
  label: string;
  hint?: string;
};

export type SelectPromptOptions<T> = {
  message: string;
  options: SelectOption<T>[];
  initialValue?: T;
};

export async function select<T>(
  opts: SelectPromptOptions<T>,
): Promise<T | typeof cancel> {
  if (!isInteractive()) {
    return selectFallback(opts);
  }

  return withRenderer(async (renderer) => {
    return new Promise<T | typeof cancel>((resolve) => {
      const outer = new BoxRenderable(renderer, {
        id: "noto-select-prompt",
        flexDirection: "column",
        gap: 1,
        padding: 1,
        width: "100%",
        height: "100%",
      });

      const title = new TextRenderable(renderer, {
        id: "noto-select-msg",
        content: stripAnsi(opts.message),
      });

      let initialIdx = 0;
      if (opts.initialValue !== undefined) {
        const i = opts.options.findIndex((o) => o.value === opts.initialValue);
        if (i >= 0) initialIdx = i;
      }

      const otOptions = opts.options.map((o) => ({
        name: stripAnsi(o.label),
        description: o.hint ? stripAnsi(o.hint) : " ",
        value: o.value,
      }));

      const rowEstimate = Math.max(2, opts.options.length * 2);
      const selectHeight = Math.min(
        Math.max(4, rowEstimate),
        Math.max(4, renderer.height - 6),
      );

      const list = new SelectRenderable(renderer, {
        id: "noto-select-list",
        options: otOptions,
        selectedIndex: initialIdx,
        height: selectHeight,
        width: Math.max(24, Math.min(renderer.width - 4, 80)),
        showDescription: true,
      });

      outer.add(title);
      outer.add(list);
      renderer.root.add(outer);

      let settled = false;
      const finish = (value: T | typeof cancel) => {
        if (settled) return;
        settled = true;
        offCancel();
        list.off(SelectRenderableEvents.ITEM_SELECTED, onItem);
        resolve(value);
      };

      const offCancel = listenCancel(renderer, () => finish(cancel));

      const onItem = (_index: number, option: { value?: T }) => {
        finish(option.value as T);
      };

      list.on(SelectRenderableEvents.ITEM_SELECTED, onItem);

      list.focus();
      renderer.focusRenderable(list);
    });
  });
}
