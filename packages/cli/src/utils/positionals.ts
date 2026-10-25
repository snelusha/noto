let positionalArgs: string[] = [];

export function setPositionalArgs(args: string[]): void {
  positionalArgs = [...args];
}

export function getPositionalArgs(): string[] {
  return [...positionalArgs];
}
