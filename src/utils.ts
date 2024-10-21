import os from "node:os";
import { dirname, join } from "node:path";
import { existsSync, promises as fs } from "node:fs";
import process from "node:process";
import which from "which";
import c from "picocolors";

import type { Buffer } from "node:buffer";

import { load } from "@/storage";

export const CLI_TEMP_DIR = join(os.tmpdir(), "snelusha-noto");

export function remove<T>(arr: T[], v: T) {
  const index = arr.indexOf(v);
  if (index >= 0) arr.splice(index, 1);
  return arr;
}

export function exclude<T>(arr: T[], ...v: T[]) {
  return arr.slice().filter((item) => !v.includes(item));
}

export function cmdExists(cmd: string) {
  return which.sync(cmd, { nothrow: true }) !== null;
}

interface TempFile {
  path: string;
  fd: fs.FileHandle;
  cleanup: () => void;
}

let counter = 0;

async function openTemp(): Promise<TempFile | undefined> {
  if (!existsSync(CLI_TEMP_DIR))
    await fs.mkdir(CLI_TEMP_DIR, { recursive: true });

  const competitivePath = join(CLI_TEMP_DIR, `.${process.pid}.${counter}`);
  counter += 1;

  return fs
    .open(competitivePath, "wx")
    .then((fd) => ({
      fd,
      path: competitivePath,
      cleanup() {
        fd.close().then(() => {
          if (existsSync(competitivePath)) fs.unlink(competitivePath);
        });
      },
    }))
    .catch((error: any) => {
      if (error && error.code === "EEXIST") return openTemp();
      else return undefined;
    });
}

export async function writeFileSafe(
  path: string,
  data: string | Buffer = ""
): Promise<boolean> {
  const temp = await openTemp();

  if (temp) {
    try {
      // @ts-expect-error eslint-disable-next-line
      await fs.writeFile(temp.path, data);
      const directory = dirname(path);
      if (!existsSync(directory))
        await fs.mkdir(directory, { recursive: true });
      await fs.rename(temp.path, path);
      return true;
    } catch {
      return false;
    } finally {
      temp.cleanup();
    }
  }

  return false;
}