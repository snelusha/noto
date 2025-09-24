import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const toPath = (urlOrPath: string | URL) =>
  urlOrPath instanceof URL ? fileURLToPath(urlOrPath) : urlOrPath;

export interface FindUpOptions {
  cwd?: string | URL;
  type?: "file" | "directory";
  stopAt?: string | URL;
}

export async function findUp(name: string, options: FindUpOptions = {}) {
  let directory = path.resolve(toPath(options.cwd ?? ""));
  const { root } = path.parse(directory);
  options.stopAt = path.resolve(toPath(options.stopAt ?? root));
  const isAbsoluteName = path.isAbsolute(name);

  while (directory) {
    const filePath = isAbsoluteName ? name : path.join(directory, name);
    try {
      const stats = await fs.stat(filePath);
      if (
        (options.type === "file" && stats.isFile()) ||
        (options.type === "directory" && stats.isDirectory())
      )
        return filePath;
    } catch {}

    if (directory === options.stopAt || directory === root) break;

    directory = path.dirname(directory);
  }
}
