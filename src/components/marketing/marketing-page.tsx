import Image from "next/image";
import { WifiHigh, CloudSun, ImageSquare } from "@phosphor-icons/react/dist/ssr";
import { getLocale, getTranslations } from "next-intl/server";
import { CinemaHero } from "@/components/marketing/cinema-hero";
import { DeskPreview } from "@/components/marketing/desk-preview";
import { HotelProof } from "@/components/marketing/hotel-proof";
import { FaqList } from "@/components/marketing/faq-list";
import { ParallaxFill } from "@/components/marketing/parallax-fill";
import { PricingMenu } from "@/components/marketing/pricing-menu";
import { RoomCorridor } from "@/components/marketing/room-corridor";
import { ScrollRise } from "@/components/marketing/scroll-rise";
import { RelatedTopics } from "@/components/marketing/related-topics";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteFrame } from "@/components/marketing/site-frame";
import { SiteHeader } from "@/components/marketing/site-header";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { MarketingJsonLd } from "@/components/marketing/json-ld";
import { SectionPage } from "@/components/marketing/section-page";
import type { AppLocale } from "@/i18n/routing";
import { photos } from "@/lib/marketing";
import type { MarketingSection } from "@/lib/marketing-metadata";

export async function MarketingPage({ section, paid }: { section?: string; paid?: string }) {
  if (section && section !== "home") {
    return <SectionPage section={section as Exclude<MarketingSection, "login" | "home">} paid={paid} />;
  }

  const t = await getTranslations();
  const locale = (await getLocale()) as AppLocale;

  return (
    <SiteFrame>
      <MarketingJsonLd section="home" locale={locale} />
      <SiteHeader />
      <main>
        <CinemaHero />
        <HotelProof />
        <RoomCorridor />

        <section id="product" className="px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <ScrollRise className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="max-w-[12ch] font-heading text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
                {t("product.title")}
              </h2>
              <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-white/65">{t("product.body")}</p>
              <ol className="mt-8 grid gap-6 sm:grid-cols-2">
                <Step className="sm:col-span-2" title={t("product.step1Title")} body={t("product.step1Body")} />
                <Step title={t("product.step2Title")} body={t("product.step2Body")} />
                <Step title={t("product.step3Title")} body={t("product.step3Body")} />
              </ol>
            </div>
            <div className="lg:col-span-7">
              <DeskPreview />
            </div>
          </ScrollRise>
        </section>

        <section className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <ParallaxFill className="min-h-[380px] lg:min-h-[620px]">
            <Image
              src={photos.lounge}
              alt={t("lounge.photoAlt")}
              fill
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover"
            />
          </ParallaxFill>
          <ScrollRise className="flex flex-col justify-center gap-8 px-5 py-14 sm:px-10 lg:px-14">
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
          </ScrollRise>
        </section>

        <section className="px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <ScrollRise>
            <blockquote className="mx-auto max-w-[720px]">
              <p className="font-heading text-2xl leading-[1.25] font-medium tracking-tight sm:text-3xl">{t("quote.body")}</p>
              <footer className="mt-6 text-sm text-white/55">{t("quote.by")}</footer>
            </blockquote>
          </ScrollRise>
        </section>

        <section id="pricing" className="border-y border-white/10 px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
          <PricingMenu />
        </section>

        <section id="faq" className="mx-auto max-w-[720px] px-5 py-20 sm:px-8 lg:py-24">
          <ScrollRise>
            <h2 className="mb-8 font-heading text-3xl font-medium tracking-tight">{t("faq.title")}</h2>
            <FaqList />
          </ScrollRise>
        </section>

        <section className="relative min-h-[70dvh] overflow-hidden">
          <ParallaxFill className="absolute inset-0 min-h-[70dvh]">
            <Image src={photos.bar} alt="" fill sizes="100vw" className="object-cover" />
          </ParallaxFill>
          <div className="absolute inset-0 bg-[var(--night)]/74" />
          <ScrollRise className="relative z-10 mx-auto flex min-h-[70dvh] max-w-[1400px] flex-col justify-end px-5 py-16 sm:px-8 lg:px-12">
            <h2 className="max-w-[14ch] font-heading text-4xl leading-[1.12] font-medium tracking-tight sm:text-5xl">
              {t("cta.title")}
            </h2>
            <div className="mt-8 max-w-lg">
              <WaitlistForm size="compact" />
            </div>
          </ScrollRise>
        </section>
      </main>
      <RelatedTopics section="home" />
      <SiteFooter />
    </SiteFrame>
  );
}

function Step({ title, body, className = "" }: { title: string; body: string; className?: string }) {
  return (
    <li className={className}>
      <p className="font-heading text-lg font-medium">{title}</p>
      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-white/65">{body}</p>
    </li>
  );
}
