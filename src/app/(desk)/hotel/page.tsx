"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { DeskEmpty, DeskError, DeskHeader, DeskMain, DeskPanel, DeskSkeleton, DeskToast } from "@/components/desk/ui";
import { api, ApiError, type HotelBranding, type WeatherRegion } from "@/lib/api";
import { canManageRooms } from "@/lib/roles";
import { useSession } from "@/lib/session";
import { embedSrc, parseVideoUrl, remoteLinkFrom, type VideoPlayback } from "@/lib/videoSource";

export default function HotelPage() {
  const t = useTranslations("desk");
  const { hotelId, ready, user } = useSession();
  const allowed = canManageRooms(user);
  const [branding, setBranding] = useState<HotelBranding | null>(null);
  const [regions, setRegions] = useState<WeatherRegion[]>([]);
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<"region" | "wifi" | "logo" | "background" | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const hotelIdRef = useRef(hotelId);
  hotelIdRef.current = hotelId;
  const toastTimer = useRef<number | null>(null);

  const flashSaved = useCallback(() => {
    setToast(t("editor.saved"));
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, [t]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  function remember(next: HotelBranding) {
    setBranding(next);
    setSsid(next.wifi_ssid ?? "");
    setWifiPassword(next.wifi_password ?? "");
    setVideoLink(remoteLinkFrom(next.background_url));
  }

  const load = useCallback(async () => {
    if (!hotelId || !allowed) return;
    const requested = hotelId;
    try {
      const [brandRes, regionRes] = await Promise.all([
        api<{ data: HotelBranding }>(`/cms/hotels/${requested}`),
        api<{ data: WeatherRegion[] }>("/cms/weather-regions"),
      ]);
      if (hotelIdRef.current !== requested) return;
      remember(brandRes.data);
      setRegions(regionRes.data);
      setError(null);
    } catch {
      if (hotelIdRef.current !== requested) return;
      setError(t("hotelPage.loadError"));
      setBranding(null);
    }
  }, [hotelId, allowed, t]);

  useEffect(() => {
    setBranding(null);
    if (ready && user && hotelId && allowed) void load();
  }, [ready, user, hotelId, allowed, load]);

  async function saveRegion(key: string) {
    if (!hotelId) return;
    setBusy("region");
    try {
      const res = await api<{ data: HotelBranding }>(`/cms/hotels/${hotelId}`, {
        method: "PATCH",
        body: JSON.stringify({ weather_region: key }),
      });
      remember(res.data);
      setError(null);
      flashSaved();
    } catch {
      setError(t("hotelPage.regionError"));
    } finally {
      setBusy(null);
    }
  }

  async function upload(purpose: "logo" | "background", file: File) {
    if (!hotelId) return;
    setBusy(purpose);
    try {
      const body = new FormData();
      body.append("purpose", purpose);
      body.append("file", file);
      const res = await api<{ data: HotelBranding }>(`/cms/hotels/${hotelId}/media`, {
        method: "POST",
        body,
      });
      remember(res.data);
      setError(null);
      flashSaved();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? purpose === "logo"
            ? t("hotelPage.logoError")
            : t("hotelPage.bgError")
          : t("hotelPage.network"),
      );
    } finally {
      setBusy(null);
    }
  }

  async function clearMedia(purpose: "logo" | "background") {
    if (!hotelId) return;
    setBusy(purpose);
    try {
      const res = await api<{ data: HotelBranding }>(`/cms/hotels/${hotelId}/media/${purpose}`, {
        method: "DELETE",
      });
      remember(res.data);
      setError(null);
      flashSaved();
    } catch {
      setError(purpose === "logo" ? t("hotelPage.logoDeleteError") : t("hotelPage.bgClearError"));
    } finally {
      setBusy(null);
    }
  }

  async function saveWifi(event: FormEvent) {
    event.preventDefault();
    if (!hotelId) return;
    setBusy("wifi");
    try {
      const res = await api<{ data: HotelBranding }>(`/cms/hotels/${hotelId}`, {
        method: "PATCH",
        body: JSON.stringify({
          wifi_ssid: ssid.trim() || null,
          wifi_password: ssid.trim() ? wifiPassword.trim() || null : null,
        }),
      });
      remember(res.data);
      setError(null);
      flashSaved();
    } catch {
      setError(t("hotelPage.wifiError"));
    } finally {
      setBusy(null);
    }
  }

  async function saveVideoLink(event: FormEvent) {
    event.preventDefault();
    if (!hotelId) return;
    const parsed = parseVideoUrl(videoLink);
    if (!parsed) {
      setError(t("hotelPage.videoNeed"));
      return;
    }
    setBusy("background");
    try {
      const res = await api<{ data: HotelBranding }>(`/cms/hotels/${hotelId}/media`, {
        method: "POST",
        body: JSON.stringify({ purpose: "background", url: parsed.url }),
      });
      remember(res.data);
      setError(null);
      flashSaved();
    } catch (err) {
      setError(err instanceof ApiError ? t("hotelPage.bgLinkError") : t("hotelPage.network"));
    } finally {
      setBusy(null);
    }
  }

  function onFile(purpose: "logo" | "background") {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (file) void upload(purpose, file);
    };
  }

  const parsedLink = parseVideoUrl(videoLink);
  const linkDirty = videoLink.trim() !== remoteLinkFrom(branding?.background_url ?? null);

  return (
    <DeskMain tight>
      <DeskHeader compact title={t("hotelPage.title")} description={t("hotelPage.body")} />
      {error ? <DeskError>{error}</DeskError> : null}
      {!allowed ? (
        <DeskEmpty>{t("hotelPage.forbidden")}</DeskEmpty>
      ) : !hotelId ? (
        <DeskEmpty>{t("hotelPage.noHotel")}</DeskEmpty>
      ) : !branding ? (
        <DeskSkeleton rows={3} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
          <div className="space-y-3">
            <DeskPanel compact>
              <h2 className="text-sm font-medium">{t("hotelPage.logoTitle")}</h2>
              <div className="flex flex-wrap items-center gap-2">
                {branding.logo_url ? (
                  <img src={branding.logo_url} alt="" className="h-10 w-auto rounded-md bg-surface p-1.5" />
                ) : (
                  <p className="text-xs text-muted">{t("hotelPage.logoEmpty")}</p>
                )}
                <label className="desk-btn-ghost cursor-pointer !px-2.5 !py-1 text-xs">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    disabled={busy === "logo"}
                    onChange={onFile("logo")}
                  />
                  {busy === "logo" ? t("hotelPage.logoUploading") : t("hotelPage.logoUpload")}
                </label>
                {branding.logo_url ? (
                  <button
                    type="button"
                    disabled={busy === "logo"}
                    onClick={() => void clearMedia("logo")}
                    className="desk-btn-danger !px-2.5 !py-1 text-xs"
                  >
                    {t("hotelPage.logoDelete")}
                  </button>
                ) : null}
              </div>
            </DeskPanel>

            <DeskPanel compact>
              <h2 className="text-sm font-medium">{t("hotelPage.weatherTitle")}</h2>
              <label className="block space-y-1">
                <span className="text-xs font-medium">{t("hotelPage.region")}</span>
                <select
                  value={branding.weather_region ?? ""}
                  disabled={busy === "region"}
                  onChange={(e) => void saveRegion(e.target.value)}
                  className="desk-field !py-1.5"
                >
                  <option value="" disabled>
                    {t("hotelPage.regionPick")}
                  </option>
                  {regions.map((row) => (
                    <option key={row.key} value={row.key}>
                      {row.label}
                    </option>
                  ))}
                </select>
              </label>
            </DeskPanel>

            <DeskPanel compact>
              <h2 className="text-sm font-medium">{t("hotelPage.wifiTitle")}</h2>
              <form className="grid grid-cols-2 gap-2" onSubmit={(e) => void saveWifi(e)}>
                <label className="block space-y-1">
                  <span className="text-xs font-medium">{t("hotelPage.ssid")}</span>
                  <input
                    value={ssid}
                    maxLength={64}
                    autoComplete="off"
                    disabled={busy === "wifi"}
                    onChange={(e) => setSsid(e.target.value)}
                    className="desk-field !py-1.5"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="text-xs font-medium">{t("hotelPage.wifiPassword")}</span>
                  <input
                    value={wifiPassword}
                    maxLength={64}
                    autoComplete="off"
                    spellCheck={false}
                    disabled={busy === "wifi"}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    className="desk-field !py-1.5 font-mono text-sm"
                    placeholder={t("hotelPage.wifiOptional")}
                  />
                </label>
                <button
                  type="submit"
                  disabled={
                    busy === "wifi" ||
                    (ssid === (branding.wifi_ssid ?? "") && wifiPassword === (branding.wifi_password ?? ""))
                  }
                  className="desk-btn-primary col-span-2 !px-3 !py-1.5 text-xs justify-self-start"
                >
                  {busy === "wifi" ? t("saving") : t("hotelPage.wifiSave")}
                </button>
              </form>
            </DeskPanel>
          </div>

          <DeskPanel compact>
            <h2 className="text-sm font-medium">{t("hotelPage.bgTitle")}</h2>
            <p className="text-xs text-muted">{t("hotelPage.bgBody")}</p>
            <BackgroundPreview
              draft={videoLink}
              savedUrl={branding.background_url}
              savedKind={branding.background_kind}
              empty={t("hotelPage.bgEmpty")}
              preview={t("hotelPage.preview")}
            />
            <form className="grid gap-1.5 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={(e) => void saveVideoLink(e)}>
              <label className="block space-y-1">
                <span className="text-xs font-medium">{t("hotelPage.videoLink")}</span>
                <input
                  value={videoLink}
                  maxLength={2048}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy === "background"}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="desk-field !py-1.5"
                  placeholder={t("hotelPage.videoPlaceholder")}
                />
              </label>
              <button
                type="submit"
                disabled={busy === "background" || !parsedLink || !linkDirty}
                className="desk-btn-primary !px-3 !py-1.5 text-xs"
              >
                {busy === "background" ? t("saving") : t("hotelPage.useOnTv")}
              </button>
            </form>
            {videoLink.trim() && !parsedLink ? <p className="text-xs text-danger">{t("hotelPage.videoBad")}</p> : null}
            <div className="flex flex-wrap gap-1.5">
              <label className="desk-btn-ghost cursor-pointer !px-2.5 !py-1 text-xs">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                  className="sr-only"
                  disabled={busy === "background"}
                  onChange={onFile("background")}
                />
                {busy === "background" ? t("hotelPage.logoUploading") : t("hotelPage.uploadMedia")}
              </label>
              {branding.background_url ? (
                <button
                  type="button"
                  disabled={busy === "background"}
                  onClick={() => void clearMedia("background")}
                  className="desk-btn-danger !px-2.5 !py-1 text-xs"
                >
                  {t("hotelPage.clearBg")}
                </button>
              ) : null}
            </div>
          </DeskPanel>
        </div>
      )}
      {toast ? <DeskToast>{toast}</DeskToast> : null}
    </DeskMain>
  );
}

