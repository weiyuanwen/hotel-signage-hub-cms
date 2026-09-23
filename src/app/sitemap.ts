import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

const paths: AppPathname[] = ["/", "/product", "/gallery", "/pricing", "/faq", "/join", "/directory"];
const lastModified = new Date("2026-09-23T08:10:00+07:00");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "");

  return paths.map((href) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${base}${getPathname({ locale, href })}`]),
    ) as Record<string, string>;
    languages["x-default"] = languages[routing.defaultLocale];

    return {
      url: languages[routing.defaultLocale],
      lastModified,
      changeFrequency: "weekly",
      priority: href === "/" ? 1 : 0.8,
      alternates: { languages },
    };
  });
}
