"use client";

import NextLink from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, usePathname } from "@/i18n/navigation";
import type { AppLocale, AppPathname } from "@/i18n/routing";

export function LanguageSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-[13px]" aria-label={t("langLabel")}>
      {(["en", "vi"] as const).map((code) => {
        const active = locale === code;
        const href = getPathname({ locale: code as AppLocale, href: pathname as AppPathname });
        return (
          <NextLink
            key={code}
            href={href}
            hrefLang={code}
            replace
            className={`rounded-full px-2 py-1 transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {code === "vi" ? t("langVi") : t("langEn")}
          </NextLink>
        );
      })}
    </div>
  );
}
