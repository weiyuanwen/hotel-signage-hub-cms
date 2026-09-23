import { defineRouting } from "next-intl/routing";

export const APP_TIME_ZONE = "Asia/Ho_Chi_Minh";

export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
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
    "/directory": {
      vi: "/so-do-trang",
      en: "/site-map",
    },
  },
});

export type AppLocale = (typeof routing.locales)[number];
export type AppPathname = keyof typeof routing.pathnames;
