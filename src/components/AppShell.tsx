"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, createContext, useContext, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Buildings, FrameCorners, ImageSquare, MonitorPlay, SignOut, SquaresFour, UsersThree } from "@phosphor-icons/react";
import { DeskLangSwitch } from "@/components/desk/lang-switch";
import { DeskDialog } from "./DeskDialog";
import { api, ApiError, hotelQuotaLabel } from "@/lib/api";
import { deskLoginHref } from "@/lib/desk-locale";
import { canManageRooms, canManageStaff, canManageTemplates, isSuperAdmin } from "@/lib/roles";
import { useSession } from "@/lib/session";

const HotelCreateContext = createContext<(() => void) | null>(null);

export function useHotelCreate(): (() => void) | null {
  return useContext(HotelCreateContext);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("desk");
  const { user, hotels, hotelId, ready, logout, selectHotel, refreshHotels } = useSession();
  const router = useRouter();
  const path = usePathname();
  const [hotelOpen, setHotelOpen] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [hotelError, setHotelError] = useState<string | null>(null);
  const [hotelBusy, setHotelBusy] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(deskLoginHref());
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-[100dvh] place-items-center text-sm text-muted">{t("loading")}</div>
    );
  }

  const currentHotel = hotels.find((item) => item.id === hotelId);
  const quota = hotelQuotaLabel(currentHotel, {
    plan: (plan) => t(`plans.${plan}`),
    limited: (values) => t("quotaLimited", values),
    open: (values) => t("quotaOpen", values),
  });
  const links = [
    { href: "/rooms", label: t("nav.rooms"), icon: SquaresFour },
    ...(canManageRooms(user) ? [{ href: "/hotel", label: t("nav.hotel"), icon: ImageSquare }] : []),
    ...(canManageTemplates(user) ? [{ href: "/templates", label: t("nav.templates"), icon: FrameCorners }] : []),
    { href: "/devices", label: t("nav.devices"), icon: MonitorPlay },
    ...(canManageStaff(user) ? [{ href: "/staff", label: t("nav.staff"), icon: UsersThree }] : []),
  ];

  function leave() {
    logout();
    router.replace(deskLoginHref());
  }

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
      setHotelError(err instanceof ApiError ? t("hotel.createError") : t("hotel.network"));
    } finally {
      setHotelBusy(false);
    }
  }

  return (
    <div className="min-h-[100dvh] lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium tracking-tight">{t("brand")}</p>
              <p className="mt-0.5 truncate text-xs text-muted lg:hidden">{user.name}</p>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <DeskLangSwitch compact />
              <button
                type="button"
                onClick={() => setLeaveOpen(true)}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-ink"
              >
                <SignOut size={16} />
                {t("leave.action")}
              </button>
            </div>
          </div>

          <div className="px-5 pb-3">
            <label className="block">
              <span className="sr-only">{t("hotel.select")}</span>
              <select
                value={hotelId ?? ""}
                onChange={(e) => selectHotel(Number(e.target.value))}
                className="desk-field"
              >
                {hotels.length === 0 ? <option value="">{t("hotel.empty")}</option> : null}
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </label>
            {quota ? <p className="mt-2 text-xs text-muted">{quota}</p> : null}
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
                {t("hotel.add")}
              </button>
            ) : null}
          </div>

          <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
            {links.map((l) => {
              const Icon = l.icon;
              const active = path === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition-[background-color,color] duration-[180ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    active ? "bg-bg text-ink" : "text-muted hover:bg-bg/70 hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {l.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-line px-5 py-4 lg:block">
            <DeskLangSwitch />
            <p className="mt-3 truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted">
              {user.roles[0] === "super-admin" ||
              user.roles[0] === "hotel-manager" ||
              user.roles[0] === "receptionist"
                ? t(`roles.${user.roles[0]}`)
                : user.roles[0]}
            </p>
            <button
              type="button"
              onClick={() => setLeaveOpen(true)}
              className="mt-3 flex items-center gap-2 text-sm text-muted hover:text-ink"
            >
              <SignOut size={16} />
              {t("leave.action")}
            </button>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <HotelCreateContext.Provider
          value={
            isSuperAdmin(user)
              ? () => {
                  setHotelError(null);
                  setHotelOpen(true);
                }
              : null
          }
        >
          {children}
        </HotelCreateContext.Provider>
      </div>
      {leaveOpen ? (
        <DeskDialog
          title={t("leave.title")}
          submitLabel={t("leave.confirm")}
          submitTone="danger"
          onClose={() => setLeaveOpen(false)}
          onSubmit={(event) => {
            event.preventDefault();
            leave();
          }}
        >
          <p className="text-sm text-muted">{t("leave.body")}</p>
        </DeskDialog>
      ) : null}
      {hotelOpen ? (
        <DeskDialog
          title={t("hotel.addTitle")}
          error={hotelError}
          busy={hotelBusy}
          submitLabel={t("hotel.create")}
          onClose={() => setHotelOpen(false)}
          onSubmit={createHotel}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("hotel.addName")}</span>
            <input
              value={hotelName}
              onChange={(e) => setHotelName(e.target.value)}
              className="desk-field"
              required
              autoFocus
            />
          </label>
        </DeskDialog>
      ) : null}
    </div>
  );
}
