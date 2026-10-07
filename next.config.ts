import type { NextConfig } from "next";

// Django origin that /api/* is proxied to. Browser code calls same-origin /api/...,
// so the backend needs no CORS setup.
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  // Django URLs end in "/"; keep Next.js from stripping the slash before proxying.
  skipTrailingSlashRedirect: true,
  // The project lives on a Windows drive under WSL, where file-change events don't
  // reach the dev server. `npm run dev` uses webpack, which can poll just the app's
  // own files (Turbopack's polling also scans node_modules and is far too slow there).
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = { poll: 1000, aggregateTimeout: 300, ignored: /node_modules/ };
    }
    return config;
  },
  async rewrites() {
    return [
      { source: "/api/", destination: `${API_ORIGIN}/api/` },
      { source: "/api/:path*/", destination: `${API_ORIGIN}/api/:path*/` },
    ];
  },
};

export default nextConfig;
