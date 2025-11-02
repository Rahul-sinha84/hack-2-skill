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
  webpack: (config, { isServer }) => {
    // Add polyfill for Promise.withResolvers
    config.resolve.alias = {
      ...config.resolve.alias,
      "promise-polyfill": path.resolve(
        __dirname,
        "src/utils/promisePolyfill.ts"
      ),
    };

    // Handle canvas and pdfjs-dist - prevent canvas from being bundled server-side
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    } else {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        // Prevent server-only Google Cloud packages from being bundled in client
        // These packages use Node.js-specific features and cannot run in the browser
        "@google-cloud/documentai": false,
        "google-auth-library": false,
      };
    }

    // Ignore fs module in browser builds (pdfjs-dist sometimes tries to import it)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },
};

export default nextConfig;
