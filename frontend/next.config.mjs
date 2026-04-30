import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 1. Get the path to the current file (next.config.mjs)
const __filename = fileURLToPath(import.meta.url);

// 2. Get the directory of the current file (this is the ESM equivalent of __dirname)
const __dirname = dirname(__filename);

// If you need to go up two levels to the monorepo root:
const monorepoRoot = join(__dirname, '..', '..');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/9.x/**",
      },
      {
        protocol: "https",
        hostname: "*.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "example.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;