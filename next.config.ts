import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allow embedding in VibeSharing (and local dev). Without this, a strict CSP can block the dashboard preview iframe.
   * @see https://vibesharing.app
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://vibesharing.app https://*.vibesharing.app http://localhost:3000 http://127.0.0.1:3000",
          },
        ],
      },
    ];
  },
  /**
   * Do not set `output: "standalone"` here unless you run `node .next/standalone/server.js`.
   * Using `next start` together with `standalone` is unsupported and can yield a blank/broken UI.
   * For Docker, this image uses `next start` with a full `.next` + `node_modules` copy.
   */
  webpack: (config) => {
    /* Inline prototype HTML at build time — avoids runtime fs on serverless (Vercel 500s). */
    config.module.rules.push({
      test: /[/\\]public[/\\]proto-body\.html$/,
      type: "asset/source",
    });
    return config;
  },
  /* `next dev --turbopack` — same proto import as webpack `asset/source` (no unknown module type / 500). */
  turbopack: {
    rules: {
      "**/public/proto-body.html": {
        loaders: ["raw-loader"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
