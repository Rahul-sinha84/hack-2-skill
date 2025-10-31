import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: process.env.NODE_ENV !== "development", // * remove console.log in production
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // Add polyfill for Promise.withResolvers
    config.resolve.alias = {
      ...config.resolve.alias,
      "promise-polyfill": path.resolve(
        __dirname,
        "src/utils/promisePolyfill.ts"
      ),
    };
    return config;
  },
};

export default nextConfig;
