import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { configDir, createStore, field } from "@crustjs/store";
import { z } from "zod";

type ConfigFields = {
  llmApiKey?: string;
  llmModel?: string;
  lastGeneratedMessage?: string;
};

export type Storage = {
  llm?: {
    apiKey?: string;
    model?: string;
  };
  lastGeneratedMessage?: string;
};

let testDirOverride: string | undefined;

function resolveConfigDirectory() {
  return testDirOverride ?? configDir("noto");
}

function createConfigStore(directory: string) {
  return createStore({
    dirPath: directory,
    name: "notorc",
    access: "private",
    fields: {
      llmApiKey: field(z.string().optional()),
      llmModel: field(z.string().optional()),
      lastGeneratedMessage: field(z.string().optional()),
    },
  });
}

let configStore = createConfigStore(resolveConfigDirectory());

function toStorage(fields?: ConfigFields): Storage {
  if (!fields) return {};

  const storage: Storage = {};

  if (fields.llmApiKey || fields.llmModel) {
    storage.llm = {
      apiKey: fields.llmApiKey,
      model: fields.llmModel,
    };
  }

  if (fields.lastGeneratedMessage) {
    storage.lastGeneratedMessage = fields.lastGeneratedMessage;
  }

  return storage;
}

function fromStorage(storage: Storage): ConfigFields {
  const fields: ConfigFields = {};

  if (storage.llm?.apiKey !== undefined) {
    fields.llmApiKey = storage.llm.apiKey;
  }

  if (storage.llm?.model !== undefined) {
    fields.llmModel = storage.llm.model;
  }

  if (storage.lastGeneratedMessage !== undefined) {
    fields.lastGeneratedMessage = storage.lastGeneratedMessage;
  }

  return fields;
}

function reconfigureStore() {
  configStore = createConfigStore(resolveConfigDirectory());
}

export const StorageManager = {
  get storagePath() {
    return path.join(resolveConfigDirectory(), "notorc.json");
  },

  set storagePath(storagePath: string) {
    testDirOverride = path.dirname(storagePath);
    reconfigureStore();
  },

  storage: {} as Storage,

  async load(): Promise<Storage> {
    const fields = await configStore.read();
    StorageManager.storage = toStorage(fields);
    return StorageManager.storage;
  },

  async save(): Promise<void> {
    await configStore.write(fromStorage(StorageManager.storage));
  },

  async get(): Promise<Storage> {
    const fields = await configStore.read();
    return structuredClone(toStorage(fields));
  },

  async update(
    updater: (current: Storage) => Storage | Promise<Storage>,
  ): Promise<Storage> {
    const current = await StorageManager.get();
    const next = await updater(current);
    await configStore.write(fromStorage(next));

    StorageManager.storage = next;
    return next;
  },

  async clear(): Promise<void> {
    await configStore.reset();
    StorageManager.storage = {};
  },
};

async function migrateLegacyConfigFile() {
  const directory = resolveConfigDirectory();
  const legacyPath = path.join(directory, ".notorc");
  const nextPath = path.join(directory, "notorc.json");

  try {
    await fs.access(legacyPath);
  } catch {
    return;
  }

  try {
    await fs.access(nextPath);
    return;
  } catch {}

  const raw = await fs.readFile(legacyPath, "utf-8");
  const parsed = JSON.parse(raw) as Storage & { cache?: unknown };

  await configStore.write(
    fromStorage({
      llm: parsed.llm,
      lastGeneratedMessage: parsed.lastGeneratedMessage,
    }),
  );

  await fs.rename(legacyPath, `${legacyPath}.bak`);
}

export async function cleanupLegacyStorage(): Promise<void> {
  try {
    await migrateLegacyConfigFile();
  } catch {}

  try {
    const current = await StorageManager.get();
    await StorageManager.update(() => current);
  } catch {}
}

export async function initializeStorage() {
  await cleanupLegacyStorage();
}

export function getDefaultConfigDirectory() {
  return path.join(os.homedir(), ".config", "noto");
}
