import {
  CodeBlockCommand,
  CodeBlockCommandProps,
} from "~/components/code-block-command";

export const components = {
  code: ({ className, ...props }: CodeBlockCommandProps) => {
    const {
      __npm__: npm,
      __yarn__: yarn,
      __pnpm__: pnpm,
      __bun__: bun,
    } = props;
    if (typeof props.children === "string") {
      <code className={className} {...props} />;
    }

    const isNpmCommand = npm && yarn && pnpm && bun;
    console.log("isNpmCommand:", isNpmCommand);
    if (isNpmCommand) {
      return (
        <CodeBlockCommand
          className={className}
          __npm__={npm}
          __yarn__={yarn}
          __pnpm__={pnpm}
          __bun__={bun}
          {...props}
        />
      );
    }

    return <code className={className} {...props} />;
  },
};
