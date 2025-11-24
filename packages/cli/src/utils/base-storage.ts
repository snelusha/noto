import { promises as fs } from "fs";
import { dirname } from "path";
import { z } from "zod";

export function createStorage<TSchema extends z.ZodTypeAny>(options: {
  schema: TSchema;
  path: string;
}) {
  type Schema = z.infer<TSchema>;
  const { schema, path } = options;

  return class GenericStorageClass {
    static storagePath: string = path;
    static storage: Schema = {} as Schema;

    public static async load(): Promise<Schema> {
      try {
        await fs.access(this.storagePath);
        const raw = await fs.readFile(this.storagePath, "utf-8");
        const json = raw ? JSON.parse(raw) : {};
        const result = schema.safeParse(json);
        this.storage = result.success ? result.data : ({} as Schema);
      } catch {
        this.storage = {} as Schema;
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
      updater: (current: Schema) => Schema | Promise<Schema>,
    ): Promise<Schema> {
      try {
        const updated = await updater(this.storage);
        const result = schema.safeParse(updated);
        if (result.success) {
          this.storage = result.data;
          await this.save();
        }
      } catch {}
      return this.storage;
    }

    public static async get(): Promise<Schema> {
      await this.load();
      return JSON.parse(JSON.stringify(this.storage));
    }

    public static async clear(): Promise<void> {
      this.storage = {} as Schema;
      await this.save();
    }

    public static get path() {
      return this.storagePath;
    }

    public static set path(p: string) {
      this.storagePath = p;
    }

    public static get raw() {
      return this.storage;
    }
  };
}
