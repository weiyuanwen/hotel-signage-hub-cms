import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppPathname } from "@/i18n/routing";

const paths: AppPathname[] = ["/", "/product", "/gallery", "/pricing", "/faq", "/join", "/login"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

  return paths.map((href) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${base}${getPathname({ locale, href })}`]),
    );
    return {
      url: languages.vi,
      alternates: { languages },
    };
  });
}
