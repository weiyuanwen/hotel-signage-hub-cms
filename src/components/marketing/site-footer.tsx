"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitch } from "@/components/marketing/language-switch";
import { Link } from "@/i18n/navigation";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="border-t border-white/10">
      <div className="flex flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="text-[13px] font-medium tracking-[0.18em] uppercase">Signage Desk</p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
          <Link href="/login" className="hover:text-white">
            {t("login")}
          </Link>
          <Link href="/pricing" className="hover:text-white">
            {t("pricing")}
          </Link>
          <Link href="/faq" className="hover:text-white">
            {t("faq")}
          </Link>
          <Link href="/join" className="hover:text-white">
            {t("openThree")}
          </Link>
          <LanguageSwitch />
        </nav>
      </div>
    </footer>
  );
}
