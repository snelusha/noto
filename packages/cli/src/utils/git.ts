import simpleGit from "simple-git";

export const git = simpleGit();

export const isGitRepository = async () => {
  return git.checkIsRepo();
};

export const getGitRoot = async () => {
  try {
    return await git.revparse(["--show-toplevel"]);
  } catch {
    return null;
  }
};

export const getCommitCount = async () => {
  try {
    const count = await git.raw(["rev-list", "--all", "--count"]);
    return parseInt(count);
  } catch (error) {
    const message = (error as Error).message;
    const regex = /(ambiguous argument.*HEAD|unknown revision or path.*HEAD)/;
    if (regex.test(message)) return 0;

    throw error;
  }
};

export const isFirstCommit = async () => {
  const count = await getCommitCount();
  return count === 0;
};

export const getCommits = async (
  limit: number = 10,
  excludeMerges: boolean = false,
) => {
  try {
    const options = excludeMerges
      ? { maxCount: limit, "--no-merges": null }
      : { maxCount: limit };

    const log = await git.log(options);
    return log.all.map((c) => c.message);
  } catch {
    return null;
  }
};

export const getBranch = async () => {
  try {
    return git.raw(["rev-parse", "--abbrev-ref", "HEAD"]);
  } catch {
    return null;
  }
};

export const getStagedFiles = async () => {
  try {
    const stagedFiles = (await git.diff(["--cached", "--name-only"]))
      .split("\n")
      .filter(Boolean);
    return stagedFiles;
  } catch {
    return null;
  }
};

export const getStagedDiff = async () => {
  try {
    return git.diff(["--cached", "--", ":!*.lock"]);
  } catch {
    return null;
  }
};

export const commit = async (message: string, amend?: boolean) => {
  try {
    const options = amend ? { "--amend": null } : undefined;
    const {
      summary: { changes },
    } = await git.commit(message, undefined, options);
    return Boolean(changes);
  } catch {
    return false;
  }
};

export const push = async () => {
  try {
    const result = await git.push();
    return result.update || (result.pushed && result.pushed.length > 0);
  } catch {
    return false;
  }
};

export const getCurrentBranch = async () => {
  try {
    const branch = await git.branch();
    return branch.current;
  } catch {
    return null;
  }
};

export const getBranches = async (remote?: boolean) => {
  try {
    const branches = await git.branch();
    return remote
      ? branches.all
      : Object.keys(branches.branches).filter((b) => !b.startsWith("remotes/"));
  } catch {
    return null;
  }
};

export const checkout = async (branch: string) => {
  try {
    await git.checkout(branch, {});
    return true;
  } catch {
    return false;
  }
};

export const checkoutLocalBranch = async (branch: string) => {
  try {
    await git.checkoutLocalBranch(branch);
    return true;
  } catch {
    return false;
  }
};
