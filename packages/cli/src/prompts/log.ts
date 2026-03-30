import color from "picocolors";

export function intro(message: string): void {
  console.log(message);
}

export const log = {
  error: (msg = "") => {
    console.log(`${color.red("✖")} ${msg}`);
  },
  warn: (msg = "") => {
    console.log(`${color.yellow("▲")} ${msg}`);
  },
  success: (msg = "") => {
    console.log(`${color.green("✔")} ${msg}`);
  },
  step: (msg = "") => {
    console.log(`${color.cyan("◆")} ${msg}`);
  },
};
