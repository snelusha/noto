import os from "os";
import { dirname, join, resolve } from "path";
import { promises as fs } from "fs";

import { z } from "zod";

import { AvailableModelsSchema } from "~/ai/types";

const StorageSchema = z.object({
  llm: z
    .object({
      apiKey: z.string().optional(),
      model: AvailableModelsSchema.optional().or(z.string()),
    })
    .optional(),
  lastGeneratedMessage: z.string().optional(),
  cache: z.record(z.string(), z.string()).optional(),
  lastUpdateCheck: z.number().optional(),
  lastKnownVersion: z.string().optional(),
});

export type Storage = z.infer<typeof StorageSchema>;

export class StorageManager {
  private static readonly storagePath: string = resolve(
    join(os.homedir(), ".config", "noto"),
    ".notorc",
  );

  private static storage: Storage = {};

  public static async load(): Promise<Storage> {
    try {
      await fs.access(this.storagePath);

      const data = await fs.readFile(this.storagePath, "utf-8");
      const json = data ? JSON.parse(data) : {};

      const result = StorageSchema.safeParse(json);
      if (!result.success) this.storage = {};
      else this.storage = result.data;
    } catch {
      this.storage = {};
    }
    return this.storage;
  }

  public static async save(): Promise<void> {
    try {
      const directory = dirname(this.storagePath);
      await fs.mkdir(directory, { recursive: true });

      const data = JSON.stringify(this.storage, null, 2);
      await fs.writeFile(this.storagePath, data, "utf-8");
    } catch {}
  }

  public static async update(
    updater: (current: Storage) => Storage | Promise<Storage>,
  ): Promise<Storage> {
    try {
      const updatedStorage = await updater(this.storage);

      const result = StorageSchema.safeParse(updatedStorage);
      if (!result.success) return this.storage;

      this.storage = result.data;
      await this.save();
    } catch {}
    return this.storage;
  }

  public static async get(): Promise<Storage> {
    await this.load();
    return JSON.parse(JSON.stringify(this.storage));
  }

  public static async clear(): Promise<void> {
    this.storage = {};
    await this.save();
  }
}
