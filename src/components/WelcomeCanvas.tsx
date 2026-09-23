"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { Eye, EyeSlash, Sparkle, WifiHigh } from "@phosphor-icons/react";
import {
  FONT_FAMILY,
  SPLIT_PANEL,
  TONE_FILTER,
  TONE_OVERLAY,
  cqh,
  cqw,
  isSplitLayout,
  type SlotKey,
  type WelcomeLayout,
} from "@/lib/welcomeLayout";

export type WelcomeCanvasProps = {
  layout: WelcomeLayout;
  backgroundUrl: string;
  logoUrl?: string | null;
  hotelName: string;
  guestName: string;
  roomCode: string;
  wifi?: { ssid: string; password: string | null } | null;
  timeZone?: string;
  locale?: "vi" | "en";
  interactive?: boolean;
  compact?: boolean;
  wifiPasswordLabel?: string;
  onSlotChange?: (key: SlotKey, next: { x: number; y: number }) => void;
  onCopyVisibleChange?: (visible: boolean) => void;
};

export function WelcomeCanvas({
  layout,
  backgroundUrl,
  logoUrl,
  guestName,
  roomCode,
  wifi,
  timeZone = "Asia/Ho_Chi_Minh",
  locale = "vi",
  interactive = false,
  compact = false,
  wifiPasswordLabel = "Mật khẩu",
  onSlotChange,
  onCopyVisibleChange,
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
  const split = isSplitLayout(layout);
  const name = split
    ? guestName.trim()
    : guestName.trim().toLocaleUpperCase(locale === "en" ? "en-US" : "vi-VN");
  const greet = split
    ? locale === "en"
      ? "Welcome,"
      : "Chào mừng,"
    : locale === "en"
      ? "WELCOME"
      : "CHÀO MỪNG";
  const lead = layout.lead.trim();
  const wish = layout.wish.trim();
  const copyVisible = layout.slots.message.visible !== false;
  const showCopySlot = copyVisible
    ? Boolean(lead || wish) || interactive
    : Boolean(interactive && onCopyVisibleChange);

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
        className={`absolute object-cover ${split ? "inset-y-0 right-0" : "inset-0 size-full"}`}
        style={{
          filter: TONE_FILTER[layout.tone],
          ...(split ? { left: `${SPLIT_PANEL.width}%`, width: `${100 - SPLIT_PANEL.width}%` } : {}),
        }}
        draggable={false}
      />
      {split ? (
        <>
          <div className="absolute inset-y-0 left-0" style={{ width: `${SPLIT_PANEL.width}%`, background: SPLIT_PANEL.color }} />
          <div className="absolute inset-y-0" style={{ left: `${SPLIT_PANEL.width}%`, width: 1, background: SPLIT_PANEL.edge }} />
          <div
            className="absolute inset-y-0 right-0"
            style={{ width: `${100 - SPLIT_PANEL.width}%`, background: "rgb(8 10 12 / 0.14)" }}
          />
        </>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: TONE_OVERLAY[layout.tone] }} />
          <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-black/45 to-transparent" />
        </>
      )}

      {split ? (
        <div className={`absolute right-[4.2%] flex items-start gap-[1.6cqw] drop-shadow-[0_1px_10px_rgb(0_0_0/0.45)] ${compact ? "top-[3%]" : "top-[4.2%]"}`}>
          {!compact ? (
            <p className="font-medium tabular-nums tracking-tight text-white" style={{ fontSize: cqw(layout.sizes.weather) }}>
              28°C
            </p>
          ) : null}
          <StageClock
            timeZone={timeZone}
            locale={locale}
            compact={compact}
            timeSize={layout.sizes.time}
            dateSize={layout.sizes.clock}
          />
        </div>
      ) : (
        <div className={`absolute inset-0 ${compact ? "p-[3%]" : "p-[4.2%]"}`}>
          <div className="flex items-start justify-between">
            <StageClock
              timeZone={timeZone}
              locale={locale}
              compact={compact}
              timeSize={layout.sizes.time}
              dateSize={layout.sizes.clock}
            />
            {!compact ? (
              <p className="font-medium tabular-nums tracking-tight text-white" style={{ fontSize: cqw(layout.sizes.weather) }}>
                28°C
              </p>
            ) : null}
          </div>
        </div>
      )}

      {layout.slots.logo.visible !== false ? (
        <Slot
          slotKey="logo"
          x={layout.slots.logo.x}
          y={layout.slots.logo.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt=""
              className="w-auto object-contain"
              style={{ height: cqh(layout.sizes.logo), maxWidth: cqw(layout.sizes.logo * 2.55) }}
              draggable={false}
            />
          ) : (
            <Sparkle size={28} weight="fill" className="text-white" style={{ width: cqh(layout.sizes.logo * 0.36), height: cqh(layout.sizes.logo * 0.36) }} />
          )}
        </Slot>
      ) : null}

      <Slot
        slotKey="name"
        x={layout.slots.name.x}
        y={layout.slots.name.y}
        interactive={interactive}
        onPointerDown={onPointerDown}
        className={split ? "max-w-[34%]" : "max-w-[70%]"}
      >
        {split ? (
          <p className="leading-[1.12] font-medium">
            <span
              className="block italic font-normal"
              style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.name * 0.78) }}
            >
              {greet}
            </span>
            <span className="mt-[0.06em] block italic" style={{ color: layout.colors.name, fontSize: cqw(layout.sizes.name) }}>
              {name}
            </span>
          </p>
        ) : (
          <p
            className="leading-[1.08] font-medium tracking-[-0.03em] uppercase"
            style={{ color: layout.colors.name, fontSize: cqw(layout.sizes.name) }}
          >
            {greet} {name}
          </p>
        )}
      </Slot>

      {layout.slots.slogan.visible !== false && (layout.slogan.trim() || interactive) ? (
        <Slot
          slotKey="slogan"
          x={layout.slots.slogan.x}
          y={layout.slots.slogan.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
          className={`${split ? "max-w-[32%]" : "max-w-[62%]"} ${layout.slogan.trim() ? "" : "opacity-50"}`}
        >
          <p className={`leading-snug ${split ? "italic" : ""}`} style={{ color: layout.colors.slogan, fontSize: cqw(layout.sizes.slogan) }}>
            {layout.slogan.trim() || "Slogan trên mẫu"}
          </p>
        </Slot>
      ) : null}

      {showCopySlot ? (
        <Slot
          slotKey="message"
          x={layout.slots.message.x}
          y={layout.slots.message.y}
          interactive={interactive}
          onPointerDown={onPointerDown}
          className={`${split ? "max-w-[32%]" : "max-w-[58%]"} ${copyVisible && (lead || wish) ? "" : "opacity-50"}`}
        >
          <div className="relative pr-[2.4cqw]">
            <p className="leading-relaxed" style={{ color: layout.colors.muted, fontSize: cqw(layout.sizes.message) }}>
              {copyVisible && lead ? <span className="block">{lead}</span> : null}
              {copyVisible && wish ? <span className={`block ${lead ? "mt-[0.4cqw]" : ""}`}>{wish}</span> : null}
              {copyVisible && !lead && !wish ? (
                <span className="block">{locale === "en" ? "Welcome, dear guest" : "Chào mừng quý khách"}</span>
              ) : null}
              {!copyVisible ? <span className="block">{locale === "en" ? "Hidden" : "Đã ẩn"}</span> : null}
            </p>
            {interactive && onCopyVisibleChange ? (
              <button
                type="button"
                aria-label={copyVisible ? (locale === "en" ? "Hide welcome lines" : "Ẩn dòng chào và lời chúc") : locale === "en" ? "Show welcome lines" : "Hiện dòng chào và lời chúc"}
                className="absolute -right-[0.2cqw] top-0 rounded-full bg-black/35 p-[0.35cqw] text-white/90 hover:bg-black/55"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => onCopyVisibleChange(!copyVisible)}
              >
                {copyVisible ? <EyeSlash size={18} weight="regular" className="size-[1.6cqw]" /> : <Eye size={18} weight="regular" className="size-[1.6cqw]" />}
              </button>
            ) : null}
          </div>
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
        <div
          className="absolute bottom-[4.2%] flex max-w-[42%] items-start gap-[0.7cqw] text-white drop-shadow-[0_1px_8px_rgb(0_0_0/0.45)]"
          style={{ left: `${split ? SPLIT_PANEL.width + 2.4 : 4.2}%` }}
        >
          <WifiHigh
            size={22}
            weight="regular"
            className="mt-[0.2cqw] shrink-0 text-white/90"
            style={{ width: cqw(layout.sizes.wifi * 1.38), height: cqw(layout.sizes.wifi * 1.38) }}
          />
          <div className="min-w-0">
            <p className="truncate font-medium tracking-wide" style={{ fontSize: cqw(layout.sizes.wifi) }}>
              {wifi.ssid}
            </p>
            {wifi.password ? (
              <p className="mt-[0.2cqw] text-white/80" style={{ fontSize: cqw(layout.sizes.wifiPassword) }}>
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

function StageClock({
  timeZone,
  locale,
  compact,
  timeSize,
  dateSize,
}: {
  timeZone: string;
  locale: "vi" | "en";
  compact: boolean;
  timeSize: number;
  dateSize: number;
}) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const intl = locale === "en" ? "en-GB" : "vi-VN";
  const time = new Intl.DateTimeFormat(intl, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(now);
  if (compact) {
    return (
      <p className="font-medium tabular-nums text-white" style={{ fontSize: cqw(Math.max(1.6, timeSize * 0.7)) }}>
        {time}
      </p>
    );
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
      <p className="leading-none font-medium tabular-nums tracking-tight" style={{ fontSize: cqw(timeSize) }}>
        {time}
      </p>
      <p className="mt-[0.6cqw] font-medium capitalize text-white/85" style={{ fontSize: cqw(dateSize) }}>
        {locale === "vi" ? weekday.charAt(0).toLocaleUpperCase("vi-VN") + weekday.slice(1) : weekday}
      </p>
      <p className="text-white/70" style={{ fontSize: cqw(dateSize) }}>
        {date}
      </p>
    </div>
  );
}
