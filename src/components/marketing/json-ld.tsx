import { getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { SUPPORT_EMAIL } from "@/lib/contact";
import type { MarketingSection } from "@/lib/marketing-metadata";
import { treeNode } from "@/lib/marketing-tree";

function siteBase() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://signagehub.online").replace(/\/$/, "");
}

export async function MarketingJsonLd({
  section = "home",
  locale,
}: {
  section?: MarketingSection;
  locale?: AppLocale;
}) {
  const base = siteBase();
  const t = await getTranslations();
  const loc = locale ?? "en";
  const node = treeNode(section);
  const pagePath = node ? getPathname({ locale: loc, href: node.href }) : "/";
  const pageUrl = `${base}${pagePath}`;

  const software = {
    "@type": "SoftwareApplication",
    name: "SignageHub",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: base,
    description: t("meta.description"),
    offers: {
      "@type": "Offer",
      priceCurrency: loc === "vi" ? "VND" : "USD",
      price: loc === "vi" ? "15000" : "3",
    },
  };

  const website = {
    "@type": "WebSite",
    name: "SignageHub",
    url: base,
    inLanguage: ["en", "vi"],
  };

  const organization = {
    "@type": "Organization",
    name: "SignageHub",
    url: base,
    logo: `${base}/brand/logo.png`,
    email: SUPPORT_EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      contactType: "customer support",
      availableLanguage: ["en", "vi"],
    },
  };

  const graph: Record<string, unknown>[] = [organization, website, software];

  if (section !== "home" && section !== "login" && node) {
    const homeUrl = `${base}${getPathname({ locale: loc, href: "/" })}`;
    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("nav.home"), item: homeUrl },
        {
          "@type": "ListItem",
          position: 2,
          name: {
            product: t("meta.productTitle"),
            gallery: t("meta.galleryTitle"),
            pricing: t("meta.pricingTitle"),
            faq: t("meta.faqTitle"),
            join: t("meta.joinTitle"),
            directory: t("meta.directoryTitle"),
          }[section],
          item: pageUrl,
        },
      ],
    });
  }

  if (section === "faq") {
    const items = t.raw("faq.items") as { q: string; a: string }[];
    graph.push({
      "@type": "FAQPage",
      mainEntity: items.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  if (section === "directory") {
    graph.push({
      "@type": "CollectionPage",
      name: t("meta.directoryTitle"),
      url: pageUrl,
    });
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }} />;
}
