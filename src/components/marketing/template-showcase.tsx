"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { TvStage } from "@/components/marketing/tv-stage";
import { photos } from "@/lib/marketing";
import { BUILTIN_LABELS, WELCOME_TEMPLATE_KEYS, type WelcomeTemplateKey } from "@/lib/welcomeTemplates";
import { TemplateThumb } from "@/components/TemplateThumb";

export function TemplateShowcase() {
  const reduce = useReducedMotion();
  const [key, setKey] = useState<WelcomeTemplateKey>("dusk");

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      setKey((current) => {
        const i = WELCOME_TEMPLATE_KEYS.indexOf(current);
        return WELCOME_TEMPLATE_KEYS[(i + 1) % WELCOME_TEMPLATE_KEYS.length];
      });
    }, 4200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  return (
    <div>
      <TvStage
        template={key}
        photo={photos.room}
        guest="Chào mừng, chị Lan."
        hotel="Saigon Pearl"
        wifi="SaigonPearl-Guest"
        room="1204"
      />
      <div className="mt-5 grid grid-cols-5 gap-2 sm:gap-3">
        {WELCOME_TEMPLATE_KEYS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setKey(item)}
            className={`text-left ${key === item ? "opacity-100" : "opacity-55 hover:opacity-90"}`}
            aria-pressed={key === item}
            aria-label={BUILTIN_LABELS[item]}
          >
            <TemplateThumb templateKey={item} selected={key === item} className="w-full" />
            <span className="mt-1.5 hidden text-[11px] text-white/70 sm:block">{BUILTIN_LABELS[item]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
