import type { NextConfig } from "next";

// GitHub project pages serve this repository below /novora-frontend.
const isGitHubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGitHubPages ? "/novora-frontend" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_GITHUB_PAGES: String(isGitHubPages),
  },
  cacheComponents: !isGitHubPages,
  partialPrefetching: !isGitHubPages,
  ...(!isGitHubPages ? {
    async rewrites() {
      const backendUrl = (
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      ).replace(/\/+$/, '');

      return [{
        source: '/api/backend/:path*',
        destination: `${backendUrl}/:path*`,
      }];
    },
  } : {}),
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
