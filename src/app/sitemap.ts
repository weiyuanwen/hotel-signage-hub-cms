import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

const paths: AppPathname[] = ["/", "/product", "/gallery", "/pricing", "/faq", "/join", "/directory"];
// Update this when the public marketing copy or page structure changes.
// Keep one date per route so unchanged pages do not receive a false lastmod.
const lastModifiedByPath: Partial<Record<AppPathname, Date>> = {
  "/": new Date("2026-10-28T00:00:00+07:00"),
  "/product": new Date("2026-10-28T00:00:00+07:00"),
  "/gallery": new Date("2026-10-28T00:00:00+07:00"),
  "/pricing": new Date("2026-10-28T00:00:00+07:00"),
  "/faq": new Date("2026-10-28T00:00:00+07:00"),
  "/join": new Date("2026-10-28T00:00:00+07:00"),
  "/directory": new Date("2026-10-28T00:00:00+07:00"),
};

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "");

  return paths.map((href) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${base}${getPathname({ locale, href })}`]),
    ) as Record<string, string>;
    languages["x-default"] = languages[routing.defaultLocale];

    return {
      url: languages[routing.defaultLocale],
      ...(lastModifiedByPath[href] ? { lastModified: lastModifiedByPath[href] } : {}),
      changeFrequency: "weekly",
      priority: href === "/" ? 1 : 0.8,
      alternates: { languages },
    };
  });
}
