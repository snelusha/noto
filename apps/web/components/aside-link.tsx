"use client";

import * as React from "react";

import Link from "next/link";

import { usePathname } from "next/navigation";

export function AsideLink({
  href,
  children,
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
}) {
  const pathname = usePathname();
  const isActive = href === pathname;

  return (
    <Link
      className="text-muted-foreground hover:text-foreground data-[active]:text-foreground flex w-full items-center gap-2 px-5 py-2.5 transition-colors"
      href={{ pathname: href }}
      data-active={isActive || undefined}
    >
      {children}
    </Link>
  );
}
