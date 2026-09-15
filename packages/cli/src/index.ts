import { Crust, defineArg, defineCommand, defineFlag } from "@crustjs/core";
import { help, version } from "@crustjs/extensions";

import { version as packageVersion } from "package";

import { init } from "~/commands/init";
import { noto } from "~/commands/noto";
import { prev } from "~/commands/prev";
import { upgrade } from "~/commands/upgrade";
import { key } from "~/commands/config/key";
import { model } from "~/commands/config/model";
import { reset } from "~/commands/config/reset";
import { cleanupLegacyStorage } from "~/utils/storage";
import { checkForUpdate } from "~/utils/update";

const optionalValueSentinel = "\u0000noto-prompt-for-value";
const versionValue = process.env.VERSION ?? packageVersion;

function optionalValue(
  value: string | undefined,
): string | boolean | undefined {
  return value === optionalValueSentinel ? true : value;
}

/** Crust string flags require a value. Preserve trpc-cli's optional values. */
function normalizeArgv(argv: string[]): string[] {
  const output: string[] = [];
  for (let index = 0; index < argv.length; index++) {
    const token = argv[index] ?? "";
    output.push(token);
    if (
      (token === "--manual" || token === "--message" || token === "-m") &&
      (index === argv.length - 1 || argv[index + 1]?.startsWith("-"))
    ) {
      output.push(optionalValueSentinel);
    }
  }
  return output;
}

const config = defineCommand(
  "config",
  { description: "manage noto configuration" },
  (command) =>
    command.add(
      defineCommand(
        "key",
        { description: "configure noto api key" },
        (keyCommand) =>
          keyCommand
            .args(
              defineArg("apiKey", { type: "string", description: "API key" }),
            )
            .action(async ({ args }) => key(args.apiKey)),
      ),
      defineCommand(
        "model",
        { description: "configure model" },
        (modelCommand) => modelCommand.action(model),
      ),
      defineCommand(
        "reset",
        { description: "reset the configuration" },
        (resetCommand) => resetCommand.action(reset),
      ),
    ),
);

const app = new Crust("noto", {
  description: "Generate clean commit messages in a snap!",
  version: versionValue,
})
  .extend(help(), version(versionValue, { format: "plain" }))
  .flags(
    defineFlag("message", {
      type: "string",
      short: "m",
      description: "provide context for commit message",
    }),
    defineFlag("copy", {
      type: "boolean",
      noNegate: true,
      short: "c",
      description: "copy the generated message to clipboard",
    }),
    defineFlag("preview", {
      type: "boolean",
      noNegate: true,
      short: "p",
      description: "preview the generated message without committing",
    }),
    defineFlag("push", {
      type: "boolean",
      noNegate: true,
      description: "commit and push the changes",
    }),
    defineFlag("force", {
      type: "boolean",
      noNegate: true,
      short: "f",
      description: "bypass cache and force regeneration of commit message",
    }),
    defineFlag("manual", {
      type: "string",
      description: "custom commit message",
    }),
    defineFlag("model", {
      type: "string",
      description: "specify the model to use",
    }),
  )
  .action(async ({ flags }) =>
    noto({
      ...flags,
      message: optionalValue(flags.message),
      manual: optionalValue(flags.manual),
    }),
  )
  .add(
    config,
    defineCommand(
      "prev",
      { description: "access the last generated commit" },
      (command) =>
        command
          .flags(
            defineFlag("copy", {
              type: "boolean",
              noNegate: true,
              short: "c",
              description: "copy the last commit to clipboard",
            }),
            defineFlag("preview", {
              type: "boolean",
              noNegate: true,
              short: "p",
              description:
                "preview the last generated message without committing",
            }),
            defineFlag("amend", {
              type: "boolean",
              noNegate: true,
              description: "amend the last commit with the last message",
            }),
          )
          .action(({ flags }) => prev(flags)),
    ),
    defineCommand(
      "init",
      { description: "initialize noto in the repository" },
      (command) =>
        command
          .flags(
            defineFlag("root", {
              type: "boolean",
              noNegate: true,
              description: "create the prompt file in the git root",
            }),
            defineFlag("generate", {
              type: "boolean",
              noNegate: true,
              description: "generate a prompt file based on existing commits",
            }),
            defineFlag("message", {
              type: "string",
              short: "m",
              description: "provide context for the commit message guidelines",
            }),
            defineFlag("force", {
              type: "boolean",
              noNegate: true,
              short: "f",
              description:
                "overwrite an existing prompt file without confirmation",
            }),
            defineFlag("model", {
              type: "string",
              description: "specify the model to use",
            }),
          )
          .action(({ flags }) =>
            init({ ...flags, message: optionalValue(flags.message) }),
          ),
    ),
    defineCommand("upgrade", { description: "upgrade noto" }, (command) =>
      command
        .args(
          defineArg("target", {
            type: "string",
            description: "exact version to install",
          }),
        )
        .flags(
          defineFlag("stable", {
            type: "boolean",
            noNegate: true,
            description: "upgrade to the latest stable version",
          }),
          defineFlag("beta", {
            type: "boolean",
            noNegate: true,
            description: "upgrade to the latest beta version",
          }),
        )
        .action(({ args, flags }) =>
          upgrade({ ...flags, target: args.target }),
        ),
    ),
  );

void cleanupLegacyStorage();
void checkForUpdate(true);
void app.execute({ argv: normalizeArgv(process.argv.slice(2)) });
