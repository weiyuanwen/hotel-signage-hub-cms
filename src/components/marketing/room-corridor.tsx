"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { useTranslations } from "next-intl";
import { TvStage } from "@/components/marketing/tv-stage";
import { WELCOME_TEMPLATE_KEYS } from "@/lib/welcomeTemplates";

const rooms = ["1204", "0712", "1508", "0903", "1811", "2106"] as const;
const ease = [0.16, 1, 0.3, 1] as const;

// Dock-style magnification. A card's reach is a multiple of its own width so
// the effect survives the layout: cards are ~86vw on mobile and ~72vw on
// desktop, so a fixed pixel reach would only ever lift the card under the
// cursor and never let a neighbour rise. Falloff is quadratic, so neighbours
// come up gently instead of popping.
const REACH_RATIO = 1.1;
const MAX_LIFT = 0.2;
const GLIDE = 0.16;

export function RoomCorridor() {
  const t = useTranslations();
  const guests = t.raw("hero.guests") as string[];
  const reduce = useReducedMotion();
  const railRef = useRef<HTMLDivElement>(null);
  const scales = useRef<Array<MotionValue<number>>>([]);

  useEffect(() => {
    if (reduce) return;
    const rail = railRef.current;
    if (!rail) return;
    const host = rail;

    let frame = 0;
    let focus: number | null = null;
    let dirty = false;
    const glide = scales.current.map(() => 1);

    function paint() {
      frame = 0;
      // Read every rect first, then write every transform, so the loop never
      // interleaves reads and writes and forces a synchronous layout.
      const values = scales.current;
      const cards = Array.from(host.children) as HTMLElement[];
      const rects = cards.map((card) => card.getBoundingClientRect());
      const targets = rects.map((rect) => {
        if (focus === null) return 1;
        const reach = Math.max(1, rect.width) * REACH_RATIO;
        const distance = Math.abs(focus - (rect.left + rect.width / 2));
        return 1 + MAX_LIFT * Math.pow(Math.max(0, 1 - distance / reach), 2);
      });

      let settled = true;
      for (let i = 0; i < values.length; i++) {
        const target = targets[i] ?? 1;
        glide[i] += (target - glide[i]) * GLIDE;
        if (Math.abs(target - glide[i]) < 0.0005) glide[i] = target;
        else settled = false;
        values[i]?.set(glide[i]);
      }

      // Reschedule only while the lift is still travelling or the rail moved
      // under a stationary pointer. A hovering cursor alone must not hold a
      // 60fps loop open — that would reintroduce the judder we just removed.
      if (dirty || !settled) {
        dirty = false;
        schedule();
      }
    }

    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function onMove(event: PointerEvent) {
      // Touch pointers fire continuously through a whole scroll gesture, which
      // is exactly what we want: the lift tracks the finger.
      focus = event.clientX;
      schedule();
    }

    function onLeave() {
      focus = null;
      schedule();
    }

    function onScroll() {
      dirty = true;
      schedule();
    }

    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave, { passive: true });
    host.addEventListener("pointercancel", onLeave, { passive: true });
    host.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onLeave);
      host.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduce]);

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
        ref={railRef}
        className="site-corridor flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-8 sm:gap-4 sm:px-6 lg:px-10"
        data-lenis-prevent
      >
        {WELCOME_TEMPLATE_KEYS.map((template, index) => (
          <CorridorCard
            key={template}
            register={(value) => {
              scales.current[index] = value;
            }}
            delay={reduce ? 0 : index * 0.04}
            reduce={Boolean(reduce)}
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
          </CorridorCard>
        ))}
      </div>
    </section>
  );
}

function CorridorCard({
  children,
  delay,
  reduce,
  register,
}: {
  children: React.ReactNode;
  delay: number;
  reduce: boolean;
  register: (value: MotionValue<number>) => void;
}) {
  const scale = useMotionValue(1);
  register(scale);

  return (
    <motion.article
      className="relative h-full w-[86vw] shrink-0 snap-center overflow-hidden rounded-[28px] sm:w-[78vw] lg:w-[72vw]"
      initial={reduce ? false : { y: 32 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.7, ease, delay }}
      style={{ scale, transformOrigin: "50% 50%" }}
    >
      {children}
    </motion.article>
  );
}
