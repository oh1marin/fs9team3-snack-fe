import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: true,
});

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["react-toastify"],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/utils/cloudinaryLoader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "api.marin-snack.store" },
      { protocol: "http", hostname: "api.marin-snack.store" },
      { protocol: "https", hostname: "snack-bucket2.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "http", hostname: "snack-bucket2.s3.ap-northeast-2.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "res.cloudinary.com" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
