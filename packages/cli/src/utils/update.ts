import semver from "semver";
import latestVersion from "latest-version";

import { CacheManager } from "~/utils/cache";
import { isPrerelease } from "~/utils/installation-info";

import { name, version as currentVersion } from "package";

const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

export type UpdateTag = "stable" | "beta" | "auto";

export interface UpdateInfo {
  latest: string;
  current: string;
  timestamp: number;
}

function getBestAvailableUpdate(beta?: string, stable?: string): string | null {
  if (!beta || !stable) return beta || stable || null;

  const stableParsed = semver.parse(stable);
  const betaParsed = semver.parse(beta);

  if (!stableParsed || !betaParsed) return beta || stable || null;

  return semver.gt(beta, stable) ? beta : stable;
}

export async function checkForUpdate(
  mark: boolean = false,
  force: boolean = false,
  tag: UpdateTag = "auto",
): Promise<UpdateInfo> {
  const cached = (await CacheManager.get()).update;
  if (!force && cached) {
    const isValid = semver.valid(cached.current) && semver.valid(cached.latest);
    if (isValid) {
      const isUpToDate = semver.gte(cached.current, cached.latest);
      const notOld = Date.now() - cached.timestamp < UPDATE_CHECK_INTERVAL;
      if (isUpToDate || notOld) {
        return {
          latest: cached.latest,
          current: cached.current,
          timestamp: cached.timestamp,
        };
      }
    }
  }

  try {
    let latest: string;

    if (tag === "stable") {
      latest = await latestVersion(name);
    } else if (tag === "beta") {
      latest = await latestVersion(name, { version: "beta" });
    } else {
      latest = isPrerelease
        ? (getBestAvailableUpdate(
            ...(await Promise.all([
              latestVersion(name, { version: "beta" }),
              latestVersion(name),
            ])),
          ) ?? currentVersion)
        : await latestVersion(name);
    }

    const update = {
      latest,
      current: currentVersion,
      timestamp: Date.now(),
    };

    if (mark) await markUpdateChecked(update);

    return update;
  } catch {
    if (cached) {
      return {
        latest: cached.latest,
        current: cached.current,
        timestamp: cached.timestamp,
      };
    }
    return {
      latest: currentVersion,
      current: currentVersion,
      timestamp: Date.now(),
    };
  }
}

export async function markUpdateChecked(update: UpdateInfo | null) {
  if (!update) return;
  await CacheManager.update((current) => ({
    ...current,
    update: update && {
      timestamp: update.timestamp,
      latest: update.latest,
      current: update.current,
    },
  }));
}

export async function getAvailableUpdate(
  mark: boolean = false,
  force: boolean = false,
  tag: UpdateTag = "auto",
): Promise<UpdateInfo | null> {
  const update = await checkForUpdate(mark, force, tag);
  const isValid = semver.valid(update.current) && semver.valid(update.latest);
  if (isValid) {
    if (isPrerelease && tag === "stable" && update.current !== update.latest)
      return update;
    const isUpToDate = semver.gte(update.current, update.latest);
    if (!isUpToDate) return update;
  }
  return null;
}
