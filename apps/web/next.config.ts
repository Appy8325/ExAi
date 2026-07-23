import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep `next dev` and `next build` from racing over the same generated manifests.
  distDir:
    process.env.NEXT_DIST_DIR ??
    (process.env.NODE_ENV === "production" ? ".next-build" : ".next"),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  serverExternalPackages: [
    "api",
    "@nestjs/common",
    "@nestjs/config",
    "@nestjs/core",
    "@nestjs/platform-fastify",
    "@napi-rs/canvas",
    "fastify",
    "pdf-parse",
  ],
  experimental: {
    optimizePackageImports: ["@concourse/ui", "lucide-react"],
  },
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias["@nestjs/websockets/socket-module"] = false;
      config.resolve.alias["@nestjs/microservices/microservices-module"] =
        false;
    }
    return config;
  },
};

export default nextConfig;
