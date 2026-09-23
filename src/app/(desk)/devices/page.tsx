"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DeviceEditDialog } from "@/components/DeviceEditDialog";
import { DeskEmpty, DeskHeader, DeskMain, DeskSkeleton } from "@/components/desk/ui";
import { api, hotelQuotaLabel, type Device, type Room } from "@/lib/api";
import { canManageRooms } from "@/lib/roles";
import { useSession } from "@/lib/session";

export default function DevicesPage() {
  const t = useTranslations("desk");
  const { hotelId, hotels, ready, user } = useSession();
  const hotel = hotels.find((item) => item.id === hotelId);
  const quota = hotelQuotaLabel(hotel, {
    plan: (plan) => t(`plans.${plan}`),
    limited: (values) => t("quotaLimited", values),
    open: (values) => t("quotaOpen", values),
  });
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editing, setEditing] = useState<Device | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!hotelId) return;
    const [deviceRes, roomRes] = await Promise.all([
      api<{ data: Device[] }>(`/cms/hotels/${hotelId}/devices`),
      api<{ data: Room[] }>(`/cms/hotels/${hotelId}/rooms`).catch(() => ({ data: [] as Room[] })),
    ]);
    setDevices(deviceRes.data);
    setRooms(roomRes.data);
    setEditing((current) => current ? deviceRes.data.find((item) => item.id === current.id) ?? null : null);
  }, [hotelId]);

  useEffect(() => {
    if (ready && user && hotelId) void load();
  }, [ready, user, hotelId, load]);

  async function unpair(device: Device) {
    if (!hotelId) return;
    setBusy(true);
    try {
      await api(`/cms/hotels/${hotelId}/devices/${device.id}/unpair`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const canUnpair = canManageRooms(user);

  function kindLabel(kind: Device["room_kind"]): string {
    if (kind === "public") return t("rooms.publicKind");
    if (kind === "guest") return t("rooms.guestKind");
    return t("devices.unpaired");
  }

  return (
    <DeskMain>
      <DeskHeader
        title={t("devices.title")}
        description={`${t("devices.body")}${quota ? ` ${quota}.` : ""}`}
      />
      {devices === null ? (
        <DeskSkeleton rows={3} />
      ) : devices.length === 0 ? (
        <DeskEmpty>
          {hotel?.allows_pairing_links || hotel?.pairing_mode === "link" ? t("devices.emptyLink") : t("devices.emptyPin")}
        </DeskEmpty>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="bg-surface text-muted">
                <th className="px-4 py-3 font-medium">{t("devices.colRoom")}</th>
                <th className="px-4 py-3 font-medium">{t("devices.colDevice")}</th>
                <th className="px-4 py-3 font-medium">{t("devices.colGuest")}</th>
                <th className="px-4 py-3 font-medium">{t("devices.colStatus")}</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {devices.map((d) => (
                <tr key={d.id} className="border-t border-line">
                  <td className="px-4 py-4 align-top">
                    <p className="text-lg font-medium tracking-tight">{d.room_code ?? t("devices.unpaired")}</p>
                    <p className="text-muted">
                      {d.room_name ? `${d.room_name}, ` : ""}
                      {kindLabel(d.room_kind)}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium">{d.name || t("devices.tvName", { id: d.id })}</p>
                    <p className="text-muted">{t("devices.machine", { id: d.id })}</p>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {d.room_guest ? d.room_guest : <span className="text-muted">{t("devices.vacant")}</span>}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {d.status === "paired"
                      ? d.online
                        ? t("devices.online")
                        : t("devices.offline")
                      : d.status}
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {d.status === "paired" ? (
                        <button type="button" onClick={() => setEditing(d)} className="desk-btn-ghost">
                          {t("deviceEdit.open")}
                        </button>
                      ) : null}
                      {canUnpair && d.status === "paired" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void unpair(d)}
                          className="desk-btn-danger"
                        >
                          {t("devices.unpair")}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing && hotelId ? (
        <DeviceEditDialog
          hotelId={hotelId}
          hotel={hotel}
          device={editing}
          rooms={rooms}
          canUnpair={canUnpair}
          onClose={() => setEditing(null)}
          onSaved={() => load()}
        />
      ) : null}
    </DeskMain>
  );
}
