"use client";

import Image from "next/image";
import { WifiHigh } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { LiveClock } from "@/components/marketing/live-clock";
import { useTranslations } from "next-intl";
import { TV_OVERLAY, templateScenes } from "@/lib/marketing";
import { type WelcomeTemplateKey } from "@/lib/welcomeTemplates";

type Props = {
  template?: WelcomeTemplateKey;
  photo?: string;
  guest: string;
  room: string;
  hotel: string;
  wifi: string;
  fill?: boolean;
  bare?: boolean;
  compact?: boolean;
  live?: boolean;
  tone?: "stage" | "cinema";
  showFooter?: boolean;
  className?: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function TvStage({
  template = "dusk",
  photo,
  guest,
  room,
  hotel,
  wifi,
  fill = false,
  bare = false,
  compact = false,
  live = false,
  tone = "stage",
  showFooter = true,
  className = "",
}: Props) {
  const t = useTranslations("templates");
  const reduce = useReducedMotion();
  const overlay = TV_OVERLAY[template] ?? TV_OVERLAY.dusk;
  const src = photo ?? templateScenes[template];
  const chrome = !fill && !bare;

  return (
    <div
      className={`${fill ? "absolute inset-0" : "relative aspect-video"} overflow-hidden ${
        chrome ? "rounded-sm shadow-[0_30px_80px_rgb(0_0_0/0.45)] ring-1 ring-white/20" : ""
      } ${className}`}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${template}-${src}`}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.55, ease }}
        >
          <Image src={src} alt="" fill sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0" style={{ background: overlay }} />
        </motion.div>
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {compact ? null : (
          <motion.div
            key={`${template}-${guest}-copy`}
            className={`absolute inset-0 flex flex-col justify-between text-white ${
              tone === "cinema" ? "p-[6.5%] md:p-[7%]" : "p-[5.5%]"
            }`}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.4, ease, delay: reduce ? 0 : 0.08 }}
          >
            <header
              className={`flex items-start justify-between text-white/90 ${
                tone === "cinema"
                  ? "text-[clamp(0.85rem,1.6vw,1.15rem)]"
                  : "text-[clamp(0.7rem,1.5vw,0.95rem)]"
              }`}
            >
              {live ? <LiveClock /> : <span>19:42</span>}
              <span>28°</span>
            </header>
            <div className="min-w-0">
              <p
                className={`text-white/90 ${
                  tone === "cinema"
                    ? "text-[clamp(0.85rem,1.5vw,1.15rem)]"
                    : "text-[clamp(0.7rem,1.3vw,0.95rem)]"
                }`}
              >
                {hotel}
              </p>
              <p
                className={`mt-1 font-heading leading-[1.1] font-medium tracking-tight text-white text-wrap-balance drop-shadow-[0_2px_18px_rgb(0_0_0/0.55)] ${
                  tone === "cinema"
                    ? "max-w-[14ch] text-[clamp(2.1rem,6.4vw,5.6rem)]"
                    : "text-[clamp(1.35rem,3.4vw,2.75rem)]"
                }`}
              >
                {guest}
              </p>
                <p className="mt-2 text-[clamp(0.65rem,1.1vw,0.8rem)] text-white/85">{t(template)}</p>
            </div>
            {showFooter ? (
              <footer
                className={`flex items-end justify-between gap-3 text-white/90 ${
                  tone === "cinema"
                    ? "text-[clamp(0.8rem,1.4vw,1.05rem)]"
                    : "text-[clamp(0.65rem,1.2vw,0.85rem)]"
                }`}
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <WifiHigh className="size-[1em] shrink-0" />
                  <span className="truncate">{wifi}</span>
                </span>
                <span className="shrink-0 tracking-[0.14em] uppercase opacity-70">{room}</span>
              </footer>
            ) : (
              <span />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
