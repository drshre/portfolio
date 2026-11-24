import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The scene libraries and model data are large, mostly static files: cache them hard.
  async headers() {
    return [
      {
        source: "/lib/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // page content and scripts change often: always check for a newer copy
        source: "/:file(content|list|scene).js",
        headers: [{ key: "Cache-Control", value: "no-cache" }],
      },
      {
        source: "/models/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Content-Type", value: "model/gltf-binary" },
        ],
      },
    ];
  },
};

export default nextConfig;
