"use client";

import * as React from "react";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { ChevronDown, Menu } from "lucide-react";

import { usePathname } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";

import { AsideLink } from "~/components/aside-link";

import { config } from "~/config";

import { cn } from "~/styles/utils";

export interface NavbarMobileContextProps {
  isOpen: boolean;
  toggle: () => void;
}

export const NavbarMobileContext = React.createContext<
  NavbarMobileContextProps | undefined
>(undefined);

export function NavbarMobileProvider({ children }: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  useHotkeys("escape", () => isOpen && setIsOpen(false));

  return (
    <NavbarMobileContext.Provider value={{ isOpen, toggle }}>
      {children}
    </NavbarMobileContext.Provider>
  );
}

export function useNavbarMobile() {
  const context = React.useContext(NavbarMobileContext);
  if (!context)
    throw new Error(
      "useNavbarMobile must be used within a NavbarMobileProvider",
    );
  return context;
}

export function NavbarMobileButton() {
  const { toggle } = useNavbarMobile();

  return (
    <button
      className="block overflow-hidden outline-none md:hidden"
      onClick={toggle}
    >
      <Menu className="size-4" />
    </button>
  );
}

export function NavbarMobile() {
  const pathname = usePathname();

  const { isOpen, toggle } = useNavbarMobile();

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
    <div
      className={cn(
        "bg-background fixed inset-x-0 top-[50px] z-[100] grid transform-gpu grid-rows-[0fr] transition-all duration-300 md:hidden",
        isOpen && "grid-rows-[1fr] border-b shadow-lg",
      )}
    >
      <div
        className={cn(
          "no-scrollbar flex max-h-[80vh] min-h-0 flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_top,transparent,white_40px)] transition-all duration-300",
          isOpen ? "pt-5 pb-2" : "invisible",
        )}
      >
        <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0 }}>
          <div className="flex flex-col divide-y">
            {config.docs.contents.map((content, index) => (
              <div key={content.title} className="px-6 py-4">
                <button
                  className="flex w-full items-center text-start hover:underline"
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
                      <motion.div className="flex flex-col gap-2.5 px-4 pt-4">
                        {content.list.map((item) => (
                          <div key={item.title}>
                            <AsideLink href={item.href} onClick={toggle}>
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
      </div>
    </div>
  );
}