function BackgroundPreview({
  draft,
  savedUrl,
  savedKind,
  empty,
  preview,
}: {
  draft: string;
  savedUrl: string | null;
  savedKind: "image" | "video" | null;
  empty: string;
  preview: string;
}) {
  const draftPlay = parseVideoUrl(draft);
  if (draft.trim() && draftPlay) {
    return <VideoPreview playback={draftPlay} title={preview} />;
  }

  if (savedKind === "video" && savedUrl) {
    const savedPlay = parseVideoUrl(savedUrl);
    if (savedPlay) return <VideoPreview playback={savedPlay} title={preview} />;
    return (
      <video
        src={savedUrl}
        className="aspect-video w-full rounded-lg bg-black object-cover"
        muted
        loop
        autoPlay
        playsInline
        controls
      />
    );
  }

  if (savedUrl) {
    return <img src={savedUrl} alt="" className="aspect-video w-full rounded-lg object-cover" />;
  }

  return <p className="text-sm text-muted">{empty}</p>;
}

function VideoPreview({ playback, title }: { playback: VideoPlayback; title: string }) {
  const embed = embedSrc(playback, "preview");
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className="aspect-video w-full rounded-lg bg-black"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    );
  }

  return (
    <video
      src={playback.url}
      className="aspect-video w-full rounded-lg bg-black object-cover"
      muted
      loop
      autoPlay
      playsInline
      controls
    />
  );
}
