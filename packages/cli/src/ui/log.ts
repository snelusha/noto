import { bold, dim, green, red, yellow } from "@crustjs/style";

function write(line: string) {
  console.error(line);
}

export const log = {
  error(message: string) {
    write(red(message));
  },
  success(message: string) {
    write(green(message));
  },
  warn(message: string) {
    write(yellow(message));
  },
  step(message: string) {
    write(bold(message));
  },
  dim(message: string) {
    write(dim(message));
  },
};
