import { setRequestLocale } from "next-intl/server";
import { LoginPage } from "@/components/marketing/login-page";
import type { AppLocale } from "@/i18n/routing";
import { localeMetadata } from "@/lib/locale-marketing";

export const generateMetadata = localeMetadata("login");

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale as AppLocale);
  return <LoginPage />;
}
