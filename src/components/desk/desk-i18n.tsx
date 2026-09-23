"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import en from "../../../messages/en.json";
import vi from "../../../messages/vi.json";
import { getDeskLocale, setDeskLocale, type DeskLocale } from "@/lib/desk-locale";
import { APP_TIME_ZONE } from "@/i18n/routing";

const DeskLocaleContext = createContext<{
  locale: DeskLocale;
  setLocale: (locale: DeskLocale) => void;
} | null>(null);

export function useDeskLocale() {
  const ctx = useContext(DeskLocaleContext);
  if (!ctx) throw new Error("useDeskLocale must be used inside DeskI18n");
  return ctx;
}

export function DeskI18n({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale?: DeskLocale;
}) {
  const [locale, setLocaleState] = useState<DeskLocale>(initialLocale ?? getDeskLocale);
  const setLocale = useCallback((next: DeskLocale) => {
    setDeskLocale(next);
    setLocaleState(next);
  }, []);
  const messages = useMemo(() => (locale === "en" ? en : vi), [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <DeskLocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone={APP_TIME_ZONE}>
        {children}
      </NextIntlClientProvider>
    </DeskLocaleContext.Provider>
  );
}
