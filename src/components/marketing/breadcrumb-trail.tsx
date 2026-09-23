import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { MarketingSection } from "@/lib/marketing-metadata";

export async function BreadcrumbTrail({ section }: { section: Exclude<MarketingSection, "login" | "home"> }) {
  const t = await getTranslations("nav");
  const current = {
    product: t("product"),
    gallery: t("gallery"),
    pricing: t("pricing"),
    faq: t("faq"),
    join: t("openThree"),
    directory: t("directory"),
  }[section];

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-white/55">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-white">
            {t("home")}
          </Link>
        </li>
        <li aria-hidden className="text-white/30">
          /
        </li>
        <li className="text-white/80">{current}</li>
      </ol>
    </nav>
  );
}
