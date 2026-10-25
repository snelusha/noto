import { describe, expect, it } from "vitest";

import { expandCommitPrompt, substituteArgs } from "~/utils/prompt-template";

describe("substituteArgs", () => {
  it("replaces positional arguments and missing values", () => {
    expect(substituteArgs("$1 $2", ["one", "two"])).toBe("one two");
    expect(substituteArgs("$1 $2", ["one"])).toBe("one ");
  });

  it("uses complete positional indexes", () => {
    const args = Array.from({ length: 10 }, (_, index) => String(index + 1));
    expect(substituteArgs("$10 $10", args)).toBe("10 10");
    expect(substituteArgs("$1 0", ["one"])).toBe("one 0");
  });

  it("joins all arguments", () => {
    expect(substituteArgs("$@ / $ARGUMENTS", ["one", "two"])).toBe("one two / one two");
    expect(substituteArgs("$1: $@", ["prefix", "a", "b"])).toBe("prefix: prefix a b");
  });

  it("supports defaults", () => {
    expect(substituteArgs("${1:-fallback}", [])).toBe("fallback");
    expect(substituteArgs("${1:-fallback}", [""])).toBe("fallback");
    expect(substituteArgs("${1:-fallback}", ["0"])).toBe("0");
    expect(substituteArgs("${@:-fallback}", [])).toBe("fallback");
    expect(substituteArgs("${@:-fallback}", [""])).toBe("fallback");
    expect(substituteArgs("${@:-fallback}", ["0"])).toBe("0");
  });

  it("supports argument slices", () => {
    expect(substituteArgs("${@:2}", ["one", "two", "three"])).toBe("two three");
    expect(substituteArgs("${@:2:1}", ["one", "two", "three"])).toBe("two");
    expect(substituteArgs("${@:0}", ["one", "two"])).toBe("one two");
  });

  it("does not rescan argument text", () => {
    expect(substituteArgs("$ARGUMENTS", ["$1", "$ARGUMENTS"])).toBe("$1 $ARGUMENTS");
    expect(substituteArgs("$1", ["$2"])).toBe("$2");
  });
});

describe("expandCommitPrompt", () => {
  it("replaces branch and leaves unknown or blank variables", () => {
    expect(expandCommitPrompt("{{branch}}", { args: [], vars: { branch: "main" } })).toBe("main");
    expect(expandCommitPrompt("{{branch}} {{root}} {{unknown}}", { args: [], vars: { branch: "" } })).toBe(
      "{{branch}} {{root}} {{unknown}}",
    );
  });

  it("expands named variables in positional defaults", () => {
    expect(expandCommitPrompt("${1:-on {{branch}}}", { args: [], vars: { branch: "main" } })).toBe("on main");
  });

  it("does not rescan inserted arguments", () => {
    expect(expandCommitPrompt("$1", { args: ["{{branch}}"], vars: { branch: "main" } })).toBe("{{branch}}");
    expect(expandCommitPrompt("$1", { args: ["$1"], vars: {} })).toBe("$1");
  });

  it("supports dollar escaping and resolves each placeholder once", () => {
    expect(expandCommitPrompt("$$1 $$", { args: ["value"], vars: {} })).toBe("$1 $");
    expect(expandCommitPrompt("{{branch}}: $1", { args: ["value"], vars: { branch: "main" } })).toBe("main: value");
  });
});
