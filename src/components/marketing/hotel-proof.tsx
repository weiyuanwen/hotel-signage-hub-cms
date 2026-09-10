"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { HOTEL_CUSTOMERS, type HotelCustomerId } from "@/lib/hotel-customers";

function HotelMark({ id }: { id: HotelCustomerId }) {
  const common = {
    viewBox: "0 0 28 28",
    className: "size-8 shrink-0 text-[var(--ivory)]",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "song-han":
      return (
        <svg {...common}>
          <path d="M4 11c4-3 7 3 11 0s7 3 9 0" />
          <path d="M4 17c4-3 7 3 11 0s7 3 9 0" />
        </svg>
      );
    case "an-vien":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="9" />
          <circle cx="14" cy="14" r="4" />
        </svg>
      );
    case "lantern":
      return (
        <svg {...common}>
          <rect x="9" y="7" width="10" height="14" rx="5" />
          <path d="M14 7V4M11 21h6" />
        </svg>
      );
    case "may-hill":
      return (
        <svg {...common}>
          <path d="M4 20h20L14 6 4 20Z" />
          <path d="M8 20l6-9 6 9" />
        </svg>
      );
    case "cat-vang":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="5" />
          <path d="M14 4v3M14 21v3M4 14h3M21 14h3" />
        </svg>
      );
    case "phu-hai":
      return (
        <svg {...common}>
          <circle cx="11" cy="14" r="6" />
          <circle cx="17" cy="14" r="6" />
        </svg>
      );
    case "long-bien":
      return (
        <svg {...common}>
          <path d="M4 18c3-8 7-8 10-8s7 0 10 8" />
          <path d="M4 18h20M14 10v8" />
        </svg>
      );
    case "riverside":
      return (
        <svg {...common}>
          <path d="M14 4 24 14 14 24 4 14Z" />
        </svg>
      );
  }
}

function HotelItem({
  id,
  name,
  city,
}: {
  id: HotelCustomerId;
  name: string;
  city: string;
}) {
  return (
    <article className="flex items-center gap-3 pr-16">
      <HotelMark id={id} />
      <p>
        <span className="block text-sm font-medium tracking-tight text-white/90">{name}</span>
        <span className="block text-xs text-white/50">{city}</span>
      </p>
    </article>
  );
}

export function HotelProof() {
  const t = useTranslations("proof");
  const reduce = useReducedMotion();
  const items = HOTEL_CUSTOMERS.map((hotel) => (
    <HotelItem key={hotel.id} id={hotel.id} name={hotel.name} city={t(`cities.${hotel.id}`)} />
  ));

  return (
    <section aria-label={t("label")} className="border-y border-white/10 bg-black">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-8 lg:px-12">
        <p className="relative z-10 shrink-0 whitespace-nowrap text-[13px] leading-snug text-white/55">
          {t("title")}
        </p>
        {reduce ? (
          <div className="flex flex-wrap gap-x-8 gap-y-3">{items}</div>
        ) : (
          <div className="relative min-w-0 flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black to-transparent" />
            <div className="site-marquee-wrap overflow-hidden" data-lenis-prevent>
              <div className="site-marquee flex w-max items-center" style={{ animationDuration: "48s" }}>
                {[0, 1, 2].map((copy) => (
                  <div key={copy} className="flex items-center">
                    {HOTEL_CUSTOMERS.map((hotel) => (
                      <HotelItem
                        key={`${copy}-${hotel.id}`}
                        id={hotel.id}
                        name={hotel.name}
                        city={t(`cities.${hotel.id}`)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
