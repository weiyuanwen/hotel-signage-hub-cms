"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import type { AppLocale, AppPathname } from "@/i18n/routing";

export function LanguageSwitch() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 text-[13px]" aria-label={t("langLabel")}>
      {(["vi", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <Link
            key={code}
            href={pathname as AppPathname}
            locale={code as AppLocale}
            replace
            className={`rounded-full px-2 py-1 transition-colors ${
              active ? "bg-white/15 text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {code === "vi" ? t("langVi") : t("langEn")}
          </Link>
        );
      })}
    </div>
  );
}
