import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { loadEnvConfig } from "@next/env";
import { getR2PublicHostname } from "./lib/r2/env";

/** Ensure .env.local is loaded before reading R2_PUBLIC_URL in this file. */
loadEnvConfig(path.dirname(fileURLToPath(import.meta.url)));

const r2Host = getR2PublicHostname();

/** Pin project root — avoids 404 when a lockfile exists in a parent folder (e.g. C:\Users\Kaelo\) */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const imageRemotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
  },
  {
    protocol: "https",
    hostname: "via.placeholder.com",
  },
  /** Cloudflare R2.dev public bucket URLs (pub-….r2.dev) */
  {
    protocol: "https",
    hostname: "*.r2.dev",
  },
];

if (r2Host && !r2Host.endsWith(".r2.dev")) {
  imageRemotePatterns.push({
    protocol: "https",
    hostname: r2Host,
  });
}

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    remotePatterns: imageRemotePatterns,
  },
};

export default nextConfig;
