"use client";

import * as React from "react";

import { MotionConfig } from "motion/react";
import { useOnClickOutside } from "~/hooks/use-on-click-outside";

export function TOCPopover() {
  const ref = React.useRef<HTMLDivElement>(null);

  const [open, setOpen] = React.useState(false);

  useOnClickOutside(ref, () => setOpen(false));

  return (
    <div ref={ref} className="sticky top-16 z-10 h-12 overflow-visible">
      <header className="bg-background/10 border-b px-6 backdrop-blur-md">
        <button
          className="w-full py-3.5 text-start"
          onClick={() => setOpen(!open)}
        >
          On this page
        </button>
        <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0 }}>
          {open && (
            <div className="bg-background/10 h-52 backdrop-blur-md"></div>
          )}
        </MotionConfig>
      </header>
    </div>
  );
}
