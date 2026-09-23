"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useHotelCreate } from "@/components/AppShell";
import { DeskDialog } from "@/components/DeskDialog";
import { DeviceEditDialog } from "@/components/DeviceEditDialog";
import { DeviceStrip } from "@/components/DeviceStrip";
import { RoomBackgroundDialog } from "@/components/RoomBackgroundDialog";
import { TemplatePicker } from "@/components/TemplatePicker";
import { DeskEmpty, DeskError, DeskHeader, DeskMain, DeskNotice, DeskPager, DeskSkeleton } from "@/components/desk/ui";
import { useDeskLocale } from "@/components/desk/desk-i18n";
import { api, apiErrorMessage, hotelQuotaLabel, type Device, type Room, type WelcomeTemplate, type WelcomeTemplateList } from "@/lib/api";
import { canManageRooms } from "@/lib/roles";
import { R2_PUBLIC } from "@/lib/r2Public";
import { useSession } from "@/lib/session";
import { templateLabel, type WelcomeTemplateKey } from "@/lib/welcomeTemplates";

type Mode = "idle" | "checkin" | "rename" | "pair" | "create";

export default function RoomsPage() {
  return <RoomsBody />;
}

function RoomsBody() {
  const t = useTranslations("desk");
  const tt = useTranslations("templates");
  const { locale } = useDeskLocale();
  const { hotelId, hotels, ready, user, refreshHotels } = useSession();
  const openHotelCreate = useHotelCreate();
  const [rooms, setRooms] = useState<Room[] | null>(null);
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [backgroundRoom, setBackgroundRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [active, setActive] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pin, setPin] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomKind, setRoomKind] = useState<"guest" | "public">("guest");
  const [busy, setBusy] = useState(false);
  const [templateKey, setTemplateKey] = useState("");
  const [templateList, setTemplateList] = useState<WelcomeTemplateList | null>(null);
  const [templatesFailed, setTemplatesFailed] = useState(false);
  const templateTouchedRef = useRef(false);
  const hotelIdRef = useRef(hotelId);
  hotelIdRef.current = hotelId;
  const [notice, setNotice] = useState<string | null>(null);
  const [pairLink, setPairLink] = useState<string | null>(null);
  const [pairMethod, setPairMethod] = useState<"pin" | "link">("pin");
  const [query, setQuery] = useState("");
  const [occupancy, setOccupancy] = useState<"all" | "occupied" | "vacant">("all");
  const [simTarget, setSimTarget] = useState<0 | 50 | 100>(0);
  const [roomPage, setRoomPage] = useState(1);
  const hotel = hotels.find((item) => item.id === hotelId);
  const canCopyLink = Boolean(hotel?.allows_pairing_links ?? hotel?.pairing_mode === "link");
  const quota = hotelQuotaLabel(hotel, {
    plan: (plan) => t(`plans.${plan}`),
    limited: (values) => t("quotaLimited", values),
    open: (values) => t("quotaOpen", values),
  });
  const named = (key: WelcomeTemplateKey) => tt(key);

  const load = useCallback(async () => {
    if (!hotelId) return;
    const requestedHotelId = hotelId;
    setError(null);
    try {
      const [roomsRes, devicesRes] = await Promise.all([
        api<{ data: Room[] }>(`/cms/hotels/${requestedHotelId}/rooms`),
        api<{ data: Device[] }>(`/cms/hotels/${requestedHotelId}/devices`).catch(() => ({ data: [] as Device[] })),
      ]);
      if (hotelIdRef.current !== requestedHotelId) return;
      setRooms(roomsRes.data);
      setDevices(devicesRes.data);
    } catch {
      if (hotelIdRef.current !== requestedHotelId) return;
      setError(t("rooms.loadError"));
      setRooms([]);
      setDevices([]);
      return;
    }
    try {
      const templates = await api<{ data: WelcomeTemplateList }>(
        `/cms/hotels/${requestedHotelId}/welcome-templates`,
      );
      if (hotelIdRef.current !== requestedHotelId) return;
      setTemplateList(templates.data);
      setTemplatesFailed(false);
    } catch {
      if (hotelIdRef.current !== requestedHotelId) return;
      setTemplateList(null);
      setTemplatesFailed(true);
    }
  }, [hotelId, t]);

  useEffect(() => {
    if (ready && user && hotelId) {
      setTemplateList(null);
      setTemplatesFailed(false);
      templateTouchedRef.current = false;
      void load();
    }
    if (ready && user && !hotelId) {
      setRooms([]);
      setDevices([]);
    }
  }, [ready, user, hotelId, load]);

  useEffect(() => {
    if (!ready || !user || !hotelId) return;
    const timer = window.setInterval(() => {
      const requested = hotelId;
      api<{ data: Device[] }>(`/cms/hotels/${requested}/devices`)
        .then((res) => {
          if (hotelIdRef.current === requested) setDevices(res.data);
        })
        .catch(() => {});
    }, 15000);
    return () => window.clearInterval(timer);
  }, [ready, user, hotelId]);

  useEffect(() => {
    if (!templateList || templateTouchedRef.current) return;
    if (mode === "checkin") {
      setTemplateKey(templateList.default_key);
    } else if (mode === "rename") {
      setTemplateKey(active?.current_welcome?.template_key ?? templateList.default_key);
    }
  }, [templateList, mode, active]);

  useEffect(() => {
    if (mode !== "pair" || pairMethod !== "link" || !canCopyLink || !hotelId || !active) return;
    let cancelled = false;
    setPairLink(null);
    setBusy(true);
    setError(null);
    api<{ data: { url: string } }>(`/cms/hotels/${hotelId}/pairing-links`, {
      method: "POST",
      body: JSON.stringify({ room_id: active.id }),
    })
      .then((res) => {
        if (!cancelled) setPairLink(res.data.url);
      })
      .catch((err) => {
        if (!cancelled) setError(apiErrorMessage(err, t("rooms.linkError")));
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, pairMethod, canCopyLink, hotelId, active, t]);

  function open(next: Mode, room: Room) {
    if (room.id < 0) {
      setNotice(t("rooms.simFake"));
      return;
    }
    setEditingDevice(null);
    setBackgroundRoom(null);
    setActive(room);
    setMode(next);
    setName(room.current_welcome?.guest_display_name ?? "");
    setMessage(room.current_welcome?.message ?? t("rooms.defaultWelcome"));
    setPin("");
    setPairLink(null);
    setPairMethod("pin");
    setError(null);
    setNotice(null);
    templateTouchedRef.current = false;
    if (next === "checkin") {
      if (templateList) setTemplateKey(templateList.default_key);
    } else if (next === "rename") {
      const current = room.current_welcome?.template_key ?? templateList?.default_key;
      if (current) setTemplateKey(current);
    }
  }

  function openDevice(device: Device) {
    if (device.id < 0) {
      setNotice(t("rooms.simFake"));
      return;
    }
    setMode("idle");
    setActive(null);
    setBackgroundRoom(null);
    setEditingDevice(device);
    setError(null);
    setNotice(null);
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
            built_in_name: templateLabel(current, [], named),
            display_name: null,
            label: templateLabel(current, [], named),
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
            locale,
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
        if (pairMethod === "link") {
          if (!pairLink) return;
          await navigator.clipboard.writeText(pairLink);
          setNotice(t("rooms.copied", { code: active.code }));
          setMode("idle");
          return;
        }
        await api(`/cms/hotels/${hotelId}/pairing-codes/claim`, {
          method: "POST",
          body: JSON.stringify({ code: pin.trim().toUpperCase(), room_id: active.id }),
        });
        const nextCount = (active.paired_tv_count ?? 0) + 1;
        setNotice(t("rooms.paired", { code: active.code, count: nextCount }));
      }
      setMode("idle");
      await load();
      if (mode === "pair") await refreshHotels(hotelId ?? undefined);
    } catch (err) {
      setError(apiErrorMessage(err, t("rooms.actionError")));
    } finally {
      setBusy(false);
    }
  }

  async function checkout(room: Room) {
    if (!hotelId || room.id < 0) {
      if (room.id < 0) setNotice(t("rooms.simFake"));
      return;
    }
    setBusy(true);
    try {
      await api(`/cms/hotels/${hotelId}/rooms/${room.id}/checkout`, { method: "POST" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  const sourceRooms = useMemo(
    () => (rooms ? (simTarget ? padSimulatedRooms(rooms, simTarget) : rooms) : []),
    [rooms, simTarget],
  );

  const listed = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("vi-VN");
    return sourceRooms.filter((room) => {
      const occupied = Boolean(room.current_welcome_id);
      if (occupancy === "occupied" && !occupied) return false;
      if (occupancy === "vacant" && occupied) return false;
      if (!q) return true;
      const hay = [room.code, room.name, room.current_welcome?.guest_display_name]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi-VN");
      return hay.includes(q);
    });
  }, [sourceRooms, query, occupancy]);

  const occupiedCount = listed.filter((room) => room.current_welcome_id).length;
  const roomPageSize = 20;
  const roomPageCount = Math.max(1, Math.ceil(listed.length / roomPageSize));
  const safeRoomPage = Math.min(roomPage, roomPageCount);
  const pageRooms = listed.slice((safeRoomPage - 1) * roomPageSize, safeRoomPage * roomPageSize);
  const groups = useMemo(() => groupByFloor(pageRooms, listed.length >= 20), [pageRooms, listed.length]);

  const shownDevices = useMemo(() => {
    if (!simTarget || !rooms) return devices;
    const face = devices?.find((item) => item.screen)?.screen?.hotel ?? {
      id: hotelId ?? 0,
      name: hotel?.name ?? "",
      logo_url: null as string | null,
    };
    return mergeSimulatedDevices(devices ?? [], sourceRooms, face);
  }, [simTarget, rooms, devices, sourceRooms, hotelId, hotel]);

  useEffect(() => {
    setRoomPage(1);
  }, [query, occupancy, simTarget]);

  const dialogTitle =
    mode === "create"
      ? t("rooms.createTitle")
      : mode === "checkin"
        ? t("rooms.checkInTitle", { code: active?.code ?? "" })
        : mode === "rename"
          ? t("rooms.renameTitle", { code: active?.code ?? "" })
          : mode === "pair"
            ? t("rooms.pairTitle", { code: active?.code ?? "" })
            : "";

  const templatesPending = templateList === null && !templatesFailed;
  const pairCountHint = active?.paired_tv_count
    ? t("rooms.linkHintCount", { count: active.paired_tv_count })
    : "";

  return (
    <DeskMain tight>
      <DeskHeader
        compact
        title={t("rooms.title")}
        description={`${t("rooms.body")}${quota ? ` ${quota}.` : ""}`}
        actions={
          <>
            {openHotelCreate ? (
              <button type="button" onClick={openHotelCreate} className="desk-btn-ghost !px-2.5 !py-1 text-xs">
                {t("hotel.add")}
              </button>
            ) : null}
            {canManageRooms(user) && hotelId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingDevice(null);
                  setBackgroundRoom(null);
                  setMode("create");
                  setActive(null);
                  setRoomCode("");
                  setRoomName("");
                  setRoomKind("guest");
                  setError(null);
                }}
                className="desk-btn-primary !px-2.5 !py-1 text-xs"
              >
                {t("rooms.add")}
              </button>
            ) : null}
            <button type="button" onClick={() => void load()} disabled={!hotelId} className="desk-btn-ghost !px-2.5 !py-1 text-xs">
              {t("reload")}
            </button>
          </>
        }
      />

      {notice ? <DeskNotice>{notice}</DeskNotice> : null}
      {error && mode === "idle" ? <DeskError>{error}</DeskError> : null}

      {!hotelId ? (
        <DeskEmpty>
          {openHotelCreate ? (
            <>
              {t("rooms.noHotelCreate")}{" "}
              <button type="button" onClick={openHotelCreate} className="text-ink underline">
                {t("hotel.add")}
              </button>{" "}
              {t("rooms.noHotelThenRooms")}
            </>
          ) : (
            t("rooms.noHotelAssigned")
          )}
        </DeskEmpty>
      ) : rooms === null ? (
        <>
          <DeviceStrip devices={shownDevices} onSelect={openDevice} />
          <DeskSkeleton />
        </>
      ) : rooms.length === 0 ? (
        <>
          <DeviceStrip devices={shownDevices} onSelect={openDevice} />
          <DeskEmpty>
            {canManageRooms(user)
              ? t("rooms.noRoomsManage", { hotel: hotels.find((h) => h.id === hotelId)?.name ?? "" })
              : t("rooms.noRoomsStaff")}
          </DeskEmpty>
        </>
      ) : (
        <>
          <DeviceStrip devices={shownDevices} onSelect={openDevice} />
          {simTarget ? <DeskNotice>{t("rooms.simBanner", { count: simTarget })}</DeskNotice> : null}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="desk-field !max-w-xs !py-1.5"
              placeholder={t("rooms.search")}
            />
            <div className="flex flex-wrap gap-1">
              {(["all", "occupied", "vacant"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setOccupancy(key)}
                  className={occupancy === key ? "desk-btn-primary !px-2.5 !py-1 text-xs" : "desk-btn-ghost !px-2.5 !py-1 text-xs"}
                >
                  {t(`rooms.filter.${key}`)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {([0, 50, 100] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSimTarget(n)}
                  className={simTarget === n ? "desk-btn-primary !px-2.5 !py-1 text-xs" : "desk-btn-ghost !px-2.5 !py-1 text-xs"}
                >
                  {n === 0 ? t("rooms.simReal") : t("rooms.simCount", { count: n })}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted">
              {t("rooms.summary", { total: listed.length, occupied: occupiedCount, vacant: listed.length - occupiedCount })}
            </p>
            <DeskPager page={safeRoomPage} pageCount={roomPageCount} onPage={setRoomPage} />
          </div>
          {listed.length === 0 ? (
            <DeskEmpty>{t("rooms.noMatch")}</DeskEmpty>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <section key={group.key}>
                  {group.key !== "all" ? (
                    <h2 className="mb-1 text-xs font-medium text-muted">
                      {group.key === "public"
                        ? t("rooms.publicKind")
                        : group.key === "other"
                          ? t("rooms.floorOther")
                          : t("rooms.floor", { n: group.key })}
                    </h2>
                  ) : null}
                  <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
                    {group.rooms.map((room) => {
                      const occupied = Boolean(room.current_welcome_id);
                      const simulated = room.id < 0;
                      return (
                        <li
                          id={`room-${room.id}`}
                          key={room.id}
                          className={`grid gap-2 px-3 py-2 md:grid-cols-[5.5rem_minmax(0,1fr)_auto] md:items-center ${
                            simulated ? "bg-surface/50" : "bg-bg"
                          }`}
                        >
                          <div className="min-w-0">
                            <p className="font-medium leading-tight">{room.code}</p>
                            <p className="text-[11px] text-muted">
                              {(room.paired_tv_count ?? 0) > 0
                                ? t("rooms.tvCount", { count: room.paired_tv_count ?? 0 })
                                : t("rooms.noTv")}
                            </p>
                          </div>
                          <div className="min-w-0">
                            {occupied ? (
                              <p className="truncate text-sm">
                                {room.current_welcome?.guest_display_name}
                                {room.current_welcome?.template_key ? (
                                  <span className="text-muted">
                                    {" · "}
                                    {templateLabel(room.current_welcome.template_key, templateList?.templates ?? [], named)}
                                  </span>
                                ) : null}
                              </p>
                            ) : (
                              <p className="text-sm text-muted">{t("rooms.vacant")}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {occupied ? (
                              <>
                                <button
                                  type="button"
                                  disabled={templatesPending}
                                  onClick={() => open("rename", room)}
                                  className="desk-btn-ghost !px-2 !py-1 text-xs"
                                >
                                  {t("rooms.rename")}
                                </button>
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => void checkout(room)}
                                  className="desk-btn-ghost !px-2 !py-1 text-xs"
                                >
                                  {t("rooms.checkout")}
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                disabled={templatesPending}
                                onClick={() => open("checkin", room)}
                                className="desk-btn-primary !px-2 !py-1 text-xs"
                              >
                                {t("rooms.checkIn")}
                              </button>
                            )}
                            <button type="button" onClick={() => open("pair", room)} className="desk-btn-ghost !px-2 !py-1 text-xs">
                              {t("rooms.pair")}
                            </button>
                            {canManageRooms(user) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  if (room.id < 0) {
                                    setNotice(t("rooms.simFake"));
                                    return;
                                  }
                                  setMode("idle");
                                  setEditingDevice(null);
                                  setBackgroundRoom(room);
                                }}
                                className="desk-btn-ghost !px-2 !py-1 text-xs"
                              >
                                {t("rooms.bg")}
                              </button>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
          {listed.length > 20 ? (
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-xs text-muted">{t("rooms.page", { page: safeRoomPage, pages: roomPageCount })}</p>
              <DeskPager page={safeRoomPage} pageCount={roomPageCount} onPage={setRoomPage} />
            </div>
          ) : null}
        </>
      )}

      {mode !== "idle" ? (
        <DeskDialog
          title={dialogTitle}
          error={error}
          busy={busy}
          wide={mode === "checkin" || mode === "rename"}
          submitLabel={
            mode === "create"
              ? t("rooms.createSubmit")
              : mode === "pair"
                ? pairMethod === "link"
                  ? t("rooms.copyLink")
                  : t("rooms.pairPin")
                : t("save")
          }
          onClose={() => setMode("idle")}
          onSubmit={submit}
        >
          {mode === "create" ? (
            <>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("rooms.code")}</span>
                <input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="desk-field"
                  placeholder="101"
                  required
                  autoFocus
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("rooms.nick")}</span>
                <input
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="desk-field"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("rooms.kind")}</span>
                <select
                  value={roomKind}
                  onChange={(e) => setRoomKind(e.target.value as "guest" | "public")}
                  className="desk-field"
                >
                  <option value="guest">{t("rooms.guestKind")}</option>
                  <option value="public">{t("rooms.publicKind")}</option>
                </select>
              </label>
            </>
          ) : mode === "pair" ? (
            <>
              {canCopyLink ? (
                <div className="flex flex-wrap gap-1" role="tablist" aria-label={t("rooms.pairMethodLabel")}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pairMethod === "pin"}
                    onClick={() => {
                      setError(null);
                      setPairMethod("pin");
                    }}
                    className={pairMethod === "pin" ? "desk-btn-primary !px-2.5 !py-1 text-xs" : "desk-btn-ghost !px-2.5 !py-1 text-xs"}
                  >
                    {t("rooms.pairMethodPin")}
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={pairMethod === "link"}
                    onClick={() => {
                      setError(null);
                      setPairMethod("link");
                    }}
                    className={pairMethod === "link" ? "desk-btn-primary !px-2.5 !py-1 text-xs" : "desk-btn-ghost !px-2.5 !py-1 text-xs"}
                  >
                    {t("rooms.pairMethodLink")}
                  </button>
                </div>
              ) : null}
              {pairMethod === "link" && canCopyLink ? (
                <>
                  <p className="text-sm text-muted">{t("rooms.linkHint", { count: pairCountHint })}</p>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">{t("rooms.linkLabel")}</span>
                    <input
                      value={pairLink ?? (busy ? t("rooms.linkBusy") : "")}
                      readOnly
                      className="desk-field font-mono text-sm"
                    />
                  </label>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted">{t("rooms.pinHint", { count: pairCountHint })}</p>
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">{t("rooms.pinLabel")}</span>
                    <input
                      value={pin}
                      onChange={(e) => setPin(e.target.value.toUpperCase())}
                      className="desk-field font-mono tracking-[0.2em]"
                      maxLength={8}
                      required
                    />
                  </label>
                </>
              )}
            </>
          ) : (
            <>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("rooms.displayName")}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="desk-field" required />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">{t("rooms.message")}</span>
                <input value={message} onChange={(e) => setMessage(e.target.value)} className="desk-field" />
              </label>
              {templatesFailed ? (
                <p className="text-sm text-muted">{t("rooms.templatesFail")}</p>
              ) : templateList ? (
                <TemplatePicker
                  templates={pickerTemplates()}
                  value={templateKey}
                  onChange={(key) => {
                    templateTouchedRef.current = true;
                    setTemplateKey(key);
                  }}
                />
              ) : null}
            </>
          )}
        </DeskDialog>
      ) : null}
      {backgroundRoom && hotelId ? (
        <RoomBackgroundDialog
          hotelId={hotelId}
          room={backgroundRoom}
          onClose={() => setBackgroundRoom(null)}
          onSaved={() => load()}
        />
      ) : null}
      {editingDevice && hotelId ? (
        <DeviceEditDialog
          hotelId={hotelId}
          hotel={hotel}
          device={editingDevice}
          rooms={rooms ?? []}
          canUnpair={canManageRooms(user)}
          onClose={() => setEditingDevice(null)}
          onSaved={() => load()}
        />
      ) : null}
    </DeskMain>
  );
}

const SIM_GUESTS = ["Nguyễn Lan", "Trần Minh", "Phạm Hương", "Lê Khoa", "Võ An", "Đặng My", "Bùi Phong", "Hoàng Hà"];
const SIM_KEYS = ["dusk", "linen", "harbor", "garden", "stone", "vista"] as const;

function padSimulatedRooms(real: Room[], target: number): Room[] {
  if (real.length >= target) return real;
  const hotelId = real[0]?.hotel_id ?? 0;
  const used = new Set(real.map((room) => room.code));
  const extra: Room[] = [];
  let seq = 101;
  while (real.length + extra.length < target) {
    const code = String(seq);
    seq += 1;
    if (used.has(code)) continue;
    used.add(code);
    const i = extra.length;
    const vacant = i % 10 === 0 || i % 10 === 3 || i % 10 === 7;
    const guest = SIM_GUESTS[i % SIM_GUESTS.length];
    extra.push({
      id: -seq,
      hotel_id: hotelId,
      code,
      name: null,
      kind: code.endsWith("00") ? "public" : "guest",
      current_welcome_id: vacant ? null : 1,
      content_revision: 1,
      paired_tv_count: i % 4 === 0 ? 0 : i % 4 === 1 ? 2 : 1,
      current_welcome: vacant
        ? null
        : {
            guest_display_name: guest,
            message: "Chào mừng quý khách",
            locale: "vi",
            template_key: SIM_KEYS[i % SIM_KEYS.length],
          },
    });
  }
  return [...real, ...extra].sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
}

function mergeSimulatedDevices(
  real: Device[],
  rooms: Room[],
  hotel: { id: number; name: string; logo_url: string | null },
): Device[] {
  const extras: Device[] = [];
  for (const room of rooms) {
    if (room.id > 0) continue;
    const count = room.paired_tv_count ?? 0;
    for (let i = 0; i < count; i += 1) {
      extras.push({
        id: room.id * 10 - i,
        name: count > 1 ? `TV ${room.code}-${i + 1}` : `TV ${room.code}`,
        status: "paired",
        room_id: room.id,
        room_code: room.code,
        online: i === 0,
        screen: {
          hotel,
          room: { id: room.id, code: room.code, kind: room.kind },
          guest: room.current_welcome
            ? {
                display_name: room.current_welcome.guest_display_name,
                message: room.current_welcome.message,
                locale: room.current_welcome.locale,
              }
            : null,
          template: room.current_welcome?.template_key
            ? { key: room.current_welcome.template_key, mode: "look", layout: null }
            : { key: "dusk", mode: "look", layout: null },
          media: {
            background_url: `${R2_PUBLIC}/landing/gallery/garden.jpg`,
            kind: "image",
          },
        },
      });
    }
  }
  return [...real.filter((device) => device.status === "paired"), ...extras];
}

function floorKey(room: Room): string {
  if (room.kind === "public") return "public";
  const match = room.code.match(/^(\d+)(\d{2})$/);
  return match ? match[1] : "other";
}

function groupByFloor(rooms: Room[], grouped: boolean): { key: string; rooms: Room[] }[] {
  if (!grouped) return [{ key: "all", rooms }];
  const map = new Map<string, Room[]>();
  for (const room of rooms) {
    const key = floorKey(room);
    const list = map.get(key) ?? [];
    list.push(room);
    map.set(key, list);
  }
  const keys = [...map.keys()].sort((a, b) => {
    if (a === "public") return 1;
    if (b === "public") return -1;
    if (a === "other") return 1;
    if (b === "other") return -1;
    return Number(a) - Number(b);
  });
  return keys.map((key) => ({ key, rooms: map.get(key) ?? [] }));
}
