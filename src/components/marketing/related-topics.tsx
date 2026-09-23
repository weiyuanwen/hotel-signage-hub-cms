import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { AppPathname } from "@/i18n/routing";
import type { MarketingSection } from "@/lib/marketing-metadata";
import { treeNode } from "@/lib/marketing-tree";

export async function RelatedTopics({ section }: { section: MarketingSection }) {
  const t = await getTranslations();
  const node = treeNode(section);
  if (!node || node.related.length === 0) return null;
  const labels: Partial<Record<AppPathname, string>> = {
    "/": t("nav.home"),
    "/product": t("nav.product"),
    "/gallery": t("nav.gallery"),
    "/pricing": t("nav.pricing"),
    "/faq": t("nav.faq"),
    "/join": t("nav.openThree"),
    "/directory": t("nav.directory"),
  };

  return (
    <section className="border-t border-white/10 px-5 py-14 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1400px]">
        <h2 className="font-heading text-2xl font-medium tracking-tight">{t("pages.relatedTitle")}</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {node.related.map((href) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/75 transition-colors hover:border-white/25 hover:text-white"
              >
                {labels[href] ?? href}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
