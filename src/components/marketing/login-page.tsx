"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand-mark";
import { SiteFrame } from "@/components/marketing/site-frame";
import { LanguageSwitch } from "@/components/marketing/language-switch";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { SUPPORT_EMAIL, supportMailto } from "@/lib/contact";
import { photos } from "@/lib/marketing";
import { useSession } from "@/lib/session";

export function LoginPage() {
  const t = useTranslations("login");
  const { login, user, ready } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/rooms");
  }, [ready, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/rooms");
    } catch (err) {
      setError(err instanceof ApiError ? t("badCredentials") : t("network"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteFrame>
      <main className="relative min-h-[100dvh] overflow-hidden">
        <Image
          src={photos.lobby}
          alt={t("photoAlt")}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_35%]"
        />
        <div className="absolute inset-0 bg-[var(--night)]/45 lg:bg-gradient-to-r lg:from-transparent lg:via-[var(--night)]/20 lg:to-[var(--night)]/55" />
        <div className="absolute top-5 left-5 z-20 flex items-center gap-4 sm:left-8">
          <Link href="/" className="inline-flex" aria-label="SignageHub">
            <BrandMark variant="onDark" />
          </Link>
          <LanguageSwitch />
        </div>
        <form
          onSubmit={(event) => void onSubmit(event)}
          className="relative z-10 mx-auto flex min-h-[100dvh] max-w-[400px] flex-col justify-end px-5 pb-8 sm:px-0 lg:absolute lg:top-1/2 lg:right-[8vw] lg:mx-0 lg:w-[400px] lg:-translate-y-1/2 lg:justify-center lg:pb-0"
        >
          <div className="rounded-2xl bg-[var(--ivory)] p-7 text-[var(--night)] shadow-[0_24px_80px_rgb(0_0_0_/_.28)] sm:p-8">
            <h1 className="font-heading text-2xl font-medium tracking-tight">{t("title")}</h1>
            <p className="mt-1 text-sm text-[var(--night)]/65">{t("subtitle")}</p>
            <div className="mt-6 space-y-2">
              <Label htmlFor="email" className="text-[var(--night)]">
                {t("email")}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 border-[var(--night)]/15 bg-white/40 px-3 text-[var(--night)] placeholder:text-[var(--night)]/35 focus-visible:border-[var(--night)]/40 focus-visible:ring-[var(--night)]/20 dark:bg-white/40"
                required
              />
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="password" className="text-[var(--night)]">
                {t("password")}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 border-[var(--night)]/15 bg-white/40 px-3 text-[var(--night)] placeholder:text-[var(--night)]/35 focus-visible:border-[var(--night)]/40 focus-visible:ring-[var(--night)]/20 dark:bg-white/40"
                required
              />
            </div>
            {error ? (
              <Alert variant="destructive" className="mt-4">
                <WarningCircle className="size-4" weight="fill" />
                <AlertTitle>{t("errorTitle")}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              type="submit"
              disabled={busy}
              className="mt-6 h-11 w-full bg-[var(--night)] text-[var(--ivory)] hover:bg-[var(--night)]/90"
            >
              {busy ? t("busy") : t("submit")}
            </Button>
            <p className="mt-4 text-xs text-[var(--night)]/55">
              {t("noAccount")}{" "}
              <Link href="/join" className="text-[var(--night)] underline-offset-4 hover:underline">
                {t("openDesk")}
              </Link>
              . {t("support")}:{" "}
              <a href={supportMailto} className="text-[var(--night)] underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </div>
        </form>
      </main>
    </SiteFrame>
  );
}
