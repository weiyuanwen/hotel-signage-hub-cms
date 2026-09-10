import { cookies } from "next/headers";
import { AppShell } from "@/components/AppShell";
import { DeskI18n } from "@/components/desk/desk-i18n";
import type { DeskLocale } from "@/lib/desk-locale";

export default async function DeskLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const raw = jar.get("NEXT_LOCALE")?.value;
  const locale: DeskLocale = raw === "en" ? "en" : "vi";

  return (
    <DeskI18n initialLocale={locale}>
      <AppShell>{children}</AppShell>
    </DeskI18n>
  );
}
