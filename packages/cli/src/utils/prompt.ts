import { getGitRoot } from "~/utils/git";
import { findUp } from "~/utils/fs";

export const getPromptFile = async () => {
  const root = await getGitRoot();
  return await findUp(".noto/commit-prompt.md", {
    stopAt: root || process.cwd(),
    type: "file",
  });
};

export function parsePromptFile(
  str: string,
  data: Record<string, any>,
): string {
  return str.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return key in data ? data[key] : `{{${key}}}`;
  });
}
