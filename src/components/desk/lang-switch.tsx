"use client";

import { useTranslations } from "next-intl";
import { useDeskLocale } from "@/components/desk/desk-i18n";
import type { DeskLocale } from "@/lib/desk-locale";

const LOCALES: DeskLocale[] = ["vi", "en"];

export function DeskLangSwitch({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useDeskLocale();
  const t = useTranslations("desk.lang");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className={`grid grid-cols-2 rounded-[10px] border border-line bg-surface p-0.5 ${compact ? "" : "w-full"}`}
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={`rounded-[8px] px-2 py-1 text-xs font-medium transition-[background-color,color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
              active
                ? "bg-bg text-ink shadow-[0_1px_2px_color-mix(in_oklch,var(--ink)_10%,transparent)]"
                : "text-muted hover:text-ink"
            }`}
          >
            {t(code)}
          </button>
        );
      })}
    </div>
  );
}
