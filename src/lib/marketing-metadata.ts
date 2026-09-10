import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale, type AppPathname } from "@/i18n/routing";

const sectionPath = {
  home: "/",
  product: "/product",
  gallery: "/gallery",
  pricing: "/pricing",
  faq: "/faq",
  join: "/join",
  login: "/login",
} as const;

const sectionMetaKey = {
  home: { title: "title", description: "description" },
  product: { title: "productTitle", description: "productDescription" },
  gallery: { title: "galleryTitle", description: "galleryDescription" },
  pricing: { title: "pricingTitle", description: "pricingDescription" },
  faq: { title: "faqTitle", description: "faqDescription" },
  join: { title: "joinTitle", description: "joinDescription" },
  login: { title: "loginTitle", description: "description" },
} as const;

export type MarketingSection = keyof typeof sectionPath;

function absoluteUrl(locale: AppLocale, href: AppPathname): string {
  const path = getPathname({ locale, href });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function marketingMetadata(locale: AppLocale, section: MarketingSection = "home"): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "meta" });
  const keys = sectionMetaKey[section];
  const href = sectionPath[section];
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = absoluteUrl(loc, href);
  }
  languages["x-default"] = absoluteUrl("vi", href);

  return {
    title: section === "home" ? { absolute: t(keys.title) } : t(keys.title),
    description: t(keys.description),
    alternates: {
      canonical: absoluteUrl(locale, href),
      languages,
    },
  };
}
