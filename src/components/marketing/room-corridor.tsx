"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { TvStage } from "@/components/marketing/tv-stage";
import { WELCOME_TEMPLATE_KEYS } from "@/lib/welcomeTemplates";

const rooms = ["1204", "0712", "1508", "0903", "1811", "2106"] as const;
const ease = [0.16, 1, 0.3, 1] as const;

export function RoomCorridor() {
  const t = useTranslations();
  const guests = t.raw("hero.guests") as string[];
  const reduce = useReducedMotion();

  return (
    <section id="gallery" className="flex h-[100dvh] flex-col bg-black">
      <motion.div
        className="shrink-0 px-5 pt-24 pb-4 sm:px-8 lg:px-12"
        initial={reduce ? false : { y: 28 }}
        whileInView={{ y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease }}
      >
        <h2 className="max-w-[16ch] font-heading text-3xl leading-[1.15] font-medium tracking-tight sm:text-4xl">
          {t("gallery.title")}
        </h2>
        <p className="mt-2 max-w-[48ch] text-sm text-white/65">{t("gallery.body")}</p>
      </motion.div>
      <div
        className="site-corridor flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-8 sm:gap-4 sm:px-6 lg:px-10"
        data-lenis-prevent
      >
        {WELCOME_TEMPLATE_KEYS.map((template, index) => (
          <motion.article
            key={template}
            className="relative h-full w-[86vw] shrink-0 snap-center overflow-hidden rounded-[28px] sm:w-[78vw] lg:w-[72vw]"
            initial={reduce ? false : { y: 32 }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease, delay: reduce ? 0 : index * 0.04 }}
          >
            <TvStage
              fill
              bare
              live
              tone="cinema"
              template={template}
              guest={guests[index]}
              hotel="Saigon Pearl"
              wifi="SaigonPearl-Guest"
              room={rooms[index]}
            />
            <p className="pointer-events-none absolute top-6 right-6 text-sm tracking-[0.16em] text-white/70 uppercase">
              {t(`templates.${template}`)}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
