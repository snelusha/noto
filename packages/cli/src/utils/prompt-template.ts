export function substituteArgs(content: string, args: string[]): string {
  const allArgs = args.join(" ");

  return content.replace(
    /\$\{(\d+|ARGUMENTS|@):-([^}]*)\}|\$\{@:(\d+)(?::(\d+))?\}|\$(ARGUMENTS|@|\d+)/g,
    (_match, defaultTarget, defaultValue, sliceStart, sliceLength, simple) => {
      if (defaultTarget) {
        const value =
          defaultTarget === "@" || defaultTarget === "ARGUMENTS"
            ? allArgs
            : args[parseInt(defaultTarget, 10) - 1];
        return value ? value : defaultValue;
      }
      if (sliceStart) {
        let start = parseInt(sliceStart, 10) - 1;
        if (start < 0) start = 0;
        if (sliceLength) {
          const length = parseInt(sliceLength, 10);
          return args.slice(start, start + length).join(" ");
        }
        return args.slice(start).join(" ");
      }
      if (simple === "ARGUMENTS" || simple === "@") return allArgs;
      const index = parseInt(simple, 10) - 1;
      return args[index] ?? "";
    },
  );
}

export function expandCommitPrompt(
  content: string,
  options: {
    args: string[];
    vars: { branch?: string };
  },
): string {
  let sentinel = "\u0000";
  const values = [content, ...options.args, options.vars.branch ?? ""];
  while (values.some((value) => value.includes(sentinel))) sentinel += "\u0000";

  const escaped = content.replace(/\$\$/g, sentinel);
  const withVars = escaped.replace(/\{\{\s*(branch)\s*\}\}/g, (match, name: "branch") => {
    const value = options.vars[name];
    return value?.trim() ? value.replace(/\$/g, sentinel) : match;
  });

  return substituteArgs(withVars, options.args).replaceAll(sentinel, "$");
}
