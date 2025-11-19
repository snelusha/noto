import { createCli } from "trpc-cli";

import { version } from "package";

import { router } from "~/router";
import { StorageManager } from "~/utils/storage";
import {
  checkForUpdates,
  displayUpdateNotification,
} from "~/utils/update-checker";

const args = process.argv.slice(2);

if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
}

// Check for updates asynchronously (non-blocking)
void (async () => {
  try {
    const storage = await StorageManager.get();
    const result = await checkForUpdates(storage);

    if (result.hasUpdate) {
      displayUpdateNotification(result);
    }

    // Update last check time
    await StorageManager.update((current) => ({
      ...current,
      lastUpdateCheck: Date.now(),
      lastKnownVersion: result.latestVersion || current.lastKnownVersion,
    }));
  } catch {
    // Silently fail - don't interrupt CLI usage
  }
})();

void createCli({
  name: "noto",
  router,
  version,
}).run();
