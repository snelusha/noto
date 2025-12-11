import path from "node:path";
import fs from "node:fs/promises";

import { NextResponse } from "next/server";

export async function GET() {
  const content = await fs.readFile(
    path.join(process.cwd(), "app", "llms.txt", "llms.txt"),
    "utf-8",
  );
  return new NextResponse(content, {
    headers: { "Content-Type": "text/plain" },
  });
}
