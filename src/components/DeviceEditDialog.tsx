"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DeskDialog } from "@/components/DeskDialog";
import { api, ApiError, type Device, type Room } from "@/lib/api";

type Props = {
  hotelId: number;
  device: Device;
  rooms: Room[];
  canUnpair: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export function DeviceEditDialog({ hotelId, device, rooms, canUnpair, onClose, onSaved }: Props) {
  const t = useTranslations("desk");
  const [name, setName] = useState(device.name ?? "");
  const [roomId, setRoomId] = useState(String(device.room_id ?? ""));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(device.name ?? "");
    setRoomId(String(device.room_id ?? ""));
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

  const status = device.online ? t("devices.online") : t("devices.offline");
  const guest = device.room_guest
    ? t("deviceEdit.showing", { name: device.room_guest })
    : t("deviceEdit.vacant");

  return (
    <DeskDialog
      title={device.name || t("devices.tvName", { id: device.id })}
      error={error}
      busy={busy}
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
      {canUnpair ? (
        <button type="button" disabled={busy} onClick={() => void unpair()} className="desk-btn-danger">
          {t("deviceEdit.unpair")}
        </button>
      ) : null}
    </DeskDialog>
  );
}
