"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Buildings, FrameCorners, MonitorPlay, SignOut, SquaresFour, UsersThree } from "@phosphor-icons/react";
import { api, ApiError } from "@/lib/api";
import { canManageStaff, canManageTemplates, isSuperAdmin } from "@/lib/roles";
import { useSession } from "@/lib/session";
import { DeskDialog } from "./DeskDialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, hotels, hotelId, ready, logout, selectHotel, refreshHotels } = useSession();
  const router = useRouter();
  const path = usePathname();
  const [hotelOpen, setHotelOpen] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [hotelBusy, setHotelBusy] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-[100dvh] place-items-center text-sm text-muted">
        Đang tải ca làm việc...
      </div>
    );
  }

  const links = [
    { href: "/rooms", label: "Phòng", icon: SquaresFour },
    ...(canManageTemplates(user) ? [{ href: "/templates", label: "Mẫu chào", icon: FrameCorners }] : []),
    { href: "/devices", label: "Thiết bị", icon: MonitorPlay },
    ...(canManageStaff(user) ? [{ href: "/staff", label: "Nhân viên", icon: UsersThree }] : []),
  ];

  async function createHotel(event: FormEvent) {
    event.preventDefault();
    setHotelBusy(true);
    setHotelError(null);
    try {
      const res = await api<{ data: { id: number } }>("/cms/hotels", {
        method: "POST",
        body: JSON.stringify({ name: hotelName.trim() }),
      });
      setHotelOpen(false);
      setHotelName("");
      await refreshHotels(res.data.id);
    } catch (err) {
      setHotelError(err instanceof ApiError ? "Không tạo được khách sạn." : "Lỗi mạng.");
    } finally {
      setHotelBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <div>
            <p className="text-sm font-medium tracking-tight">Signage Desk</p>
            <p className="hidden text-xs text-muted lg:mt-1 lg:block">{user.name}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-ink lg:hidden"
          >
            <SignOut size={16} />
            Thoát
          </button>
        </div>
        <div className="px-5 pb-3">
          <label className="block">
            <span className="sr-only">Khách sạn</span>
            <select
              value={hotelId ?? ""}
              onChange={(e) => selectHotel(Number(e.target.value))}
              className="w-full rounded-[10px] border border-line bg-bg px-2 py-2 text-sm"
            >
              {hotels.length === 0 ? <option value="">Chưa có khách sạn</option> : null}
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </label>
          {isSuperAdmin(user) ? (
            <button
              type="button"
              onClick={() => {
                setHotelError(null);
                setHotelOpen(true);
              }}
              className="mt-2 flex items-center gap-1.5 text-sm text-muted hover:text-ink"
            >
              <Buildings size={16} />
              Thêm khách sạn
            </button>
          ) : null}
        </div>
        <nav className="flex gap-1 px-3 pb-3 lg:flex-col">
          {links.map((l) => {
            const Icon = l.icon;
            const active = path === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-2 rounded-[10px] px-3 py-2 text-sm ${
                  active ? "bg-bg text-ink" : "text-muted hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/login");
          }}
          className="mx-5 mb-4 hidden items-center gap-2 text-sm text-muted hover:text-ink lg:flex"
        >
          <SignOut size={16} />
          Thoát
        </button>
      </aside>
      <div className="min-w-0">{children}</div>
      {hotelOpen ? (
        <DeskDialog
          title="Thêm khách sạn"
          error={hotelError}
          busy={hotelBusy}
          submitLabel="Tạo"
          onClose={() => setHotelOpen(false)}
          onSubmit={createHotel}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Tên khách sạn</span>
            <input
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="w-full rounded-[10px] border border-line px-3 py-2"
              required
              autoFocus
            />
          </label>
        </DeskDialog>
      ) : null}
    </div>
  );
}
