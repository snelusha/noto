"use client";

import * as React from "react";

import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { PackageIcon } from "@hugeicons/core-free-icons";

import { cn } from "~/styles/utils";

const COOKIE_NAME = "npm-downloads";
const ONE_HOUR = 60 * 60 * 1000;

const formatDownloads = (count: number | null) => {
  if (count === null) return null;
  return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
};

const setCookie = (name: string, value: string) => {
  const expires = new Date(Date.now() + ONE_HOUR).toUTCString();
  // biome-ignore lint: cookie assignment is intentional
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export function NpmDownloads() {
  const [downloads, setDownloads] = React.useState<number | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchDownloads() {
      const cachedDownloads = getCookie(COOKIE_NAME);
      if (cachedDownloads) {
        setDownloads(Number.parseInt(cachedDownloads, 10));
        setIsLoaded(true);
        return;
      }

      const today = new Date().toISOString().split("T")[0];
      const startDate = new Date("2024-12-01").toISOString().split("T")[0];
      const url = `https://api.npmjs.org/downloads/point/${startDate}:${today}/@snelusha/noto`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = (await response.json()) as { downloads: number };
        setDownloads(data.downloads);
        setCookie(COOKIE_NAME, data.downloads.toString());
        setIsLoaded(true);
      } catch (error) {
        console.error("Error fetching npm downloads:", error);
      }
    }

    fetchDownloads();
  }, []);

  return (
    <Link
      className="group outline-none"
      href="https://www.npmjs.com/package/@snelusha/noto"
    >
      <div
        className={cn(
          "text-muted-foreground/80 flex items-center gap-2 font-mono transition-opacity duration-300 select-none group-hover:underline md:text-sm",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      >
        <HugeiconsIcon
          className="size-4"
          icon={PackageIcon}
          strokeWidth={1.5}
        />
        {formatDownloads(downloads)}
      </div>
    </Link>
  );
}
