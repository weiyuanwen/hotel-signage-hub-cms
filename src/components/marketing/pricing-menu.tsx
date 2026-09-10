"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import type { HotelPlan } from "@/lib/api";

export function PricingMenu() {
  const t = useTranslations("pricing");
  const [plan, setPlan] = useState<Extract<HotelPlan, "free" | "premium">>("free");

  const plans = [
    {
      key: "free" as const,
      name: t("threeName"),
      devices: t("threePrice"),
      pairing: t("threePairing"),
      note: t("threeNote"),
      cta: t("threeCta"),
    },
    {
      key: "premium" as const,
      name: t("manyName"),
      devices: t("manyPrice"),
      pairing: t("manyPairing"),
      note: t("manyNote"),
      cta: t("manyCta"),
      featured: true,
    },
  ];
  const selected = plans.find((item) => item.key === plan) ?? plans[0];

  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-4">
        <h2 className="font-heading text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">{t("title")}</h2>
        <p className="mt-4 max-w-[38ch] text-sm leading-relaxed text-white/65">{t("body")}</p>
      </div>

      <div className="lg:col-span-8">
        <ul className="divide-y divide-white/12 border-y border-white/12">
          {plans.map((item) => {
            const active = item.key === plan;
            return (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setPlan(item.key)}
                  aria-pressed={active}
                  className={`grid w-full grid-cols-[1fr_auto] items-end gap-4 py-5 text-left transition-colors duration-200 sm:grid-cols-[minmax(0,1fr)_9rem_auto] ${
                    item.featured ? "py-8" : ""
                  } ${active ? "text-white" : "text-white/70 hover:text-white"}`}
                >
                  <span>
                    <span className={`block font-heading font-medium tracking-tight ${item.featured ? "text-2xl sm:text-3xl" : "text-lg"}`}>
                      {item.name}
                    </span>
                    <span className="mt-1 block max-w-[42ch] text-sm text-white/55">{item.pairing}</span>
                  </span>
                  <span className={`hidden font-heading tracking-tight sm:block ${item.featured ? "text-xl" : "text-base"}`}>
                    {item.devices}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1.5 text-sm whitespace-nowrap ${
                      active ? "bg-[var(--ivory)] text-[var(--night)]" : "border border-white/20 text-white"
                    }`}
                  >
                    {item.cta}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-sm text-white/50 sm:hidden">
          {selected.devices}. {selected.note}
        </p>
        <p className="mt-3 hidden text-sm text-white/50 sm:block">{selected.note}</p>
        <div className="mt-8 max-w-lg">
          <WaitlistForm size="compact" plan={plan} askHotelName submitLabel={selected.cta} />
        </div>
      </div>
    </div>
  );
}
