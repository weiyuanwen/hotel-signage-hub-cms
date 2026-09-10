"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { TvStage } from "@/components/marketing/tv-stage";
import { BUILTIN_LABELS, WELCOME_TEMPLATE_KEYS, type WelcomeTemplateKey } from "@/lib/welcomeTemplates";

export function TemplateAccordion() {
  const reduce = useReducedMotion();
  const [key, setKey] = useState<WelcomeTemplateKey>("dusk");

  if (reduce) {
    return (
      <div className="grid gap-4">
        <TvStage
          template={key}
          guest="Chào mừng, chị Lan."
          hotel="Saigon Pearl"
          wifi="SaigonPearl-Guest"
          room="1204"
        />
        <div className="flex flex-wrap gap-2">
          {WELCOME_TEMPLATE_KEYS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKey(item)}
              aria-pressed={key === item}
              className={`rounded-full px-3 py-1.5 text-sm ${
                key === item ? "bg-[var(--ivory)] text-[var(--night)]" : "bg-white/10 text-white/80"
              }`}
            >
              {BUILTIN_LABELS[item]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden h-[min(62vh,680px)] gap-2 md:flex">
        {WELCOME_TEMPLATE_KEYS.map((item) => {
          const active = key === item;
          return (
            <motion.button
              key={item}
              type="button"
              onClick={() => setKey(item)}
              onMouseEnter={() => setKey(item)}
              aria-pressed={active}
              aria-label={BUILTIN_LABELS[item]}
              initial={false}
              animate={{ flexGrow: active ? 3.15 : 0.68 }}
              transition={{ type: "spring", stiffness: 260, damping: 34, mass: 0.72 }}
              style={{ flexBasis: 0 }}
              className="relative min-w-0 overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-[var(--ivory)] focus-visible:outline-none"
            >
              <TvStage
                fill
                bare
                compact={!active}
                template={item}
                guest="Chào mừng, chị Lan."
                hotel="Saigon Pearl"
                wifi="SaigonPearl-Guest"
                room="1204"
              />
              <motion.span
                className="absolute bottom-4 left-4 font-heading text-lg font-medium text-white"
                initial={false}
                animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {BUILTIN_LABELS[item]}
              </motion.span>
            </motion.button>
          );
        })}
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:hidden">
        {WELCOME_TEMPLATE_KEYS.map((item) => (
          <div key={item} className="w-[86vw] shrink-0 snap-center">
            <TvStage
              template={item}
              guest="Chào mừng, chị Lan."
              hotel="Saigon Pearl"
              wifi="SaigonPearl-Guest"
              room="1204"
            />
            <p className="mt-2 text-sm text-white/70">{BUILTIN_LABELS[item]}</p>
          </div>
        ))}
      </div>
    </>
  );
}
