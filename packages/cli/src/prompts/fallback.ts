import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";

import { cancel } from "~/prompts/cancel";
import { stripAnsi } from "~/prompts/strip-ansi";

export async function textFallback(opts: {
  message: string;
  placeholder?: string;
  initialValue?: string;
}): Promise<string | typeof cancel> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const hint = opts.placeholder ? ` ${stripAnsi(opts.placeholder)}` : "";
    const line = await rl.question(`${stripAnsi(opts.message)}${hint}\n> `);
    if (line === "" && opts.initialValue !== undefined) {
      return opts.initialValue;
    }
    return line;
  } finally {
    rl.close();
  }
}

export async function confirmFallback(opts: {
  message: string;
  initialValue?: boolean;
}): Promise<boolean | typeof cancel> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const def = opts.initialValue !== false ? "Y/n" : "y/N";
    const ans = await rl.question(`${stripAnsi(opts.message)} (${def}) `);
    const t = ans.trim().toLowerCase();
    if (t === "") return opts.initialValue !== false;
    if (t === "y" || t === "yes") return true;
    if (t === "n" || t === "no") return false;
    return opts.initialValue !== false;
  } finally {
    rl.close();
  }
}

export async function selectFallback<T>(opts: {
  message: string;
  options: { value: T; label: string; hint?: string }[];
  initialValue?: T;
}): Promise<T | typeof cancel> {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    console.log(stripAnsi(opts.message));
    opts.options.forEach((o, i) => {
      const hint = o.hint ? ` — ${stripAnsi(o.hint)}` : "";
      console.log(`  ${i + 1}) ${stripAnsi(o.label)}${hint}`);
    });
    const initialIdx =
      opts.initialValue !== undefined
        ? opts.options.findIndex((o) => o.value === opts.initialValue)
        : 0;
    const def = initialIdx >= 0 ? String(initialIdx + 1) : "1";
    const ans = await rl.question(`Enter number [${def}]: `);
    const t = ans.trim();
    if (t === "") {
      const idx = initialIdx >= 0 ? initialIdx : 0;
      return opts.options[idx]?.value ?? cancel;
    }
    const n = Number.parseInt(t, 10);
    if (Number.isNaN(n) || n < 1 || n > opts.options.length) {
      return cancel;
    }
    const chosen = opts.options[n - 1];
    return chosen ? chosen.value : cancel;
  } finally {
    rl.close();
  }
}
