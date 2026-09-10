"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Sparkle, WifiHigh } from "@phosphor-icons/react";
import {
  FONT_FAMILY,
  TONE_FILTER,
  TONE_OVERLAY,
  cqw,
  type SlotKey,
  type WelcomeLayout,
} from "@/lib/welcomeLayout";

export type WelcomeCanvasProps = {
  layout: WelcomeLayout;
  backgroundUrl: string;
  logoUrl?: string | null;
  hotelName: string;
  guestName: string;
  message?: string | null;
  roomCode: string;
  wifi?: { ssid: string; password: string | null } | null;
  timeZone?: string;
  locale?: "vi" | "en";
  interactive?: boolean;
  compact?: boolean;
  wifiPasswordLabel?: string;
  onSlotChange?: (key: SlotKey, next: { x: number; y: number }) => void;
};

export function WelcomeCanvas({
  layout,
  backgroundUrl,
  logoUrl,
  hotelName,
  guestName,
  message,
  roomCode,
  wifi,
  timeZone = "Asia/Ho_Chi_Minh",
  locale = "vi",
  interactive = false,
  compact = false,
  wifiPasswordLabel = "Mật khẩu",
  onSlotChange,
}: WelcomeCanvasProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ key: SlotKey; ox: number; oy: number } | null>(null);

  function clientToPercent(event: ReactPointerEvent<HTMLElement>) {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return {
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    };
  }

  function onPointerDown(key: SlotKey, event: ReactPointerEvent<HTMLElement>) {
    if (!interactive) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = clientToPercent(event);
    const slot = layout.slots[key];
    drag.current = { key, ox: point.x - slot.x, oy: point.y - slot.y };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!drag.current || !onSlotChange) return;
    const point = clientToPercent(event);
    onSlotChange(drag.current.key, {
      x: point.x - drag.current.ox,
      y: point.y - drag.current.oy,
    });
  }

  function onPointerUp() {
    drag.current = null;
  }

  const font = FONT_FAMILY[layout.font];
  const name = guestName.trim().toLocaleUpperCase(locale === "en" ? "en-US" : "vi-VN");
  const greet = locale === "en" ? "WELCOME" : "CHÀO MỪNG";

  return (
    <div
      ref={stageRef}
      className={`welcome-stage relative overflow-hidden bg-black ${interactive ? "touch-none" : ""}`}
      style={{ aspectRatio: "16 / 9", fontFamily: font }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <img
        src={backgroundUrl}
        alt=""
        className="absolute inset-0 size-full object-cover"
        style={{ filter: TONE_FILTER[layout.tone] }}
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: TONE_OVERLAY[layout.tone] }} />
      <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black/45 to-transparent" />

      <div className={`absolute inset-0 ${compact ? "p-[3%]" : "p-[4.2%]"}`}>
        <div className="flex items-start justify-between">
          <StageClock timeZone={timeZone} locale={locale} compact={compact} />
          {!compact ? <span className="text-[1.6cqw] font-medium tracking-wide text-white/70">{hotelName}</span> : null}
        </div>
      </div>

      {layout.slots.logo.visible !== false ? (
        <Slot
          slotKey="logo"
          x={layout.slots.logo.x}
          y={layout.slots.logo.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="" className="h-[11cqh] w-auto max-w-[28cqw] object-contain" draggable={false} />
          ) : (
            <Sparkle size={28} weight="fill" className="size-[4cqw] text-white" />
          )}
        </Slot>
      ) : null}

      <Slot
        slotKey="name"
        x={layout.slots.name.x}
        y={layout.slots.name.y}
        interactive={interactive}
        onPointerDown={onPointerDown}
        className="max-w-[70%]"
      >
        <p
          className="leading-[1.08] font-medium tracking-[-0.03em] uppercase"
          style={{ color: layout.colors.name, fontSize: cqw(layout.sizes.name) }}
        >
          {greet} {name}
        </p>
      </Slot>

      {layout.slots.slogan.visible !== false && (layout.slogan.trim() || interactive) ? (
        <Slot
          slotKey="slogan"
          x={layout.slots.slogan.x}
          y={layout.slots.slogan.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
          className={`max-w-[62%] ${layout.slogan.trim() ? "" : "opacity-50"}`}
        >
          <p className="leading-snug" style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.slogan) }}>
            {layout.slogan.trim() || "Slogan trên mẫu"}
          </p>
        </Slot>
      ) : null}

      {layout.slots.message.visible !== false && message?.trim() ? (
        <Slot
          slotKey="message"
          x={layout.slots.message.x}
          y={layout.slots.message.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
          className="max-w-[58%]"
        >
          <p className="leading-relaxed" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.message) }}>
            {message}
          </p>
        </Slot>
      ) : interactive && layout.slots.message.visible !== false ? (
        <Slot
          slotKey="message"
          x={layout.slots.message.x}
          y={layout.slots.message.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
          className="max-w-[58%] opacity-50"
        >
          <p className="leading-relaxed" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.message) }}>
            Thông điệp lúc nhận phòng
          </p>
        </Slot>
      ) : null}

      <Slot
        slotKey="room"
        x={layout.slots.room.x}
        y={layout.slots.room.y}
        interactive={interactive}
        onPointerDown={onPointerDown}
      >
        <p className="tracking-[0.16em] uppercase" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.room) }}>
          {roomCode}
        </p>
      </Slot>

      {wifi?.ssid ? (
        <div className="absolute bottom-[4.2%] left-[4.2%] flex max-w-[42%] items-start gap-[0.7cqw] text-white">
          <WifiHigh size={22} weight="regular" className="mt-[0.2cqw] size-[2cqw] shrink-0 text-white/90" />
          <div className="min-w-0">
            <p className="truncate text-[1.45cqw] font-medium tracking-wide">{wifi.ssid}</p>
            {wifi.password ? (
              <p className="mt-[0.2cqw] text-[1.2cqw] text-white/80">
                <span className="text-white/55">{wifiPasswordLabel}</span>
                <span className="ml-[0.5cqw] tabular-nums tracking-[0.06em]">{wifi.password}</span>
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Slot({
  slotKey,
  x,
  y,
  interactive,
  onPointerDown,
  className = "",
  children,
}: {
  slotKey: SlotKey;
  x: number;
  y: number;
  interactive: boolean;
  onPointerDown: (key: SlotKey, event: ReactPointerEvent<HTMLElement>) => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`absolute ${interactive ? "cursor-grab rounded-sm outline outline-transparent hover:outline-white/40 active:cursor-grabbing" : ""} ${className}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onPointerDown={(event) => onPointerDown(slotKey, event)}
    >
      {children}
    </div>
  );
}

function StageClock({ timeZone, locale, compact }: { timeZone: string; locale: "vi" | "en"; compact: boolean }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const intl = locale === "en" ? "en-GB" : "vi-VN";
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(now);
  if (compact) {
    return <p className="text-[2.4cqw] font-medium tabular-nums text-white">{time}</p>;
  }
  const weekday = new Intl.DateTimeFormat(intl, { weekday: "long", timeZone }).format(now);
  const date = new Intl.DateTimeFormat(intl, {
    day: "2-digit",
    month: locale === "en" ? "short" : "2-digit",
    year: "numeric",
    timeZone,
  }).format(now);
  return (
    <div className="text-white">
      <p className="text-[3.4cqw] leading-none font-medium tabular-nums tracking-tight">{time}</p>
      <p className="mt-[0.6cqw] text-[1.15cqw] font-medium capitalize text-white/85">
        {locale === "vi" ? weekday.charAt(0).toLocaleUpperCase("vi-VN") + weekday.slice(1) : weekday}
      </p>
      <p className="text-[1.15cqw] text-white/70">{date}</p>
    </div>
  );
}
