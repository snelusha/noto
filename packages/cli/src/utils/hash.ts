import { createHash } from "crypto";

export function hashString(content: string) {
  const body = Buffer.from(content, "utf-8");
  const header = Buffer.from(`blob ${body.length}\0`, "utf-8");
  return createHash("sha1").update(header).update(body).digest("hex");
}
