"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { MailSpamNotice } from "@/components/marketing/mail-spam-notice";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";

type Order = {
  order_code: string;
  status: "pending" | "paid" | "expired" | "failed";
};

export function PaidReturn({ code }: { code: string }) {
  const t = useTranslations("pay");
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const orderCode = code.trim().toUpperCase();
    if (!/^SHUB[A-Z0-9]{10}$/.test(orderCode)) {
      setMissing(true);
      return;
    }

    let cancelled = false;
    let tries = 0;

    async function tick() {
      try {
        const fresh = await api<Order>(`/cms/billing/orders/${orderCode}`);
        if (cancelled) return;
        setOrder(fresh);
        if (fresh.status === "paid" || fresh.status === "expired" || fresh.status === "failed") {
          return false;
        }
      } catch {
        if (cancelled) return;
        tries += 1;
        if (tries >= 8) setMissing(true);
      }
      return true;
    }

    void tick();
    const id = window.setInterval(() => {
      void tick().then((keep) => {
        if (keep === false) window.clearInterval(id);
      });
    }, 2500);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [code]);

  const paid = order?.status === "paid";

  return (
    <div className="grid gap-4 text-white" role="status">
      <p className="flex items-center gap-2 text-sm">
        <CheckCircle className="size-4 shrink-0" weight="fill" />
        {paid ? t("returnReady") : missing ? t("returnMissing") : t("returnPending")}
      </p>
      {order ? <p className="font-mono text-sm text-white/55">{order.order_code}</p> : null}
      {paid ? <MailSpamNotice /> : null}
      <Button asChild className="h-11 w-fit bg-[var(--ivory)] text-[var(--night)] hover:bg-[var(--ivory)]/90">
        <Link href="/login">{t("signIn")}</Link>
      </Button>
    </div>
  );
}
