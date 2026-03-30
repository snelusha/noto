/** Strip ANSI escape sequences for safe TUI layout (labels may use picocolors). */
export function stripAnsi(s: string): string {
  // biome-ignore lint/suspicious/noControlCharactersInRegex: match ESC [ … m SGR sequences
  return s.replace(/\x1b\[[0-9;]*m/gu, "");
}
