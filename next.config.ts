import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const laravelApi = (process.env.NEXT_PUBLIC_API_URL ?? "http://hubback.test/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/cms/:path*", destination: `${laravelApi}/cms/:path*` },
        { source: "/device/:path*", destination: `${laravelApi}/device/:path*` },
        { source: "/broadcasting/:path*", destination: `${laravelApi}/broadcasting/:path*` },
      ],
    };
  },
};

export default withNextIntl(nextConfig);
