import { withContentCollections } from "@content-collections/next";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  async redirects() {
    return [
      {
        source: "/docs",
        destination: "/docs/introduction",
        permanent: true,
      },
      {
        source: "/gh",
        destination: "https://github.com/snelusha/noto",
        permanent: true,
      },
      {
        source: "/npm",
        destination: "https://www.npmjs.com/package/@snelusha/noto",
        permanent: true,
      },
    ];
  },
};

export default withContentCollections(nextConfig);
