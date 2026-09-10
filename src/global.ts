import { routing } from "@/i18n/routing";
import vi from "../messages/vi.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof vi;
  }
}
