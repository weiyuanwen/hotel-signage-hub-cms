"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DeskDialog } from "@/components/DeskDialog";
import { api, ApiError, type Device, type Hotel, type Room } from "@/lib/api";
import { embedSrc, parseVideoUrl, remoteLinkFrom, type VideoPlayback } from "@/lib/videoSource";

type Props = {
  hotelId: number;
  hotel?: Hotel;
  device: Device;
  rooms: Room[];
  canUnpair: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function DeviceEditDialog({ hotelId, hotel, device, rooms, canUnpair, onClose, onSaved }: Props) {
  const t = useTranslations("desk");
  const [name, setName] = useState(device.name ?? "");
  const [roomId, setRoomId] = useState(String(device.room_id ?? ""));
  const [videoLink, setVideoLink] = useState(remoteLinkFrom(device.background_url ?? null));
  const [savedUrl, setSavedUrl] = useState(device.background_url ?? null);
  const [savedKind, setSavedKind] = useState(device.background_kind ?? null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const parsed = parseVideoUrl(videoLink);
  const paid = Boolean(hotel?.allows_device_backgrounds);

  useEffect(() => {
    setName(device.name ?? "");
    setRoomId(String(device.room_id ?? ""));
    setVideoLink(remoteLinkFrom(device.background_url ?? null));
    setSavedUrl(device.background_url ?? null);
    setSavedKind(device.background_kind ?? null);
    setError(null);
  }, [device]);

  async function save(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/devices/${device.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: name.trim() || null,
          room_id: Number(roomId),
        }),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? t("deviceEdit.saveError") : t("deviceEdit.network"));
    } finally {
      setBusy(false);
    }
  }

  async function unpair() {
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/devices/${device.id}/unpair`, { method: "POST" });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? t("deviceEdit.unpairError") : t("deviceEdit.network"));
    } finally {
      setBusy(false);
    }
  }

  async function saveLink() {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ data: { background_url: string | null; background_kind: "image" | "video" | null } }>(
        `/cms/hotels/${hotelId}/devices/${device.id}/media`,
        { method: "POST", body: JSON.stringify({ url: parsed.url }) },
      );
      setSavedUrl(res.data.background_url);
      setSavedKind(res.data.background_kind);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.linkError") : t("deviceEdit.network"));
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api<{ data: { background_url: string | null; background_kind: "image" | "video" | null } }>(
        `/cms/hotels/${hotelId}/devices/${device.id}/media`,
        { method: "POST", body },
      );
      setSavedUrl(res.data.background_url);
      setSavedKind(res.data.background_kind);
      setVideoLink("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.uploadError") : t("deviceEdit.network"));
    } finally {
      setBusy(false);
    }
  }

  async function clearBg() {
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/devices/${device.id}/media`, { method: "DELETE" });
      setSavedUrl(null);
      setSavedKind(null);
      setVideoLink("");
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.clearError") : t("deviceEdit.network"));
    } finally {
      setBusy(false);
    }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void upload(file);
  }

  const status = device.online ? t("devices.online") : t("devices.offline");
  const guest = device.room_guest
    ? t("deviceEdit.showing", { name: device.room_guest })
    : t("deviceEdit.vacant");

  return (
    <DeskDialog
      title={device.name || t("devices.tvName", { id: device.id })}
      error={error}
      busy={busy}
      wide
      onClose={onClose}
      onSubmit={save}
    >
      <p className="text-sm text-muted">
        {t("deviceEdit.machine", { id: device.id })} · {status} · {guest}
      </p>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t("deviceEdit.name")}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="desk-field"
          placeholder={t("devices.tvName", { id: device.id })}
          maxLength={64}
          autoFocus
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">{t("deviceEdit.room")}</span>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)} className="desk-field" required>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.code}
              {room.name ? ` - ${room.name}` : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-3 border-t border-line pt-4">
        <div>
          <p className="text-sm font-medium">{t("deviceEdit.bgTitle")}</p>
          <p className="mt-1 text-sm text-muted">{paid ? t("deviceEdit.bgBody") : t("deviceEdit.bgUpgrade", { plan: hotel?.plan_label ?? hotel?.plan ?? "" })}</p>
        </div>
        {paid ? (
          <>
            <BackgroundPreview
              draft={videoLink}
              savedUrl={savedUrl}
              savedKind={savedKind}
              empty={t("deviceEdit.bgEmpty")}
              preview={t("deviceEdit.bgPreview")}
            />
            <div className="grid gap-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("roomBg.link")}</span>
                <input
                  value={videoLink}
                  maxLength={2048}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={busy}
                  onChange={(e) => setVideoLink(e.target.value)}
                  className="desk-field"
                  placeholder={t("roomBg.placeholder")}
                />
              </label>
              {videoLink.trim() && !parsed ? <p className="text-sm text-danger">{t("roomBg.badLink")}</p> : null}
              <button
                type="button"
                disabled={busy || !parsed}
                className="desk-btn-primary justify-self-end"
                onClick={() => void saveLink()}
              >
                {busy ? t("saving") : t("deviceEdit.bgUse")}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="desk-btn-ghost cursor-pointer">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,video/mp4,video/webm"
                  className="sr-only"
                  disabled={busy}
                  onChange={onFile}
                />
                {busy ? t("hotelPage.logoUploading") : t("roomBg.upload")}
              </label>
              {savedUrl ? (
                <button type="button" disabled={busy} onClick={() => void clearBg()} className="desk-btn-danger">
                  {t("deviceEdit.bgRoom")}
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {canUnpair ? (
        <button type="button" disabled={busy} onClick={() => void unpair()} className="desk-btn-danger">
          {t("deviceEdit.unpair")}
        </button>
      ) : null}
    </DeskDialog>
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
  if (draft.trim() && draftPlay) return <Preview playback={draftPlay} title={preview} />;

  if (savedKind === "video" && savedUrl) {
    const savedPlay = parseVideoUrl(savedUrl);
    if (savedPlay) return <Preview playback={savedPlay} title={preview} />;
    return (
      <video
        src={savedUrl}
        className="aspect-video w-full rounded-[10px] bg-black object-cover"
        muted
        loop
        autoPlay
        playsInline
        controls
      />
    );
  }

  if (savedUrl) {
    return <img src={savedUrl} alt="" className="aspect-video w-full rounded-[10px] object-cover" />;
  }

  return <p className="text-sm text-muted">{empty}</p>;
}

function Preview({ playback, title }: { playback: VideoPlayback; title: string }) {
  const embed = embedSrc(playback, "preview");
  if (embed) {
    return (
      <iframe
        src={embed}
        title={title}
        className="aspect-video w-full rounded-[10px] bg-black"
        allow="autoplay; encrypted-media; picture-in-picture"
      />
    );
  }

  return (
    <video
      src={playback.url}
      className="aspect-video w-full rounded-[10px] bg-black object-cover"
      muted
      loop
      autoPlay
      playsInline
      controls
    />
  );
}
