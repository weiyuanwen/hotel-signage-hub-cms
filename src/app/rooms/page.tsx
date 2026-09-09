"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DeskDialog } from "@/components/DeskDialog";
import { TemplatePicker } from "@/components/TemplatePicker";
import { api, ApiError, type Room, type WelcomeTemplate, type WelcomeTemplateList } from "@/lib/api";
import { canManageRooms, isSuperAdmin } from "@/lib/roles";
import { useSession } from "@/lib/session";
import { templateLabel } from "@/lib/welcomeTemplates";

type Mode = "idle" | "checkin" | "rename" | "pair" | "create";

export default function RoomsPage() {
  const { hotelId, hotels, ready, user } = useSession();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [active, setActive] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("Chào mừng quý khách");
  const [pin, setPin] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomKind, setRoomKind] = useState<"guest" | "public">("guest");
  const [busy, setBusy] = useState(false);
  const [templateKey, setTemplateKey] = useState("");
  const [templateList, setTemplateList] = useState<WelcomeTemplateList | null>(null);
  const [templatesFailed, setTemplatesFailed] = useState(false);
  const templateTouchedRef = useRef(false);

  const load = useCallback(async () => {
    if (!hotelId) return;
    setError(null);
    try {
      const res = await api<{ data: Room[] }>(`/cms/hotels/${hotelId}/rooms`);
      setRooms(res.data);
    } catch {
      setError("Không tải được danh sách phòng.");
      setRooms([]);
      return;
    }
    try {
      const templates = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates`);
      setTemplateList(templates.data);
      setTemplatesFailed(false);
    } catch {
      setTemplateList(null);
      setTemplatesFailed(true);
    }
  }, [hotelId]);

  useEffect(() => {
    if (ready && user && hotelId) {
      setTemplateList(null);
      setTemplatesFailed(false);
      templateTouchedRef.current = false;
      void load();
    }
    if (ready && user && !hotelId) setRooms([]);
  }, [ready, user, hotelId, load]);

  useEffect(() => {
    if (!templateList || templateTouchedRef.current) return;
    if (mode === "checkin") {
      setTemplateKey(templateList.default_key);
    } else if (mode === "rename") {
      setTemplateKey(active?.current_welcome?.template_key ?? templateList.default_key);
    }
  }, [templateList, mode, active]);

  function open(next: Mode, room: Room) {
    setActive(room);
    setMode(next);
    setName(room.current_welcome?.guest_display_name ?? "");
    setMessage(room.current_welcome?.message ?? "Chào mừng quý khách");
    setPin("");
    setError(null);
    templateTouchedRef.current = false;
    if (next === "checkin") {
      if (templateList) setTemplateKey(templateList.default_key);
    } else if (next === "rename") {
      const current = room.current_welcome?.template_key ?? templateList?.default_key;
      if (current) setTemplateKey(current);
    }
  }

  function pickerTemplates(): WelcomeTemplate[] {
    const rows = (templateList?.templates ?? []).filter((r) => r.is_enabled);
    if (mode === "rename" && active?.current_welcome?.template_key) {
      const current = active.current_welcome.template_key;
      if (!rows.some((r) => r.key === current)) {
        return [
          ...rows,
          {
            key: current,
            built_in_name: templateLabel(current, []),
            display_name: null,
            label: templateLabel(current, []),
            is_enabled: false,
            sort_order: 99,
          },
        ];
      }
    }
    return rows;
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!hotelId) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        await api(`/cms/hotels/${hotelId}/rooms`, {
          method: "POST",
          body: JSON.stringify({
            code: roomCode.trim(),
            name: roomName.trim() || null,
            kind: roomKind,
          }),
        });
      } else if (active && mode === "checkin") {
        await api(`/cms/hotels/${hotelId}/rooms/${active.id}/check-in`, {
          method: "POST",
          body: JSON.stringify({
            guest_display_name: name,
            message,
            locale: "vi",
            ...(templateList ? { template_key: templateKey } : {}),
          }),
        });
      } else if (active && mode === "rename") {
        await api(`/cms/hotels/${hotelId}/rooms/${active.id}/welcome`, {
          method: "PATCH",
          body: JSON.stringify({
            guest_display_name: name,
            message,
            ...(templateList ? { template_key: templateKey } : {}),
          }),
        });
      } else if (active && mode === "pair") {
        await api(`/cms/hotels/${hotelId}/pairing-codes/claim`, {
          method: "POST",
          body: JSON.stringify({ code: pin.trim().toUpperCase(), room_id: active.id }),
        });
      }
      setMode("idle");
      await load();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? "Không thực hiện được. Kiểm tra PIN, mã phòng hoặc tên khách."
          : "Lỗi mạng.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function checkout(room: Room) {
    if (!hotelId) return;
    setBusy(true);
    try {
      await api(`/cms/hotels/${hotelId}/rooms/${room.id}/checkout`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const dialogTitle =
    mode === "create"
      ? "Thêm phòng"
      : mode === "checkin"
        ? `Nhận phòng ${active?.code}`
        : mode === "rename"
          ? `Đổi tên ${active?.code}`
          : mode === "pair"
            ? `Ghép TV vào ${active?.code}`
            : "";

  const templatesPending = templateList === null && !templatesFailed;

  return (
    <AppShell>
      <main className="px-5 py-6 lg:px-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Phòng</h1>
            <p className="mt-1 text-sm text-muted">Nhận phòng, đổi tên, trả phòng, ghép TV.</p>
          </div>
          <div className="flex gap-2">
            {canManageRooms(user) && hotelId ? (
              <button
                type="button"
                onClick={() => {
                  setMode("create");
                  setActive(null);
                  setRoomCode("");
                  setRoomName("");
                  setRoomKind("guest");
                  setError(null);
                }}
                className="rounded-[10px] bg-primary px-3 py-2 text-sm text-primary-ink"
              >
                Thêm phòng
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => void load()}
              disabled={!hotelId}
              className="rounded-[10px] border border-line px-3 py-2 text-sm disabled:opacity-50"
            >
              Tải lại
            </button>
          </div>
        </header>

        {!hotelId ? (
          <p className="rounded-[10px] bg-surface px-4 py-8 text-sm text-muted">
            {isSuperAdmin(user)
              ? "Chưa có khách sạn. Thêm khách sạn ở cột trái rồi tạo phòng."
              : "Tài khoản chưa được gắn khách sạn."}
          </p>
        ) : rooms === null ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-[10px] bg-surface" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <p className="rounded-[10px] bg-surface px-4 py-8 text-sm text-muted">
            {canManageRooms(user)
              ? `Chưa có phòng tại ${hotels.find((h) => h.id === hotelId)?.name ?? "khách sạn này"}. Bấm Thêm phòng.`
              : "Chưa có phòng. Nhờ quản lý tạo phòng."}
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {rooms.map((room) => {
              const occupied = Boolean(room.current_welcome_id);
              return (
                <li key={room.id} className="grid gap-3 py-4 md:grid-cols-[140px_minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <p className="font-medium">{room.code}</p>
                    <p className="text-xs text-muted">{room.kind === "public" ? "Khu vực chung" : "Phòng khách"}</p>
                  </div>
                  <div>
                    {occupied ? (
                      <>
                        <p className="text-lg tracking-tight">{room.current_welcome?.guest_display_name}</p>
                        {room.current_welcome?.template_key ? (
                          <p className="text-xs text-muted">
                            {templateLabel(room.current_welcome.template_key, templateList?.templates ?? [])}
                          </p>
                        ) : null}
                      </>
                    ) : (
                      <p className="text-muted">Trống — branding khách sạn</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {occupied ? (
                      <>
                        <button type="button" disabled={templatesPending} onClick={() => open("rename", room)} className="rounded-[10px] border border-line px-3 py-1.5 text-sm disabled:opacity-50">
                          Đổi tên
                        </button>
                        <button type="button" disabled={busy} onClick={() => void checkout(room)} className="rounded-[10px] border border-line px-3 py-1.5 text-sm">
                          Trả phòng
                        </button>
                      </>
                    ) : (
                      <button type="button" disabled={templatesPending} onClick={() => open("checkin", room)} className="rounded-[10px] bg-primary px-3 py-1.5 text-sm text-primary-ink disabled:opacity-50">
                        Nhận phòng
                      </button>
                    )}
                    <button type="button" onClick={() => open("pair", room)} className="rounded-[10px] border border-line px-3 py-1.5 text-sm">
                      Ghép TV
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {mode !== "idle" ? (
          <DeskDialog
            title={dialogTitle}
            error={error}
            busy={busy}
            wide={mode === "checkin" || mode === "rename"}
            submitLabel={mode === "create" ? "Tạo" : "Lưu"}
            onClose={() => setMode("idle")}
            onSubmit={submit}
          >
            {mode === "create" ? (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Mã phòng</span>
                  <input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full rounded-[10px] border border-line px-3 py-2"
                    placeholder="101"
                    required
                    autoFocus
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Tên gọi (tuỳ chọn)</span>
                  <input
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full rounded-[10px] border border-line px-3 py-2"
                    placeholder="Phòng 101"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Loại</span>
                  <select
                    value={roomKind}
                    onChange={(e) => setRoomKind(e.target.value as "guest" | "public")}
                    className="w-full rounded-[10px] border border-line bg-bg px-3 py-2"
                  >
                    <option value="guest">Phòng khách</option>
                    <option value="public">Khu vực chung</option>
                  </select>
                </label>
              </>
            ) : mode === "pair" ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Mã PIN trên TV</span>
                <input
                  value={pin}
                  onChange={(e) => setPin(e.target.value.toUpperCase())}
                  className="w-full rounded-[10px] border border-line px-3 py-2 font-mono tracking-[0.2em]"
                  maxLength={8}
                  required
                />
              </label>
            ) : (
              <>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Tên hiển thị</span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[10px] border border-line px-3 py-2"
                    required
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Thông điệp</span>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-[10px] border border-line px-3 py-2"
                  />
                </label>
                <TemplatePicker
                  templates={pickerTemplates()}
                  value={templateKey}
                  onChange={(key) => {
                    templateTouchedRef.current = true;
                    setTemplateKey(key);
                  }}
                />
              </>
            )}
          </DeskDialog>
        ) : null}
      </main>
    </AppShell>
  );
}
