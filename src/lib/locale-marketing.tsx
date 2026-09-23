import { setRequestLocale } from "next-intl/server";
import { MarketingPage } from "@/components/marketing/marketing-page";
import type { AppLocale } from "@/i18n/routing";
import { marketingMetadata } from "@/lib/marketing-metadata";

type Section = Parameters<typeof marketingMetadata>[1];

export function localeMetadata(section: Section) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    return marketingMetadata(locale as AppLocale, section);
  };
}

export function LocaleMarketingPage(section?: string) {
  return async function Page({
    params,
    searchParams,
  }: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ paid?: string }>;
  }) {
    const { locale } = await params;
    const query = await searchParams;
    setRequestLocale(locale as AppLocale);
    return <MarketingPage section={section} paid={query.paid} />;
  };
}
