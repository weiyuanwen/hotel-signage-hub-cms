import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { SiteFrame } from "@/components/marketing/site-frame";
import { Link } from "@/i18n/navigation";
import { photos } from "@/lib/marketing";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <SiteFrame>
      <main className="relative min-h-[100dvh] overflow-hidden">
        <Image src={photos.lounge} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[var(--night)]/70" />
        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[640px] flex-col justify-end px-5 py-16 sm:px-8">
          <h1 className="max-w-[12ch] font-heading text-4xl leading-[1.12] font-medium tracking-tight">{t("title")}</h1>
          <p className="mt-4 max-w-[42ch] text-sm leading-relaxed text-white/70">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Button asChild className="bg-[var(--ivory)] text-[var(--night)] hover:bg-[var(--ivory)]/90">
              <Link href="/">{t("home")}</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/login">{t("login")}</Link>
            </Button>
          </div>
        </div>
      </main>
    </SiteFrame>
  );
}
