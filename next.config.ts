import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "api.marin-snack.store" },
      { protocol: "http", hostname: "api.marin-snack.store" },
      { protocol: "https", hostname: "snack-bucket2.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "http", hostname: "snack-bucket2.s3.ap-northeast-2.amazonaws.com" },
    ],
  },
};

export default nextConfig;
