import fs from "node:fs/promises";
import path from "node:path";

import type { z } from "zod";

export function createStorage<TSchema extends z.ZodTypeAny>(options: {
  schema: TSchema;
  path: string;
}) {
  type Schema = z.infer<TSchema>;
  const { schema, path: storagePath } = options;

  // biome-ignore lint/complexity/noStaticOnlyClass: This class serves as a namespace for file-based storage utilities
  return class GenericStorageClass {
    static storagePath: string = storagePath;
    static storage: Schema = {} as Schema;

    public static async load(): Promise<Schema> {
      try {
        await fs.access(GenericStorageClass.storagePath);
        const raw = await fs.readFile(GenericStorageClass.storagePath, "utf-8");
        const json = raw ? JSON.parse(raw) : {};
        const result = schema.safeParse(json);
        GenericStorageClass.storage = result.success
          ? result.data
          : ({} as Schema);
      } catch {
        GenericStorageClass.storage = {} as Schema;
      }
      return GenericStorageClass.storage;
    }

    public static async save(): Promise<void> {
      try {
        const directory = path.dirname(GenericStorageClass.storagePath);
        await fs.mkdir(directory, { recursive: true });
        const data = JSON.stringify(GenericStorageClass.storage, null, 2);
        await fs.writeFile(GenericStorageClass.storagePath, data, "utf-8");
      } catch {}
    }

    public static async update(
      updater: (current: Schema) => Schema | Promise<Schema>,
    ): Promise<Schema> {
      try {
        await GenericStorageClass.load();
        const updated = await updater(GenericStorageClass.storage);
        const result = schema.safeParse(updated);
        if (result.success) {
          GenericStorageClass.storage = result.data;
          await GenericStorageClass.save();
        }
      } catch {}
      return GenericStorageClass.storage;
    }

    public static async get(): Promise<Schema> {
      await GenericStorageClass.load();
      return JSON.parse(JSON.stringify(GenericStorageClass.storage));
    }

    public static async clear(): Promise<void> {
      GenericStorageClass.storage = {} as Schema;
      await GenericStorageClass.save();
    }

    public static get path() {
      return GenericStorageClass.storagePath;
    }

    public static set path(p: string) {
      GenericStorageClass.storagePath = p;
    }

    public static get raw() {
      return GenericStorageClass.storage;
    }
  };
}
