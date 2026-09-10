"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TemplateThumb } from "@/components/TemplateThumb";
import { TvFrame } from "@/components/marketing/tv-frame";
import { TvStage } from "@/components/marketing/tv-stage";
import { BUILTIN_LABELS, WELCOME_TEMPLATE_KEYS, type WelcomeTemplateKey } from "@/lib/welcomeTemplates";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroProduct() {
  const reduce = useReducedMotion();
  const [key, setKey] = useState<WelcomeTemplateKey>("dusk");

  return (
    <motion.div
      className="relative pb-7"
      initial={reduce ? false : { y: 16 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.75, ease, delay: 0.12 }}
    >
      <TvFrame>
        <TvStage
          template={key}
          bare
          guest="Chào mừng, chị Lan."
          hotel="Saigon Pearl"
          wifi="SaigonPearl-Guest"
          room="1204"
        />
      </TvFrame>
      <div
        className="absolute inset-x-3 -bottom-1 flex flex-col gap-3 rounded-2xl px-4 py-3 shadow-[0_18px_40px_rgb(0_0_0/0.28)] backdrop-blur-md sm:inset-x-5 sm:flex-row sm:items-center sm:justify-between"
        style={{ background: "color-mix(in oklab, var(--ivory) 92%, transparent)", color: "var(--night)" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] tracking-[0.12em] uppercase opacity-55">Phòng 1204</p>
          <p className="truncate font-heading text-lg font-medium leading-tight">Lan Nguyễn</p>
        </div>
        <div className="flex gap-1.5">
          {WELCOME_TEMPLATE_KEYS.map((item) => (
            <motion.button
              key={item}
              type="button"
              onClick={() => setKey(item)}
              whileHover={reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              transition={{ duration: 0.2, ease }}
              className={`w-9 overflow-hidden rounded-[8px] sm:w-11 ${
                key === item ? "ring-2 ring-[var(--night)]" : "opacity-70 hover:opacity-100"
              }`}
              aria-pressed={key === item}
              aria-label={BUILTIN_LABELS[item]}
            >
              <TemplateThumb templateKey={item} selected={false} className="w-full" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
