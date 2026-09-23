export type DeskLocale = "vi" | "en";

const COOKIE = "NEXT_LOCALE";

export function getDeskLocale(): DeskLocale {
  if (typeof document === "undefined") return "vi";
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE}=`))
    ?.split("=")[1];
  return value === "en" ? "en" : "vi";
}

export function setDeskLocale(locale: DeskLocale) {
  document.cookie = `${COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
}

export function deskLoginHref(locale: DeskLocale = getDeskLocale()) {
  return locale === "en" ? "/login" : "/vi/dang-nhap";
}
