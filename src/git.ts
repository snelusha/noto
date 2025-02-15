import simpleGit from "simple-git";

export async function isGitRepository() {
  try {
    return await simpleGit().checkIsRepo();
  } catch {
    return false;
  }
}

export async function getStagedDiff(): Promise<string | null> {
  try {
    const stagedFiles = await simpleGit().diff(["--cached", "--name-only"]);

    const files = stagedFiles.split("\n").filter(Boolean);

    const excludedPatterns = [
      "*.lock",
      "*.lockb",
      "*.yaml.lock",
      "*.hcl.lock",
      "*.resolved",
    ];
    const filteredFiles = files.filter(
      (file) =>
        !excludedPatterns.some((pattern) => {
          const regex = new RegExp(pattern.replace("*", ".*"));
          return regex.test(file);
        })
    );

    if (filteredFiles.length === 0) return null;

    return await simpleGit().diff(["--cached", "--", ...filteredFiles]);
  } catch {
    return null;
  }
}

export async function commit(message: string): Promise<boolean> {
  try {
    const result = await simpleGit().commit(message);
    return result.summary.changes > 0;
  } catch {
    return false;
  }
}

export async function getCommitCount() {
  try {
    const count = await simpleGit().raw(["rev-list", "--count", "HEAD"]);
    return Number(count.trim());
  } catch (error) {
    if (
      /(ambiguous argument.*HEAD|unknown revision or path.*HEAD)/i.test(
        (error as Error).message
      )
    ) {
      return 0;
    }
    return null;
  }
}

export async function isFirstCommit() {
  try {
    const count = await getCommitCount();
    return count === 0;
  } catch {
    return false;
  }
}
