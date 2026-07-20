import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
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
      config.resolve.alias["@nestjs/microservices/microservices-module"] = false;
    }
    return config;
  },
};

export default nextConfig;
