"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TemplateEditor } from "@/components/TemplateEditor";
import { WelcomeCanvas } from "@/components/WelcomeCanvas";
import { DeskEmpty, DeskError, DeskHeader, DeskMain, DeskSkeleton, DeskToast } from "@/components/desk/ui";
import { api, type HotelBranding, type WelcomeTemplate, type WelcomeTemplateList } from "@/lib/api";
import { canManageTemplates } from "@/lib/roles";
import { useSession } from "@/lib/session";
import { isWelcomeTemplateKey } from "@/lib/welcomeTemplates";
import { normalizeLayout, resolveBackgroundUrl } from "@/lib/welcomeLayout";

export default function TemplatesPage() {
  const t = useTranslations("desk");
  const tt = useTranslations("templates");
  const { hotelId, ready, user } = useSession();
  const allowed = canManageTemplates(user);
  const [list, setList] = useState<WelcomeTemplateList | null>(null);
  const [branding, setBranding] = useState<HotelBranding | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
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

  const load = useCallback(async () => {
    if (!hotelId || !allowed) return;
    const requestedHotelId = hotelId;
    try {
      const [templates, hotel] = await Promise.all([
        api<{ data: WelcomeTemplateList }>(`/cms/hotels/${requestedHotelId}/welcome-templates`),
        api<{ data: HotelBranding }>(`/cms/hotels/${requestedHotelId}`),
      ]);
      if (hotelIdRef.current !== requestedHotelId) return;
      setList(templates.data);
      setBranding(hotel.data);
      setSelectedKey((cur) => cur ?? templates.data.default_key);
      setError(null);
    } catch {
      if (hotelIdRef.current !== requestedHotelId) return;
      setError(t("templatesPage.loadError"));
      setList({ default_key: "dusk", templates: [] });
    }
  }, [hotelId, allowed, t]);

  useEffect(() => {
    setList(null);
    setBranding(null);
    setSelectedKey(null);
    if (ready && user && hotelId && allowed) void load();
  }, [ready, user, hotelId, allowed, load]);

  async function patchRow(key: string, body: { is_enabled?: boolean; display_name?: string | null }) {
    if (!hotelId) return;
    setBusyKey(key);
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates/${key}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setList(res.data);
      setError(null);
      flashSaved();
    } catch {
      setError(t("templatesPage.saveError"));
    } finally {
      setBusyKey(null);
    }
  }

  async function setDefault(key: string) {
    if (!hotelId) return;
    setBusyKey(key);
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates/default`, {
        method: "PATCH",
        body: JSON.stringify({ key }),
      });
      setList(res.data);
      setError(null);
      flashSaved();
    } catch {
      setError(t("templatesPage.defaultError"));
    } finally {
      setBusyKey(null);
    }
  }

  const selected = list?.templates.find((row) => row.key === selectedKey) ?? list?.templates[0] ?? null;
  const selectedDefault = Boolean(selected && list && list.default_key === selected.key);
  const selectedPlaceholder = selected
    ? isWelcomeTemplateKey(selected.key)
      ? tt(selected.key)
      : selected.built_in_name
    : "";

  return (
    <DeskMain tight>
      <DeskHeader compact title={t("templatesPage.title")} description={t("templatesPage.body")} />
      {error ? <DeskError>{error}</DeskError> : null}
      {!allowed ? (
        <DeskEmpty>{t("templatesPage.forbidden")}</DeskEmpty>
      ) : !hotelId ? (
        <DeskEmpty>{t("templatesPage.noHotel")}</DeskEmpty>
      ) : list === null ? (
        <DeskSkeleton rows={3} />
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {(list.templates ?? []).map((row: WelcomeTemplate) => {
              const isDefault = list.default_key === row.key;
              const placeholder = isWelcomeTemplateKey(row.key) ? tt(row.key) : row.built_in_name;
              const layout = normalizeLayout(row.layout, row.key);
              const active = selected?.key === row.key;
              return (
                <button
                  key={`${hotelId}-${row.key}`}
                  type="button"
                  onClick={() => setSelectedKey(row.key)}
                  className={`w-[7.25rem] shrink-0 rounded-xl border p-1.5 text-left ${
                    active ? "border-primary ring-2 ring-primary/30" : "border-line"
                  }`}
                >
                  <WelcomeCanvas
                    layout={layout}
                    backgroundUrl={resolveBackgroundUrl(layout, row.background_url)}
                    logoUrl={branding?.logo_url}
                    hotelName={branding?.name ?? ""}
                    guestName="Nguyễn Văn A"
                    roomCode="101"
                    compact
                  />
                  <p className="mt-1 truncate text-[11px] font-medium leading-tight">{row.display_name || placeholder}</p>
                  {isDefault ? <p className="text-[10px] text-primary">{t("templatesPage.isDefault")}</p> : null}
                </button>
              );
            })}
          </div>

          {selected ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex min-w-[12rem] flex-1 items-center gap-2 sm:max-w-xs">
                <span className="sr-only">{t("templatesPage.name")}</span>
                <input
                  key={`${hotelId}-${selected.key}-name`}
                  defaultValue={selected.display_name ?? ""}
                  placeholder={selectedPlaceholder}
                  maxLength={40}
                  className="desk-field !py-1.5"
                  disabled={busyKey === selected.key}
                  onBlur={(e) => {
                    const next = e.target.value.trim();
                    const prev = selected.display_name ?? "";
                    if (next === prev) return;
                    void patchRow(selected.key, { display_name: next });
                  }}
                />
              </label>
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={selected.is_enabled}
                  disabled={busyKey === selected.key || selectedDefault}
                  onChange={(e) => void patchRow(selected.key, { is_enabled: e.target.checked })}
                />
                {t("templatesPage.enable")}
              </label>
              <button
                type="button"
                disabled={!selected.is_enabled || selectedDefault || busyKey === selected.key}
                onClick={() => void setDefault(selected.key)}
                className="desk-btn-ghost !px-2.5 !py-1 text-xs"
              >
                {selectedDefault ? t("templatesPage.isDefault") : t("templatesPage.default")}
              </button>
            </div>
          ) : null}

          {selected && hotelId ? (
            <TemplateEditor
              hotelId={hotelId}
              branding={branding}
              row={selected}
              busy={busyKey === selected.key}
              onUpdated={setList}
              onError={setError}
              onSaved={flashSaved}
            />
          ) : (
            <DeskEmpty>{t("templatesPage.loadError")}</DeskEmpty>
          )}
        </div>
      )}
      {toast ? <DeskToast>{toast}</DeskToast> : null}
    </DeskMain>
  );
}
