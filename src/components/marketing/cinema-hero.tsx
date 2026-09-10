"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { TvStage } from "@/components/marketing/tv-stage";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { WELCOME_TEMPLATE_KEYS } from "@/lib/welcomeTemplates";

const rooms = ["1204", "0712", "1508", "0903", "1811"] as const;

export function CinemaHero() {
  const t = useTranslations();
  const guests = t.raw("hero.guests") as string[];
  const reduce = useReducedMotion();
  const locked = useRef(false);
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const template = WELCOME_TEMPLATE_KEYS[index];

  const { scrollYProgress } = useScroll({
    target: root,
    offset: ["start start", "end start"],
  });
  const frameY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 140]);
  const frameScale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 1.16]);
  const dockY = useTransform(scrollYProgress, [0, 0.55], reduce ? [0, 0] : [0, 48]);
  const dockFade = useTransform(scrollYProgress, [0, 0.4], reduce ? [1, 1] : [1, 0]);

  const x = useMotionValue(72);
  const y = useMotionValue(38);
  const spotlight = useMotionTemplate`radial-gradient(46vw circle at ${x}% ${y}%, rgb(255 255 255 / 0.16), transparent 58%)`;

  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => {
      if (locked.current) return;
      setIndex((current) => (current + 1) % WELCOME_TEMPLATE_KEYS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  function pick(next: number) {
    locked.current = true;
    setIndex(next);
  }

  return (
    <section
      ref={root}
      id="join"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-black"
      onPointerMove={(event) => {
        if (reduce) return;
        const rect = event.currentTarget.getBoundingClientRect();
        x.set(((event.clientX - rect.left) / rect.width) * 100);
        y.set(((event.clientY - rect.top) / rect.height) * 100);
      }}
    >
      <h1 className="sr-only">{t("hero.srTitle")}</h1>
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: frameY, scale: frameScale }}>
        <TvStage
          fill
          bare
          live
          showFooter={false}
          tone="cinema"
          template={template}
          guest={guests[index]}
          hotel="Saigon Pearl"
          wifi="SaigonPearl-Guest"
          room={rooms[index]}
        />
      </motion.div>
      {reduce ? null : (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: spotlight }}
        />
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent pt-40"
        style={{ y: dockY, opacity: dockFade }}
      >
        <div className="pointer-events-auto mx-auto flex max-w-[1400px] flex-col gap-5 px-5 pb-7 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:pb-10">
          <div>
            <p className="text-[13px] font-medium tracking-[0.18em] text-white/70 uppercase">Signage Desk</p>
            <p className="mt-2 max-w-[24ch] font-heading text-2xl leading-tight font-medium tracking-tight sm:text-3xl">
              {t("hero.headline")}
            </p>
          </div>
          <div className="w-full max-w-lg">
            <WaitlistForm />
          </div>
        </div>
      </motion.div>
      <div className="absolute top-1/2 right-4 hidden -translate-y-1/2 flex-col gap-2 lg:flex">
        {WELCOME_TEMPLATE_KEYS.map((key, i) => (
          <button
            key={key}
            type="button"
            onClick={() => pick(i)}
            aria-label={t(`templates.${key}`)}
            aria-pressed={index === i}
            className={`h-8 w-1.5 rounded-full transition-colors duration-300 ${
              index === i ? "bg-[var(--ivory)]" : "bg-white/35 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
