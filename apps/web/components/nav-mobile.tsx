"use client";

import * as React from "react";

import Link from "next/link";

import { Menu } from "lucide-react";

import { useHotkeys } from "react-hotkeys-hook";

import { cn } from "~/styles/utils";

export interface NavbarMobileContextProps {
  isOpen: boolean;
  toggle: () => void;
}

export const NavbarMobileContext = React.createContext<
  NavbarMobileContextProps | undefined
>(undefined);

export function NavbarMobileProvider({ children }: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = React.useState(true);

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
  const { isOpen, toggle } = useNavbarMobile();

  return (
    <div
      className={cn(
        "bg-background fixed inset-x-0 top-[50px] z-[100] grid transform-gpu grid-rows-[0fr] transition-all duration-300 md:hidden",
        isOpen && "grid-rows-[1fr] border-b shadow-lg",
      )}
    >
      <div
        className={cn(
          "no-scrollbar flex max-h-[80vh] min-h-0 flex-col gap-4 overflow-y-auto [mask-image:linear-gradient(to_top,transparent,white_40px)] px-4 transition-all duration-300",
          isOpen ? "py-5" : "invisible",
        )}
      >
        <Link href="/docs/introduction">Introduction</Link>
      </div>
    </div>
  );
}
