import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // CMS pages declare noindex in their route-group metadata. Let crawlers
        // fetch that directive; keep API/player endpoints out of crawl paths.
        disallow: ["/cms/", "/device/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
