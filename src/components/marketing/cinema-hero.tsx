"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/brand-mark";
import { TvStage } from "@/components/marketing/tv-stage";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import { WELCOME_TEMPLATE_KEYS } from "@/lib/welcomeTemplates";

const rooms = ["1204", "0712", "1508", "0903", "1811", "2106"] as const;

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

  // The spotlight is a hover effect. On touch, pointermove keeps firing for the
  // whole duration of a scroll gesture, and each one repaints a full-viewport
  // mix-blend-soft-light layer — that is what makes the hero judder while
  // scrolling. Only fine pointers drive it, and off a native passive listener
  // so no React render happens per move.
  useEffect(() => {
    if (reduce) return;
    const section = root.current;
    if (!section) return;
    const host = section;
    function onMove(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      x.set(((event.clientX - rect.left) / rect.width) * 100);
      y.set(((event.clientY - rect.top) / rect.height) * 100);
    }
    section.addEventListener("pointermove", onMove, { passive: true });
    return () => section.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  // The auto-cycle re-mounts a full-viewport AnimatePresence every 5.2s, which
  // repaints whatever the user is currently scrolling past. So it runs only
  // once the visitor has actually touched the page.
  //
  // That gate is also what keeps LCP honest. Each cycle swaps the guest name,
  // and that name is the largest contentful element — an unattended swap records
  // a fresh LCP, which measured 5.4s instead of ~90ms on the built site. But a
  // scroll, wheel or tap finalises LCP in the browser, so from the first
  // interaction onward the turns are free. A visitor who never interacts is
  // exactly the case worth protecting, since that is what a crawler looks like.
  const held = useRef(false);
  const engaged = useRef(false);
  useEffect(() => {
    if (reduce || held.current) return;
    const timer = window.setInterval(() => {
      if (locked.current || document.hidden) return;
      if (!engaged.current) return;
      setIndex((current) => (current + 1) % WELCOME_TEMPLATE_KEYS.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reduce]);

  useEffect(() => {
    const host = root.current;
    if (!host || reduce) return;
    function onEngage() {
      engaged.current = true;
    }
    host.addEventListener("pointerdown", onEngage, { passive: true });
    host.addEventListener("wheel", onEngage, { passive: true });
    host.addEventListener("keydown", onEngage, { passive: true });
    return () => {
      host.removeEventListener("pointerdown", onEngage);
      host.removeEventListener("wheel", onEngage);
      host.removeEventListener("keydown", onEngage);
    };
  }, [reduce]);

  function pick(next: number) {
    locked.current = true;
    held.current = true;
    setIndex(next);
  }

  return (
    <section
      ref={root}
      id="join"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-black"
    >
      <h1 className="sr-only">{t("hero.srTitle")}</h1>
      <motion.div className="absolute inset-0" style={{ y: frameY, scale: frameScale }}>
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
        <div className="pointer-events-auto mx-auto grid max-w-[1400px] grid-cols-1 items-center justify-items-center gap-5 px-5 pb-7 text-center sm:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-end lg:gap-8 lg:px-12 lg:pb-10 lg:text-left">
          <p className="max-w-[24ch] font-heading text-2xl leading-tight font-medium tracking-tight sm:text-3xl lg:justify-self-start">
            {t("hero.headline")}
          </p>
          <BrandMark variant="onDark" className="opacity-90 lg:mb-1" />
          <div className="w-full max-w-lg lg:justify-self-end">
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
