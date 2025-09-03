import { t } from "~/trpc";
import { commands } from "~/commands";

export const router = t.router(commands);
