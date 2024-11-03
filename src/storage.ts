import { resolve } from "node:path";
import { existsSync, promises as fs } from "node:fs";

import { APP_DIR, writeFileSafe } from "@/utils";

export interface Storage {
  apiKey?: string;
}

let storage: Storage = {};

const storagePath = resolve(APP_DIR, "storage.json");

export async function load(
  fn?: (storage: Storage) => Promise<boolean> | boolean
): Promise<Storage> {
  try {
    if (!Object.keys(storage).length) {
      storage = existsSync(storagePath)
        ? JSON.parse((await fs.readFile(storagePath, "utf-8")) || "{}") || {}
        : {};
    }
    if (fn && (await fn(storage))) {
      await dump();
    }
  } catch (error) {
    console.error("error loading storage:", error);
    storage = {};
  }

  return storage;
}

export async function dump(): Promise<void> {
  try {
    if (storage) {
      await writeFileSafe(storagePath, JSON.stringify(storage, null, 2));
    }
  } catch (error) {
    console.error("error saving storage:", error);
  }
}
