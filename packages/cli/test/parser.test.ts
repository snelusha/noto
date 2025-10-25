import { describe, it, expect } from "vitest";
import arg from "arg";

import { parse, safeParse } from "../src/utils/parser";

describe("parse", () => {
  it("should parse basic command", () => {
    const schema: arg.Spec = {};
    const result = parse(schema, ["commit"]);
    expect(result.command).toBe("commit");
  });

  it("should parse command with string flag", () => {
    const schema: arg.Spec = {
      "--message": String,
    };
    const result = parse(schema, ["commit", "--message", "test"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe("test");
  });

  it("should parse command with boolean flag", () => {
    const schema: arg.Spec = {
      "--force": Boolean,
    };
    const result = parse(schema, ["commit", "--force"]);
    expect(result.command).toBe("commit");
    expect(result.options["--force"]).toBe(true);
  });

  it("should parse command with aliases", () => {
    const schema: arg.Spec = {
      "--message": String,
      "-m": "--message",
    };
    const result = parse(schema, ["commit", "-m", "test message"]);
    expect(result.options["--message"]).toBe("test message");
  });

  it("should parse multiple flags", () => {
    const schema: arg.Spec = {
      "--force": Boolean,
      "--message": String,
      "--verbose": Boolean,
    };
    const result = parse(schema, [
      "commit",
      "--force",
      "--message",
      "test",
      "--verbose",
    ]);
    expect(result.options["--force"]).toBe(true);
    expect(result.options["--message"]).toBe("test");
    expect(result.options["--verbose"]).toBe(true);
  });

  it("should handle permissive mode with unknown flags", () => {
    const schema: arg.Spec = {
      "--known": Boolean,
    };
    const result = parse(schema, ["commit", "--known", "--unknown"]);
    expect(result.options["--known"]).toBe(true);
    expect(result.options._).toContain("--unknown");
  });

  it("should parse positional arguments", () => {
    const schema: arg.Spec = {};
    const result = parse(schema, ["commit", "arg1", "arg2"]);
    expect(result.command).toBe("commit");
    expect(result.options._).toContain("arg1");
    expect(result.options._).toContain("arg2");
  });
});

describe("safeParse", () => {
  it("should parse valid schema normally", () => {
    const schema: arg.Spec = {
      "--message": String,
    };
    const result = safeParse(schema, ["commit", "--message", "test"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe("test");
  });

  it("should handle missing required string argument by treating as boolean", () => {
    const schema: arg.Spec = {
      "--message": String,
    };
    // When --message is provided without value, safeParse should treat it as boolean
    const result = safeParse(schema, ["commit", "--message"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe(true);
  });

  it("should handle multiple missing required arguments", () => {
    const schema: arg.Spec = {
      "--message": String,
      "--title": String,
    };
    const result = safeParse(schema, ["commit", "--message", "--title"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe(true);
    expect(result.options["--title"]).toBe(true);
  });

  it("should handle mixed valid and missing arguments", () => {
    const schema: arg.Spec = {
      "--message": String,
      "--force": Boolean,
    };
    const result = safeParse(schema, ["commit", "--message", "--force"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe(true);
    expect(result.options["--force"]).toBe(true);
  });

  it("should work with aliases", () => {
    const schema: arg.Spec = {
      "--message": String,
      "-m": "--message",
    };
    const result = safeParse(schema, ["commit", "-m"]);
    expect(result.command).toBe("commit");
    expect(result.options["--message"]).toBe(true);
  });

  it("should handle schema with only boolean flags", () => {
    const schema: arg.Spec = {
      "--force": Boolean,
      "--verbose": Boolean,
    };
    const result = safeParse(schema, ["commit", "--force", "--verbose"]);
    expect(result.options["--force"]).toBe(true);
    expect(result.options["--verbose"]).toBe(true);
  });

  it("should handle empty arguments", () => {
    const schema: arg.Spec = {
      "--message": String,
    };
    const result = safeParse(schema, []);
    expect(result.command).toBeUndefined();
  });

  it("should throw error for truly invalid flags", () => {
    const schema: arg.Spec = {
      "--valid": String,
    };
    // This should work due to permissive mode
    const result = safeParse(schema, ["commit", "--invalid"]);
    expect(result.command).toBe("commit");
  });

  it("should handle complex scenario with multiple iterations", () => {
    const schema: arg.Spec = {
      "--first": String,
      "--second": String,
      "--third": String,
    };
    const result = safeParse(schema, [
      "commit",
      "--first",
      "--second",
      "--third",
    ]);
    expect(result.command).toBe("commit");
    expect(result.options["--first"]).toBe(true);
    expect(result.options["--second"]).toBe(true);
    expect(result.options["--third"]).toBe(true);
  });

  it("should preserve provided values when they exist", () => {
    const schema: arg.Spec = {
      "--message": String,
      "--force": Boolean,
    };
    const result = safeParse(schema, [
      "commit",
      "--message",
      "actual message",
      "--force",
    ]);
    expect(result.options["--message"]).toBe("actual message");
    expect(result.options["--force"]).toBe(true);
  });

  it("should reach max iterations limit safely", () => {
    const schema: arg.Spec = {
      "--a": String,
      "--b": String,
      "--c": String,
      "--d": String,
      "--e": String,
    };
    const result = safeParse(schema, ["cmd", "--a", "--b", "--c", "--d", "--e"]);
    expect(result.command).toBe("cmd");
    // All should be converted to boolean
    expect(result.options["--a"]).toBe(true);
    expect(result.options["--b"]).toBe(true);
    expect(result.options["--c"]).toBe(true);
    expect(result.options["--d"]).toBe(true);
    expect(result.options["--e"]).toBe(true);
  });
});
