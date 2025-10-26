"use client";

import * as React from "react";

import { usePathname } from "next/navigation";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronDown } from "lucide-react";

import { AsideLink } from "~/components/aside-link";

import { config } from "~/config";

export function Sidebar() {
  const pathname = usePathname();

  const [currentOpen, setCurrentOpen] = React.useState<number>(0);

  const getDefaultValue = () => {
    const defaultValue = config.docs.contents.findIndex((content) =>
      content.list.some((item) => item.href === pathname),
    );
    return defaultValue === -1 ? 0 : defaultValue;
  };

  React.useEffect(() => {
    setCurrentOpen(getDefaultValue());
  }, [pathname]);

  return (
    <div className="fixed start-0 top-0">
      <aside className="absolute top-16 hidden h-dvh shrink-0 flex-col justify-between overflow-y-auto border-r pb-2 md:flex md:w-[268px] md:transition-all lg:w-[286px]">
        <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0 }}>
          <div className="flex flex-col">
            {config.docs.contents.map((content, index) => (
              <div key={content.title}>
                <button
                  className="flex w-full items-center gap-2 border-b px-5 py-2.5 text-start hover:underline"
                  onClick={() =>
                    setCurrentOpen(currentOpen === index ? -1 : index)
                  }
                >
                  <span className="grow">{content.title}</span>
                  <motion.div
                    animate={{ rotate: currentOpen === index ? 180 : 0 }}
                  >
                    <ChevronDown className="size-4 shrink-0 transition-transform" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {currentOpen === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative overflow-hidden"
                    >
                      <motion.div>
                        {content.list.map((item) => (
                          <div key={item.title}>
                            <AsideLink className="px-5 py-2.5" href={item.href}>
                              {item.title}
                            </AsideLink>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </MotionConfig>
      </aside>
    </div>
  );
}
