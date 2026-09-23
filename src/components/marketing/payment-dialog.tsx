"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Copy, X } from "@phosphor-icons/react";
import { MailSpamNotice } from "@/components/marketing/mail-spam-notice";
import { Button } from "@/components/ui/button";
import { api, apiErrorMessage } from "@/lib/api";
import { Link } from "@/i18n/navigation";

export type PaidPlan = "standard" | "premium";

type Checkout = {
  order_code: string;
  status: "pending" | "paid" | "expired" | "failed";
  plan: PaidPlan;
  method: "bank" | "stripe";
  amount_vnd: number;
  transfer_content: string | null;
  qr_image_url: string | null;
  bank: { bank_id: string; bank_name?: string; account_no: string; account_name: string } | null;
  expires_at: string | null;
};

export function PaymentDialog({
  email,
  hotelName,
  plan,
  locale,
  onClose,
}: {
  email: string;
  hotelName?: string;
  plan: PaidPlan;
  locale: "vi" | "en";
  onClose: () => void;
}) {
  const t = useTranslations("pay");
  const [order, setOrder] = useState<Checkout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    setBusy(true);
    void api<Checkout>("/cms/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ email, hotel_name: hotelName, plan, method: "bank", locale }),
    })
      .then(setOrder)
      .catch((err) => setError(apiErrorMessage(err, t("failed"))))
      .finally(() => setBusy(false));
  }, [email, hotelName, locale, plan, t]);

  useEffect(() => {
    if (!order || order.status !== "pending") return;
    const id = window.setInterval(async () => {
      try {
        const fresh = await api<Checkout>(`/cms/billing/orders/${order.order_code}`);
        setOrder(fresh);
      } catch {
        /* keep last */
      }
    }, 8000);
    return () => window.clearInterval(id);
  }, [order?.order_code, order?.status]);

  const paid = order?.status === "paid";
  const expired = order?.status === "expired";

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/65 p-4" role="dialog" aria-modal="true" aria-labelledby="pay-title">
      <div className="relative w-full max-w-[440px] rounded-3xl bg-[var(--ivory)] p-6 text-[var(--night)] shadow-[0_24px_80px_rgb(0_0_0/0.4)]">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-[var(--night)]/50 hover:text-[var(--night)]" aria-label={t("close")}>
          <X className="size-5" />
        </button>
        <h2 id="pay-title" className="font-heading text-2xl font-medium tracking-tight">
          {paid ? t("paidTitle") : t("title")}
        </h2>
        <p className="mt-1 text-sm text-[var(--night)]/65">{paid ? t("paidBody") : t("body")}</p>
        <div className="mt-3">
          <MailSpamNotice tone="onIvory" />
        </div>

        {paid ? (
          <div className="mt-6 grid gap-3">
            <p className="flex items-center gap-2 text-sm">
              <CheckCircle className="size-4" weight="fill" />
              {order.order_code}
            </p>
            <Button asChild className="h-11 bg-[var(--night)] text-[var(--ivory)]">
              <Link href="/login">{t("signIn")}</Link>
            </Button>
          </div>
        ) : !order ? (
          <p className="mt-5 text-sm text-[var(--night)]/60">{busy ? t("creating") : t("failed")}</p>
        ) : (
          <div className="mt-5 grid gap-3">
            {order.qr_image_url ? (
              <img src={order.qr_image_url} alt={t("qrAlt")} width={224} height={224} className="mx-auto rounded-2xl bg-white p-2" />
            ) : null}
            <dl className="grid gap-1.5 rounded-2xl bg-white/70 px-3 py-3 text-sm">
              {order.bank?.bank_id || order.bank?.bank_name ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--night)]/50">{t("bankName")}</dt>
                  <dd>{order.bank.bank_name || order.bank.bank_id}</dd>
                </div>
              ) : null}
              {order.bank?.account_no ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--night)]/50">{t("accountNo")}</dt>
                  <dd className="font-mono">{order.bank.account_no}</dd>
                </div>
              ) : null}
              {order.bank?.account_name ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-[var(--night)]/50">{t("accountName")}</dt>
                  <dd className="text-right">{order.bank.account_name}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--night)]/50">{t("amount")}</dt>
                <dd className="font-heading text-base">{order.amount_vnd.toLocaleString(locale)}đ</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[var(--night)]/50">{t("content")}</dt>
                <dd className="flex min-w-0 items-center gap-2">
                  <span className="truncate font-mono">{order.transfer_content}</span>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(order.transfer_content ?? "")}
                    className="shrink-0 text-[var(--night)]/55 hover:text-[var(--night)]"
                    aria-label={t("copy")}
                  >
                    <Copy className="size-4" />
                  </button>
                </dd>
              </div>
            </dl>
            <p className="text-center text-xs text-[var(--night)]/50">{expired ? t("expired") : t("waiting")}</p>
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>
    </div>
  );
}
