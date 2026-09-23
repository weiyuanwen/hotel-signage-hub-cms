import Image from "next/image";
import { WifiHigh, CloudSun, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { BreadcrumbTrail } from "@/components/marketing/breadcrumb-trail";
import { DeskPreview } from "@/components/marketing/desk-preview";
import { FaqList } from "@/components/marketing/faq-list";
import { MarketingJsonLd } from "@/components/marketing/json-ld";
import { PricingMenu } from "@/components/marketing/pricing-menu";
import { RelatedTopics } from "@/components/marketing/related-topics";
import { RoomCorridor } from "@/components/marketing/room-corridor";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteFrame } from "@/components/marketing/site-frame";
import { SiteHeader } from "@/components/marketing/site-header";
import { PaidReturn } from "@/components/marketing/paid-return";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { getPathname, Link } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { photos } from "@/lib/marketing";
import type { MarketingSection } from "@/lib/marketing-metadata";
import { PUBLIC_TREE } from "@/lib/marketing-tree";

type Leaf = Exclude<MarketingSection, "login" | "home">;

export async function SectionPage({ section, paid }: { section: Leaf; paid?: string }) {
  const t = await getTranslations();
  const locale = (await getLocale()) as AppLocale;
  const paidCode = paid?.trim().toUpperCase();
  const paidReturn = section === "join" && Boolean(paidCode);

  return (
    <SiteFrame>
      <MarketingJsonLd section={section} locale={locale} />
      <SiteHeader />
      <main>
        {section === "gallery" ? (
          <>
            <div className="px-5 pt-24 sm:px-8 lg:px-12">
              <div className="mx-auto max-w-[1400px]">
                <BreadcrumbTrail section={section} />
                <h1 className="mt-4 max-w-[18ch] font-heading text-4xl leading-[1.12] font-medium tracking-tight sm:text-5xl">
                  {t(`pages.${section}.h1`)}
                </h1>
                <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-white/65">{t(`pages.${section}.lead`)}</p>
              </div>
            </div>
            <RoomCorridor />
          </>
        ) : (
          <div className="px-5 pt-24 pb-10 sm:px-8 lg:px-12">
            <div className="mx-auto max-w-[1400px]">
              <BreadcrumbTrail section={section} />
              <h1 className="mt-4 max-w-[18ch] font-heading text-4xl leading-[1.12] font-medium tracking-tight sm:text-5xl">
                {paidReturn ? t("pay.paidTitle") : t(`pages.${section}.h1`)}
              </h1>
              <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-white/65">
                {paidReturn ? t("pay.paidBody") : t(`pages.${section}.lead`)}
              </p>
            </div>
          </div>
        )}

        {section === "product" ? <ProductBody /> : null}
        {section === "pricing" ? (
          <section className="border-y border-white/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <PricingMenu />
          </section>
        ) : null}
        {section === "faq" ? (
          <section className="mx-auto max-w-[720px] px-5 pb-16 sm:px-8">
            <FaqList />
          </section>
        ) : null}
        {section === "join" ? (
          <section className="mx-auto max-w-lg px-5 pb-16 sm:px-8">
            {paidCode ? <PaidReturn code={paidCode} /> : <WaitlistForm />}
          </section>
        ) : null}
        {section === "directory" ? <DirectoryBody /> : null}

        <RelatedTopics section={section} />
      </main>
      <SiteFooter />
    </SiteFrame>
  );
}

async function ProductBody() {
  const t = await getTranslations();
  return (
    <>
      <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="max-w-[12ch] font-heading text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
              {t("product.title")}
            </h2>
            <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-white/65">{t("product.body")}</p>
            <ol className="mt-8 grid gap-6 sm:grid-cols-2">
              <li className="sm:col-span-2">
                <p className="font-heading text-lg font-medium">{t("product.step1Title")}</p>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-white/65">{t("product.step1Body")}</p>
              </li>
              <li>
                <p className="font-heading text-lg font-medium">{t("product.step2Title")}</p>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-white/65">{t("product.step2Body")}</p>
              </li>
              <li>
                <p className="font-heading text-lg font-medium">{t("product.step3Title")}</p>
                <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-white/65">{t("product.step3Body")}</p>
              </li>
            </ol>
          </div>
          <div className="lg:col-span-7">
            <DeskPreview />
          </div>
        </div>
      </section>
      <section className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[380px] lg:min-h-[520px]">
          <Image
            src={photos.lounge}
            alt={t("lounge.photoAlt")}
            fill
            sizes="(max-width: 1024px) 100vw, 58vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center gap-8 px-5 py-14 sm:px-10 lg:px-14">
          <h2 className="font-heading text-3xl leading-[1.15] font-medium tracking-tight">{t("lounge.title")}</h2>
          <ul className="grid gap-5 text-sm leading-relaxed text-white/75">
            <li className="flex gap-3">
              <WifiHigh className="mt-0.5 size-5 shrink-0 text-[var(--ivory)]" />
              <span>{t("lounge.wifi")}</span>
            </li>
            <li className="flex gap-3">
              <CloudSun className="mt-0.5 size-5 shrink-0 text-[var(--ivory)]" />
              <span>{t("lounge.weather")}</span>
            </li>
            <li className="flex gap-3">
              <ImageSquare className="mt-0.5 size-5 shrink-0 text-[var(--ivory)]" />
              <span>{t("lounge.media")}</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}

async function DirectoryBody() {
  const t = await getTranslations();
  const locale = (await getLocale()) as AppLocale;
  const label: Record<string, string> = {
    home: t("nav.home"),
    product: t("nav.product"),
    gallery: t("nav.gallery"),
    pricing: t("nav.pricing"),
    faq: t("nav.faq"),
    join: t("nav.openThree"),
    directory: t("nav.directory"),
  };
  const blurb: Record<string, string> = {
    home: t("meta.description"),
    product: t("pages.product.lead"),
    gallery: t("pages.gallery.lead"),
    pricing: t("pages.pricing.lead"),
    faq: t("pages.faq.lead"),
    join: t("pages.join.lead"),
    directory: t("pages.directory.lead"),
  };

  return (
    <section className="px-5 pb-16 sm:px-8 lg:px-12">
      <ol className="mx-auto grid max-w-[1400px] gap-4">
        {PUBLIC_TREE.map((node) => (
          <li key={node.href} className="rounded-2xl border border-white/10 px-5 py-4">
            <p className="text-xs text-white/40">{getPathname({ locale, href: node.href }) || "/"}</p>
            <Link href={node.href} className="font-heading text-xl text-white hover:underline">
              {label[node.section]}
            </Link>
            <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-white/60">{blurb[node.section]}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
