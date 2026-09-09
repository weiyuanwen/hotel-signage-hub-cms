"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { api, type Device } from "@/lib/api";
import { canManageRooms } from "@/lib/roles";
import { useSession } from "@/lib/session";

export default function DevicesPage() {
  const { hotelId, ready, user } = useSession();
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!hotelId) return;
    const res = await api<{ data: Device[] }>(`/cms/hotels/${hotelId}/devices`);
    setDevices(res.data);
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

  return (
    <AppShell>
      <main className="px-5 py-6 lg:px-10">
        <h1 className="text-2xl font-medium tracking-tight">Thiết bị</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Trạng thái online lấy từ heartbeat cache, không phải MySQL.
        </p>
        {devices === null ? (
          <div className="h-24 animate-pulse rounded-[10px] bg-surface" />
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted">Chưa ghép TV. Mở player, lấy PIN, rồi Ghép TV ở trang Phòng.</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {devices.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium">{d.name || `TV #${d.id}`}</p>
                  <p className="text-sm text-muted">
                    {d.status} · phòng {d.room_id ?? "—"} · {d.online ? "online" : "offline"}
                  </p>
                </div>
                {canUnpair && d.status === "paired" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void unpair(d)}
                    className="rounded-[10px] border border-line px-3 py-1.5 text-sm text-danger"
                  >
                    Gỡ ghép
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
