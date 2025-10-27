import type { NextConfig } from "next";

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
  // webpack: (config, { isServer }) => {
  //   if (!isServer) {
  //     config.resolve.fallback = {
  //       ...(config.resolve.fallback || {}),
  //       canvas: false,
  //     };
  //     config.resolve.alias = {
  //       ...(config.resolve.alias || {}),
  //       canvas: false,
  //     };
  //   }
  //   return config;
  // },
  webpack: (config) => {
    config.externals.push({
      canvas: "commonjs canvas",
    });

    return config;
  },
};

export default nextConfig;
