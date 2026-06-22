import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile lives in the
  // parent dir, which otherwise confuses Turbopack's root inference).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow the /embed route to be framed by any host (it's a public widget).
  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors *" },
        ],
      },
    ];
  },
};

export default nextConfig;
