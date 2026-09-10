"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { DeskDialog } from "@/components/DeskDialog";
import { api, ApiError, type Room } from "@/lib/api";
import { embedSrc, parseVideoUrl, remoteLinkFrom, type VideoPlayback } from "@/lib/videoSource";

type Props = {
  hotelId: number;
  room: Room;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function RoomBackgroundDialog({ hotelId, room, onClose, onSaved }: Props) {
  const t = useTranslations("desk");
  const [videoLink, setVideoLink] = useState(remoteLinkFrom(room.background_url ?? null));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const parsed = parseVideoUrl(videoLink);
  const savedUrl = room.background_url ?? null;

  async function saveLink(event: FormEvent) {
    event.preventDefault();
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/rooms/${room.id}/media`, {
        method: "POST",
        body: JSON.stringify({ url: parsed.url }),
      });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.linkError") : t("roomBg.network"));
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
      await api(`/cms/hotels/${hotelId}/rooms/${room.id}/media`, { method: "POST", body });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.uploadError") : t("roomBg.network"));
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/rooms/${room.id}/media`, { method: "DELETE" });
      await onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? t("roomBg.clearError") : t("roomBg.network"));
    } finally {
      setBusy(false);
    }
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void upload(file);
  }

  return (
    <DeskDialog title={t("roomBg.title", { code: room.code })} error={error} onClose={onClose}>
      <p className="text-sm text-muted">{t("roomBg.body")}</p>
      <RoomBackgroundPreview
        draft={videoLink}
        savedUrl={savedUrl}
        savedKind={room.background_kind ?? null}
        empty={t("roomBg.empty")}
        preview={t("roomBg.preview")}
      />
      <form className="grid gap-2" onSubmit={(e) => void saveLink(e)}>
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
        <button type="submit" disabled={busy || !parsed} className="desk-btn-primary justify-self-end">
          {busy ? t("saving") : t("roomBg.use")}
        </button>
      </form>
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
          <button type="button" disabled={busy} onClick={() => void clear()} className="desk-btn-danger">
            {t("roomBg.hotelBg")}
          </button>
        ) : null}
      </div>
    </DeskDialog>
  );
}

function RoomBackgroundPreview({
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
