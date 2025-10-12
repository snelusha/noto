import { withContentCollections } from "@content-collections/next";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
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
