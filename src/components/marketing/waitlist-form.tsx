"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { MailSpamNotice } from "@/components/marketing/mail-spam-notice";
import { PaymentDialog, type PaidPlan } from "@/components/marketing/payment-dialog";
import { api, ApiError, apiErrorMessage, type HotelPlan } from "@/lib/api";

export function WaitlistForm({
  size = "hero",
  plan = "free",
  askHotelName = false,
  submitLabel,
}: {
  size?: "hero" | "compact";
  plan?: HotelPlan;
  askHotelName?: boolean;
  submitLabel?: string;
}) {
  const t = useTranslations("waitlist");
  const locale = useLocale();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [existing, setExisting] = useState(false);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pay, setPay] = useState<{ email: string; hotelName?: string; plan: PaidPlan } | null>(null);

  const paid = plan === "standard" || plan === "premium";

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("celebrate") !== "1") return;
    const next: PaidPlan = plan === "premium" ? "premium" : "standard";
    setPay({ email: "preview@signagehub.online", plan: next });
  }, [plan]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t("invalidEmail"));
      return;
    }
    setBusy(true);
    setError(null);
    setExisting(false);
    try {
      await api("/cms/waitlist", {
        method: "POST",
        body: JSON.stringify({
          email: value,
          plan,
          hotel_name: hotelName.trim() || undefined,
        }),
      });
      if (paid) {
        setPay({ email: value, hotelName: hotelName.trim() || undefined, plan });
        return;
      }
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        if (paid) {
          setPay({ email: value, hotelName: hotelName.trim() || undefined, plan });
          return;
        }
        setExisting(true);
        setError(apiErrorMessage(err, t("existing")));
        return;
      }
      setError(apiErrorMessage(err, t("failed")));
    } finally {
      setBusy(false);
    }
  }

  if (pay) {
    return (
      <PaymentDialog
        email={pay.email}
        hotelName={pay.hotelName}
        plan={pay.plan}
        locale={locale === "en" ? "en" : "vi"}
        onClose={() => setPay(null)}
      />
    );
  }

  if (done) {
    return (
      <motion.div
        className="grid gap-2 text-sm text-white"
        role="status"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="flex items-center gap-2">
          <CheckCircle className="size-4 shrink-0" weight="fill" />
          {t("sent", { email: email.trim().toLowerCase() })}
        </p>
        <p className="text-white/70">{t("sentHint")}</p>
        <MailSpamNotice />
        <Link href="/login" className="text-white underline decoration-white/40 underline-offset-4 hover:decoration-white">
          {t("signIn")}
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="grid gap-2">
      {askHotelName ? (
        <div className="grid gap-1.5">
          <Label htmlFor={`hotel-${size}`} className="text-sm text-white/80">
            {t("hotelLabel")}
          </Label>
          <Input
            id={`hotel-${size}`}
            value={hotelName}
            onChange={(event) => setHotelName(event.target.value)}
            placeholder={t("hotelPlaceholder")}
            className="h-12 rounded-full border-white/20 bg-white/8 px-4 text-white placeholder:text-white/40"
          />
        </div>
      ) : null}
      <Label htmlFor={`waitlist-${size}`} className="sr-only">
        {t("emailLabel")}
      </Label>
      <div className="flex flex-col gap-2 rounded-3xl bg-[var(--ivory)] p-1.5 shadow-[0_18px_44px_rgb(0_0_0/0.28)] sm:flex-row sm:items-stretch sm:rounded-full">
        <Input
          id={`waitlist-${size}`}
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={t("emailPlaceholder")}
          aria-invalid={Boolean(error)}
          className="h-12 flex-1 rounded-full border-0 bg-transparent px-4 text-[var(--night)] shadow-none placeholder:text-[var(--night)]/45 focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent"
        />
        <Button
          type="submit"
          disabled={busy}
          className="h-12 shrink-0 rounded-full bg-[var(--night)] px-6 text-[var(--ivory)] transition-transform duration-200 hover:bg-[var(--night)]/90 active:scale-[0.98]"
        >
          {busy ? t("sending") : submitLabel ?? t("submit")}
        </Button>
      </div>
      {error ? (
        <div className="grid gap-2">
          <p className="text-sm text-white">
            {error}{" "}
            {existing ? (
              <Link href="/login" className="underline decoration-white/40 underline-offset-4 hover:decoration-white">
                {t("signIn")}
              </Link>
            ) : null}
          </p>
          {existing ? <MailSpamNotice /> : null}
        </div>
      ) : null}
    </form>
  );
}
