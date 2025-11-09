"use client";

import * as React from "react";

import { Terminal } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";

import { CopyButton } from "~/components/copy-button";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export interface CodeBlockCommandProps extends React.ComponentProps<"pre"> {
  __npm__?: string;
  __yarn__?: string;
  __pnpm__?: string;
  __bun__?: string;
}

export function CodeBlockCommand({
  className,
  children,
  ...props
}: CodeBlockCommandProps) {
  const { __npm__: npm, __yarn__: yarn, __pnpm__: pnpm, __bun__: bun } = props;

  const [packageManager, setPackageManager] =
    React.useState<PackageManager>("npm");

  const tabs = React.useMemo(() => {
    return {
      npm: npm,
      yarn: yarn,
      pnpm: pnpm,
      bun: bun,
    };
  }, [npm, yarn, pnpm, bun]);

  return (
    <div className="-my-3.5 overflow-x-auto">
      <Tabs
        className="gap-0"
        defaultValue={packageManager}
        onValueChange={(value) => setPackageManager(value as PackageManager)}
      >
        <div className="border-border/60 flex items-center gap-2.5 border-b px-4 py-1 font-mono">
          <Terminal className="text-muted-foreground size-4" />
          <div className="flex-grow">
            <TabsList className="bg-transparent">
              {Object.entries(tabs).map(([key]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="text-muted-foreground data-[state=active]:text-foreground text-xs"
                >
                  {key}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <CopyButton content={tabs[packageManager] as string} />
        </div>
        <div className="no-scrollbar overflow-x-auto">
          {Object.entries(tabs).map(([key, value]) => (
            <TabsContent key={key} value={key} className="mt-0 px-4 py-3.5">
              <code className="!text-foreground" data-language="bash">
                {value}
              </code>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
