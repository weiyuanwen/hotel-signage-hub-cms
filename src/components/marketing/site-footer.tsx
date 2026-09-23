"use client";

import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitch } from "@/components/marketing/language-switch";
import { Link } from "@/i18n/navigation";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/contact";

export function SiteFooter() {
  const t = useTranslations("nav");

  return (
    <footer className="border-t border-white/10">
      <div className="flex flex-col items-center gap-5 px-5 py-8 text-center sm:px-8 lg:px-12">
        <Link href="/" className="inline-flex" aria-label="SignageHub">
          <BrandMark variant="onDark" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/60">
          <Link href="/product" className="hover:text-white">
            {t("product")}
          </Link>
          <Link href="/gallery" className="hover:text-white">
            {t("gallery")}
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
          <Link href="/directory" className="hover:text-white">
            {t("directory")}
          </Link>
          <LanguageSwitch />
        </nav>
        <a href={supportMailto} className="text-sm text-white/55 hover:text-white">
          {t("support")}: {SUPPORT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
