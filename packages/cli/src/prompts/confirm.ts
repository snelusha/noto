import { confirmFallback } from "~/prompts/fallback";
import { isInteractive } from "~/prompts/tty";
import { select } from "~/prompts/select";

export type ConfirmPromptOptions = {
  message: string;
  initialValue?: boolean;
};

export async function confirm(
  opts: ConfirmPromptOptions,
): Promise<boolean | typeof cancel> {
  if (!isInteractive()) {
    return confirmFallback(opts);
  }

  const result = await select({
    message: opts.message,
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
    initialValue: opts.initialValue,
  });

  return result;
}
