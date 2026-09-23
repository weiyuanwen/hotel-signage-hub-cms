import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/rooms", "/devices", "/hotel", "/templates", "/staff", "/cms/", "/device/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
