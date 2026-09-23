import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const cmsRoot = path.dirname(fileURLToPath(import.meta.url));

const laravelApi = (process.env.NEXT_PUBLIC_API_URL ?? "http://hubback.test/api").replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/*": ["./messages/**/*"],
  },
  turbopack: {
    root: cmsRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.vietqr.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/sitemap.xml",
        headers: [
          { key: "Content-Type", value: "application/xml; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          { key: "Content-Type", value: "text/plain; charset=utf-8" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/san-pham", destination: "/vi/san-pham", permanent: true },
      { source: "/mau-chao", destination: "/vi/mau-chao", permanent: true },
      { source: "/bang-gia", destination: "/vi/bang-gia", permanent: true },
      { source: "/hoi-dap", destination: "/vi/hoi-dap", permanent: true },
      { source: "/tham-gia", destination: "/vi/tham-gia", permanent: true },
      { source: "/dang-nhap", destination: "/vi/dang-nhap", permanent: true },
      { source: "/so-do-trang", destination: "/vi/so-do-trang", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
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
