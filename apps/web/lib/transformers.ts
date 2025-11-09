import type { ShikiTransformer } from "shiki";

export const transformers = [
  {
    code(node) {
      if (node.tagName !== "code") return;

      const raw = this.source;
      node.properties["__raw__"] = raw;

      const packageManagerMappings = [
        {
          pattern: /^npm install\s/,
          transforms: {
            __npm__: (cmd: string) => cmd,
            __yarn__: (cmd: string) => cmd.replace("npm install", "yarn add"),
            __pnpm__: (cmd: string) => cmd.replace("npm install", "pnpm add"),
            __bun__: (cmd: string) => cmd.replace("npm install", "bun add"),
          },
        },
        {
          pattern: /^npx create-/,
          transforms: {
            __npm__: (cmd: string) => cmd,
            __yarn__: (cmd: string) =>
              cmd.replace("npx create-", "yarn create "),
            __pnpm__: (cmd: string) =>
              cmd.replace("npx create-", "pnpm create "),
            __bun__: (cmd: string) => cmd.replace("npx", "bunx --bun"),
          },
        },
        {
          pattern: /^npm create\s/,
          transforms: {
            __npm__: (cmd: string) => cmd,
            __yarn__: (cmd: string) => cmd.replace("npm create", "yarn create"),
            __pnpm__: (cmd: string) => cmd.replace("npm create", "pnpm create"),
            __bun__: (cmd: string) => cmd.replace("npm create", "bun create"),
          },
        },
        {
          pattern: /^npx\s/,
          transforms: {
            __npm__: (cmd: string) => cmd,
            __yarn__: (cmd: string) => cmd.replace("npx", "yarn dlx"),
            __pnpm__: (cmd: string) => cmd.replace("npx", "pnpm dlx"),
            __bun__: (cmd: string) => cmd.replace("npx", "bunx --bun"),
          },
        },
        {
          pattern: /^npm run\s/,
          transforms: {
            __npm__: (cmd: string) => cmd,
            __yarn__: (cmd: string) => cmd.replace("npm run", "yarn"),
            __pnpm__: (cmd: string) => cmd.replace("npm run", "pnpm"),
            __bun__: (cmd: string) => cmd.replace("npm run", "bun"),
          },
        },
      ];

      for (const { pattern, transforms } of packageManagerMappings) {
        if (pattern.test(raw)) {
          for (const [key, transform] of Object.entries(transforms)) {
            node.properties[key] = transform(raw);
          }
          break;
        }
      }
    },
  },
] as ShikiTransformer[];
