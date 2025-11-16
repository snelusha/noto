"use client";

import * as React from "react";

import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

import { cn } from "~/styles/utils";

const COOKIE_NAME = "github-stars";
const ONE_HOUR = 60 * 60 * 1000;

const formatStars = (count: number | null) => {
  if (!count) return null;
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
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

export function GithubStars() {
  const [stars, setStars] = React.useState<number | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    async function fetchStars() {
      const cachedStars = getCookie(COOKIE_NAME);

      if (cachedStars) {
        setStars(Number.parseInt(cachedStars, 10));
        setIsLoaded(true);
        return;
      }

      try {
        const response = await fetch(
          "https://api.github.com/repos/snelusha/noto",
        );
        const data = (await response.json()) as { stargazers_count: number };
        setStars(data.stargazers_count);
        setCookie(COOKIE_NAME, data.stargazers_count.toString());
        setIsLoaded(true);
      } catch {}
    }

    fetchStars();
  }, []);

  return (
    <Link
      className="group outline-none"
      href="https://github.com/snelusha/noto"
    >
      <div
        className={cn(
          "text-muted-foreground/80 flex items-center gap-2 font-mono transition-opacity duration-300 select-none group-hover:underline md:text-sm",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      >
        <HugeiconsIcon className="size-4" icon={GithubIcon} strokeWidth={1.5} />
        {formatStars(stars)}
      </div>
    </Link>
  );
}
