import { trpcServer } from "trpc-cli";

import type { TrpcCliMeta } from "trpc-cli";

export const t = trpcServer.initTRPC.meta<TrpcCliMeta>().create();
