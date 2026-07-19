import type { NextConfig } from "next";

// Milestone 0: minimal, valid Next.js 15 config. Nothing beyond framework
// defaults is wired up yet.
//
// PWA (docs/00-foundation.md §6: "PWA via service worker + web app manifest"):
// the manifest placeholder ships in public/manifest.json this milestone, but
// the service worker itself, its registration (src/lib), and any cache-control
// / Service-Worker-Allowed headers this config would need to add are deferred
// to a later milestone — not implemented here.
const nextConfig: NextConfig = {
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
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias["@nestjs/websockets/socket-module"] = false;
      config.resolve.alias["@nestjs/microservices/microservices-module"] = false;
    }
    return config;
  },
  // headers: async () => [
  //   // Placeholder: once the service worker ships, add a headers() entry here
  //   // scoping `Service-Worker-Allowed: /` and appropriate cache-control for
  //   // /sw.js and /manifest.json. Left commented intentionally — Milestone 0
  //   // ships no service worker to configure headers for yet.
  // ],
};

export default nextConfig;
