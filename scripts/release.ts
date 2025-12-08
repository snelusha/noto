#!/usr/bin/env bun

import { $ } from "bun";

import semver from "semver";

const packages = ["packages/cli", "apps/web"];

const pkgJson = await Bun.file("packages/cli/package.json").json();

function error(message: string): never {
  throw new Error(message);
}

function bumpVersion(version: string, type: semver.ReleaseType | string) {
  if (
    !semver.RELEASE_TYPES.includes(type as semver.ReleaseType) &&
    semver.valid(type)
  ) {
    if (!semver.gt(type, version))
      error(
        `specified version is not greater than current version: ${type} <= ${version}`,
      );
    return type;
  }

  const isPrelease = type === "prerelease";
  const bumpedVersion = isPrelease
    ? semver.inc(version, type, "beta")
    : semver.inc(version, type as semver.ReleaseType);

  if (!bumpedVersion) error(`failed to bump version: ${version} -> ${type}`);
  return bumpedVersion;
}

async function isGitClean() {
  const status = await $`git status --porcelain`.text();
  return status.trim().length === 0;
}

async function updatePackageVersions(
  version: string,
  type: semver.ReleaseType | string,
) {
  const changedFiles: string[] = [];

  for (const pkg of packages) {
    if (type === "prerelease" && pkg === "apps/web") continue;
    const pkgJsonPath = `${pkg}/package.json`;
    const pkgJson = await Bun.file(pkgJsonPath).json();
    pkgJson.version = version;
    await Bun.write(pkgJsonPath, `${JSON.stringify(pkgJson, null, 2)}\n`);
    changedFiles.push(pkgJsonPath);
    console.log(`bumped version in ${pkgJsonPath} to ${version}`);
  }

  return changedFiles;
}

async function release() {
  const type = process.argv[2];

  if (!type) error("please specify a release type or version");
  if (
    !semver.RELEASE_TYPES.includes(type as semver.ReleaseType) &&
    !semver.valid(type)
  )
    error(`invalid release type or version: ${type}`);

  if (!(await isGitClean())) error("git working directory is not clean");

  const newVersion = bumpVersion(pkgJson.version, type);

  if (process.stdin.isTTY) {
    const confirm = prompt(`release version '${newVersion}'? (y/n): `);
    if (!confirm?.toLowerCase().startsWith("y")) {
      console.log("aborting release");
      process.exit(0);
    }
  }

  const files = await updatePackageVersions(newVersion, type);
  await $`git add ${files}`;

  const commit = `chore(release): v${newVersion}`;
  await $`git commit -m ${commit}`;
  console.log(`created git commit: ${commit}`);

  const tag = `v${newVersion}`;
  await $`git tag ${tag} -m "release ${tag}"`;
  console.log(`created git tag: ${tag}`);

  console.log("release complete");
}

release().catch((e) => console.error("release failed:", e.message));
