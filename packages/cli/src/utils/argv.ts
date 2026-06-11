export function isBareFlag(
  argv: readonly string[],
  short: string,
  long: string,
) {
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index];

    if (token === `-${short}` || token === `--${long}`) {
      const next = argv[index + 1];
      return next === undefined || next.startsWith("-");
    }

    if (token.startsWith(`--${long}=`)) {
      return false;
    }
  }

  return false;
}
