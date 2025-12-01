/** @type {import('next').NextConfig} */
import path from "path";
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    turbo: {
      root: "/home/dive/Desktop/AppeShit/Github/Corn Mart/corn-mart/frontend",
    },
    serverActions: {
      allowedOrigins: ["vpz9b0n1-3000.uks1.devtunnels.ms", "localhost:3000"],
    },
  },
};

export default nextConfig;
