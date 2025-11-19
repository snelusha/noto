import color from "picocolors";

const GITHUB_API = "https://api.github.com/repos/snelusha/noto/tags";
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion?: string;
  latestVersion?: string;
}

/**
 * Fetches the latest tag/version from the GitHub repository
 */
async function fetchLatestVersion(): Promise<string | null> {
  try {
    const response = await fetch(GITHUB_API, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    // Get the first tag (latest)
    const latestTag = data[0]?.name;
    // Remove 'v' prefix if present (e.g., v1.3.2 -> 1.3.2)
    return latestTag?.replace(/^v/, "") || null;
  } catch {
    return null;
  }
}

/**
 * Gets the current installed version from package.json
 */
function getCurrentVersion(): string | null {
  return process.env.NOTO_VERSION || null;
}

/**
 * Checks if enough time has passed since last check
 */
function shouldCheck(lastCheckTime: number | undefined): boolean {
  if (!lastCheckTime) return true;
  return Date.now() - lastCheckTime > CHECK_INTERVAL;
}

/**
 * Compares two semantic versions
 */
function isNewerVersion(latest: string, current: string): boolean {
  const parseVersion = (v: string) => v.split(".").map(Number);
  const [latestParts, currentParts] = [latest, current].map(parseVersion);

  for (let i = 0; i < 3; i++) {
    const l = latestParts[i] || 0;
    const c = currentParts[i] || 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

/**
 * Checks for available updates by comparing versions from Git tags
 */
export async function checkForUpdates(storage: {
  lastUpdateCheck?: number;
  lastKnownVersion?: string;
}): Promise<UpdateCheckResult> {
  // Skip if checked recently
  if (!shouldCheck(storage.lastUpdateCheck)) {
    return { hasUpdate: false };
  }

  const currentVersion = getCurrentVersion();
  const latestVersion = await fetchLatestVersion();

  // Can't determine if in dev mode or API fails
  if (!currentVersion || !latestVersion) {
    return { hasUpdate: false };
  }

  const hasUpdate = isNewerVersion(latestVersion, currentVersion);

  return {
    hasUpdate,
    currentVersion,
    latestVersion,
  };
}

/**
 * Displays an update notification to the user
 */
export function displayUpdateNotification(result: UpdateCheckResult): void {
  if (!result.hasUpdate) return;

  const versionInfo = result.latestVersion
    ? `${result.currentVersion} → ${color.green(result.latestVersion)}`
    : "";

  console.log(
    `\n${color.yellow("╭─────────────────────────────────────────────╮")}`,
  );
  console.log(
    `${color.yellow("│")}  ${color.bold("Update available!")} ${versionInfo.padEnd(22)} ${color.yellow("│")}`,
  );
  console.log(
    `${color.yellow("│")}                                             ${color.yellow("│")}`,
  );
  console.log(
    `${color.yellow("│")}  Run: ${color.cyan("npm install -g @snelusha/noto")}    ${color.yellow("│")}`,
  );
  console.log(
    `${color.yellow("╰─────────────────────────────────────────────╯")}\n`,
  );
}
