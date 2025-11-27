import semver from "semver";
import latestVersion from "latest-version";

import { CacheManager } from "~/utils/cache";

import { name, version as currentVersion } from "package";

const UPDATE_CHECK_INTERVAL = 12 * 60 * 60 * 1000;

export interface UpdateInfo {
  latest: string;
  current: string;
  timestamp: number;
}

export async function checkForUpdate(
  mark: boolean = false,
  force: boolean = false,
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
    const latest = await latestVersion(name);
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
): Promise<UpdateInfo | null> {
  const update = await checkForUpdate(mark, force);
  const isValid = semver.valid(update.current) && semver.valid(update.latest);
  if (isValid) {
    const isUpToDate = semver.gte(update.current, update.latest);
    if (!isUpToDate) return update;
  }
  return null;
}
