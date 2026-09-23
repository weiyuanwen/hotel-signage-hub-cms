"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export function MailSpamNotice({ tone = "onDark" }: { tone?: "onDark" | "onIvory" }) {
  const t = useTranslations("waitlist");
  const onDark = tone === "onDark";

  return (
    <p
      role="note"
      className={`flex gap-2 rounded-2xl px-3 py-2.5 text-sm leading-snug ${
        onDark
          ? "border border-[var(--ivory)]/25 bg-[var(--ivory)]/10 text-[var(--ivory)]"
          : "border border-[var(--night)]/12 bg-[var(--night)]/5 text-[var(--night)]"
      }`}
    >
      <WarningCircle className="mt-0.5 size-4 shrink-0" weight="fill" />
      <span>{t("spamNotice")}</span>
    </p>
  );
}
