import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiOrigin = new URL(process.env.SNAPART_API_ORIGIN ?? "http://127.0.0.1:4000").origin;
    return [{ source: "/api/snapart/:path*", destination: `${apiOrigin}/api/v1/:path*` }];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
