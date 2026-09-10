import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/product": {
      vi: "/san-pham",
      en: "/product",
    },
    "/gallery": {
      vi: "/mau-chao",
      en: "/gallery",
    },
    "/pricing": {
      vi: "/bang-gia",
      en: "/pricing",
    },
    "/faq": {
      vi: "/hoi-dap",
      en: "/faq",
    },
    "/join": {
      vi: "/tham-gia",
      en: "/join",
    },
    "/login": {
      vi: "/dang-nhap",
      en: "/login",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
