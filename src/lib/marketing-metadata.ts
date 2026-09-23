import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale, type AppPathname } from "@/i18n/routing";
import { photos } from "@/lib/marketing";

const sectionPath = {
  home: "/",
  product: "/product",
  gallery: "/gallery",
  pricing: "/pricing",
  faq: "/faq",
  join: "/join",
  directory: "/directory",
  login: "/login",
} as const;

const sectionMetaKey = {
  home: { title: "title", description: "description" },
  product: { title: "productTitle", description: "productDescription" },
  gallery: { title: "galleryTitle", description: "galleryDescription" },
  pricing: { title: "pricingTitle", description: "pricingDescription" },
  faq: { title: "faqTitle", description: "faqDescription" },
  join: { title: "joinTitle", description: "joinDescription" },
  directory: { title: "directoryTitle", description: "directoryDescription" },
  login: { title: "loginTitle", description: "description" },
} as const;

export type MarketingSection = keyof typeof sectionPath;

function absoluteUrl(locale: AppLocale, href: AppPathname): string {
  const path = getPathname({ locale, href });
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online";
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
  languages["x-default"] = absoluteUrl(routing.defaultLocale, href);

  const title = t(keys.title);
  const description = t(keys.description);
  const url = absoluteUrl(locale, href);
  const siteName = "SignageHub";

  return {
    metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "")),
    title: section === "home" ? { absolute: title } : title,
    description,
    applicationName: siteName,
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: "/apple-icon.png",
    },
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      type: "website",
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? ["en_US"] : ["vi_VN"],
      url,
      siteName,
      title,
      description,
      images: [{ url: photos.lounge, width: 1400, height: 788, alt: "SignageHub" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [photos.lounge],
    },
    robots: {
      index: section !== "login",
      follow: section !== "login",
    },
  };
}
