"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Device, DeviceScreen } from "@/lib/api";
import { WelcomeCanvas } from "@/components/WelcomeCanvas";
import { DeskPager } from "@/components/desk/ui";
import { useDeskLocale } from "@/components/desk/desk-i18n";
import { embedSrc, parseVideoUrl } from "@/lib/videoSource";
import { normalizeLayout, resolveBackgroundUrl } from "@/lib/welcomeLayout";

const FALLBACK_GROUNDS =
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=960&q=60";

const OVERLAY: Record<string, string> = {
  dusk: "rgb(18 10 4 / 0.38)",
  linen: "rgb(8 10 14 / 0.34)",
  harbor: "rgb(4 12 22 / 0.4)",
  garden: "rgb(6 14 10 / 0.38)",
  stone: "rgb(16 12 8 / 0.36)",
  vista: "rgb(22 18 14 / 0.28)",
};

const PAGE_SIZE = 8;

type Props = {
  devices: Device[] | null;
  onSelect: (device: Device) => void;
};

export function DeviceStrip({ devices, onSelect }: Props) {
  const t = useTranslations("desk");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const tvs = useMemo(
    () => (devices ?? []).filter((device) => device.status === "paired" && device.screen),
    [devices],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("vi-VN");
    if (!q) return tvs;
    return tvs.filter((device) => {
      const hay = [device.room_code, device.room_name, device.name, device.screen?.guest?.display_name, device.screen?.room.code]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi-VN");
      return hay.includes(q);
    });
  }, [tvs, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const lite = tvs.length > 8;

  useEffect(() => {
    setPage(1);
  }, [query, tvs.length]);

  if (devices === null) {
    return (
      <div className="mb-3 flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 w-44 shrink-0 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    );
  }

  if (tvs.length === 0) {
    return (
      <p className="mb-3 rounded-2xl border border-dashed border-line bg-surface/70 px-4 py-5 text-sm text-muted">
        {t("strip.empty")}
      </p>
    );
  }

  return (
    <section className="mb-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium">{t("strip.title")}</h2>
          <p className="mt-0.5 text-xs text-muted">
            {t("strip.count", { count: filtered.length })}
            {filtered.length !== tvs.length ? ` / ${tvs.length}` : ""}
            {" · "}
            {t("strip.body")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tvs.length > 8 ? (
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="desk-field !max-w-[12rem] !py-1 text-xs"
              placeholder={t("strip.search")}
            />
          ) : null}
          <DeskPager page={safePage} pageCount={pageCount} onPage={setPage} />
        </div>
      </div>
      <div className={`mt-2 grid gap-2 ${lite ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"}`}>
        {slice.map((device) => (
          <TvCard key={device.id} device={device} onSelect={onSelect} lite={lite} />
        ))}
      </div>
    </section>
  );
}

function TvCard({ device, onSelect, lite }: { device: Device; onSelect: (device: Device) => void; lite: boolean }) {
  const t = useTranslations("desk");
  const { locale } = useDeskLocale();
  const screen = device.screen;
  if (!screen) return null;
  const look =
    !lite &&
    Boolean(screen.guest) &&
    screen.template?.mode !== "video" &&
    screen.media.kind !== "video" &&
    Boolean(screen.template?.layout);

  return (
    <article>
      <button
        type="button"
        onClick={() => onSelect(device)}
        className="block w-full overflow-hidden rounded-xl border border-line bg-black text-left transition-transform duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-[1.04] active:scale-[0.99]"
      >
        <div className="relative aspect-video overflow-hidden">
          {look ? (
            <WelcomeCanvas
              layout={normalizeLayout(screen.template?.layout, screen.template?.key ?? "dusk")}
              backgroundUrl={resolveBackgroundUrl(
                normalizeLayout(screen.template?.layout, screen.template?.key ?? "dusk"),
                screen.media.background_url,
              )}
              logoUrl={screen.hotel.logo_url}
              hotelName={screen.hotel.name}
              guestName={screen.guest?.display_name ?? ""}
              roomCode={screen.room.code}
              wifi={screen.hotel.wifi}
              compact
            />
          ) : (
            <>
              <TvBackdrop screen={screen} />
              <div className="absolute inset-0 bg-black/30" />
              <div
                className="absolute inset-0"
                style={{ background: OVERLAY[screen.template?.key ?? "dusk"] ?? OVERLAY.dusk }}
              />
              <div className="relative flex h-full flex-col justify-between p-2 text-white">
                <div className="flex items-start justify-between gap-1">
                  <p className="truncate text-[10px] font-medium tracking-wide text-white/80">{screen.room.code}</p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] ${
                      device.online ? "bg-ok/90 text-white" : "bg-white/20 text-white/80"
                    }`}
                  >
                    {device.online ? t("devices.online") : t("devices.offline")}
                  </span>
                </div>
                <p className="text-center text-[0.8rem] font-medium leading-tight tracking-[-0.03em] text-balance uppercase">
                  {screen.guest?.display_name
                    ? t("strip.welcomeGuest", {
                        name: screen.guest.display_name.toLocaleUpperCase(locale === "en" ? "en-US" : "vi-VN"),
                      })
                    : t("strip.welcomeHotel", {
                        hotel: screen.hotel.name.toLocaleUpperCase(locale === "en" ? "en-US" : "vi-VN"),
                      })}
                </p>
              </div>
            </>
          )}
          {look ? (
            <span
              className={`absolute top-2 right-2 z-10 rounded-full px-1.5 py-0.5 text-[10px] ${
                device.online ? "bg-ok/90 text-white" : "bg-white/20 text-white/80"
              }`}
            >
              {device.online ? t("devices.online") : t("devices.offline")}
            </span>
          ) : null}
        </div>
      </button>
      <p className="mt-1 truncate px-0.5 text-[11px] text-muted">
        {device.name || t("devices.tvName", { id: device.id })}
        {device.room_code ? ` · ${device.room_code}` : device.room_name ? ` · ${device.room_name}` : ""}
      </p>
    </article>
  );
}

function TvBackdrop({ screen }: { screen: DeviceScreen }) {
  const src = screen.media.background_url;
  const playback = src ? parseVideoUrl(src) : null;
  const embed = playback ? embedSrc(playback, "background") : null;

  if (embed) {
    return (
      <iframe
        src={embed}
        title=""
        className="pointer-events-none absolute inset-0 size-full border-0"
        allow="autoplay; encrypted-media"
        tabIndex={-1}
      />
    );
  }

  if (screen.media.kind === "video" || playback?.provider === "file") {
    return (
      <video
        className="absolute inset-0 size-full object-cover"
        src={playback?.provider === "file" ? playback.url : src ?? FALLBACK_GROUNDS}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  return <img src={src ?? FALLBACK_GROUNDS} alt="" className="absolute inset-0 size-full object-cover" />;
}
