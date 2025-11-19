import { readFileSync } from "fs";
import { join } from "path";
import { defineConfig } from "bunup";

// Get current version from package.json
function getVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(join(__dirname, "package.json"), "utf-8"),
    );
    return pkg.version || "unknown";
  } catch {
    return "unknown";
  }
}

export default defineConfig({
  entry: ["src/index.ts"],
  minify: true,
  banner: "#!/usr/bin/env node",
  footer: "// Made by a human on earth!",
  define: {
    "process.env.NOTO_VERSION": JSON.stringify(getVersion()),
  },
});
