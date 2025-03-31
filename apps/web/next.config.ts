import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
