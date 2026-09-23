"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { WelcomeCanvas } from "@/components/WelcomeCanvas";
import { api, ApiError, type HotelBranding, type WelcomeTemplate, type WelcomeTemplateList } from "@/lib/api";
import {
  COPY_LIMITS,
  GALLERY,
  GALLERY_IDS,
  SIZE_LIMITS,
  TEMPLATE_FONTS,
  TEMPLATE_TONES,
  layoutSignature,
  normalizeLayout,
  resolveBackgroundUrl,
  type SlotKey,
  type TemplateFont,
  type TemplateTone,
  type WelcomeLayout,
} from "@/lib/welcomeLayout";

type Props = {
  hotelId: number;
  branding: HotelBranding | null;
  row: WelcomeTemplate;
  busy: boolean;
  onUpdated: (list: WelcomeTemplateList) => void;
  onError: (message: string) => void;
  onSaved?: () => void;
};

export function TemplateEditor({ hotelId, branding, row, busy, onUpdated, onError, onSaved }: Props) {
  const t = useTranslations("desk");
  const [layout, setLayout] = useState<WelcomeLayout>(() => normalizeLayout(row.layout, row.key));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const savedRef = useRef(layoutSignature(normalizeLayout(row.layout, row.key)));
  const timer = useRef<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const next = normalizeLayout(row.layout, row.key);
    setLayout(next);
    savedRef.current = layoutSignature(next);
    setStatus("idle");
  }, [row.key]);

  function queueSave(next: WelcomeLayout) {
    setLayout(next);
    if (layoutSignature(next) === savedRef.current) return;
    setStatus("saving");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void persist(next);
    }, 450);
  }

  async function persist(next: WelcomeLayout) {
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates/${row.key}`, {
        method: "PATCH",
        body: JSON.stringify({ layout: next }),
      });
      savedRef.current = layoutSignature(next);
      onUpdated(res.data);
      setStatus("saved");
      onSaved?.();
    } catch (err) {
      onError(err instanceof ApiError ? t("templatesPage.saveError") : t("templatesPage.network"));
      setStatus("idle");
    }
  }

  async function upload(file: File) {
    const body = new FormData();
    body.append("file", file);
    try {
      const res = await api<{ data: WelcomeTemplateList }>(
        `/cms/hotels/${hotelId}/welcome-templates/${row.key}/media`,
        { method: "POST", body },
      );
      onUpdated(res.data);
      setStatus("saved");
      onSaved?.();
    } catch (err) {
      onError(err instanceof ApiError ? t("editor.uploadError") : t("templatesPage.network"));
    }
  }

  async function clearUpload() {
    try {
      const res = await api<{ data: WelcomeTemplateList }>(
        `/cms/hotels/${hotelId}/welcome-templates/${row.key}/media`,
        { method: "DELETE" },
      );
      onUpdated(res.data);
      setStatus("saved");
      onSaved?.();
    } catch {
      onError(t("editor.clearError"));
    }
  }

  function patch(partial: Partial<WelcomeLayout>) {
    queueSave({ ...layout, ...partial });
  }

  function onSlotChange(key: SlotKey, next: { x: number; y: number }) {
    const x = Math.max(0, Math.min(92, Math.round(next.x * 10) / 10));
    const y = Math.max(0, Math.min(92, Math.round(next.y * 10) / 10));
    queueSave({
      ...layout,
      slots: {
        ...layout.slots,
        [key]: { ...layout.slots[key], x, y },
      },
    });
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void upload(file);
  }

  const backgroundUrl = resolveBackgroundUrl(layout, row.background_url);
  const wifi = branding?.wifi_ssid ? { ssid: branding.wifi_ssid, password: branding.wifi_password } : null;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start lg:gap-4">
      <div className="min-w-0">
        <div className="overflow-hidden rounded-xl border border-line bg-black">
          <WelcomeCanvas
            layout={layout}
            backgroundUrl={backgroundUrl}
            logoUrl={branding?.logo_url}
            hotelName={branding?.name ?? ""}
            guestName="Nguyễn Văn A"
            roomCode="101"
            wifi={wifi}
            interactive
            onSlotChange={onSlotChange}
            onCopyVisibleChange={(visible) =>
              queueSave({
                ...layout,
                slots: { ...layout.slots, message: { ...layout.slots.message, visible } },
              })
            }
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">{t("editor.dragHint")}</p>
      </div>

      <div className="mt-3 space-y-3 lg:mt-0 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto lg:pr-1">
        <fieldset>
          <legend className="mb-1.5 text-xs font-medium">{t("editor.gallery")}</legend>
          <div className="grid grid-cols-4 gap-1">
            {GALLERY_IDS.map((id) => {
              const selected = layout.background.source === "gallery" && layout.background.gallery_id === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    patch({
                      background: { source: "gallery", gallery_id: id },
                    })
                  }
                  className={`overflow-hidden rounded-md border ${selected ? "border-primary ring-1 ring-primary/30" : "border-line"}`}
                >
                  <img src={GALLERY[id].url} alt={t(`editor.galleryIds.${id}`)} className="aspect-video w-full object-cover" />
                </button>
              );
            })}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} />
            <button type="button" className="desk-btn-ghost !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => fileRef.current?.click()}>
              {t("editor.upload")}
            </button>
            {layout.background.source === "upload" ? (
              <button type="button" className="desk-btn-ghost !px-2.5 !py-1 text-xs" disabled={busy} onClick={() => void clearUpload()}>
                {t("editor.clearUpload")}
              </button>
            ) : null}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-2">
          <label className="block space-y-1">
            <span className="text-xs font-medium">{t("editor.tone")}</span>
            <select
              className="desk-field !py-1.5"
              value={layout.tone}
              disabled={busy}
              onChange={(e) => patch({ tone: e.target.value as TemplateTone })}
            >
              {TEMPLATE_TONES.map((tone) => (
                <option key={tone} value={tone}>
                  {t(`editor.tones.${tone}`)}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium">{t("editor.font")}</span>
            <select
              className="desk-field !py-1.5"
              value={layout.font}
              disabled={busy}
              onChange={(e) => patch({ font: e.target.value as TemplateFont })}
            >
              {TEMPLATE_FONTS.map((font) => (
                <option key={font} value={font}>
                  {t(`editor.fonts.${font}`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-xs font-medium">{t("editor.slogan")}</span>
          <input
            className="desk-field !py-1.5"
            maxLength={COPY_LIMITS.slogan}
            value={layout.slogan}
            disabled={busy}
            onChange={(e) => patch({ slogan: e.target.value.slice(0, COPY_LIMITS.slogan) })}
          />
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium">{t("editor.copyTitle")}</p>
            <button
              type="button"
              disabled={busy}
              aria-pressed={layout.slots.message.visible === false}
              aria-label={layout.slots.message.visible === false ? t("editor.showCopy") : t("editor.hideCopy")}
              title={layout.slots.message.visible === false ? t("editor.showCopy") : t("editor.hideCopy")}
              onClick={() =>
                queueSave({
                  ...layout,
                  slots: {
                    ...layout.slots,
                    message: { ...layout.slots.message, visible: layout.slots.message.visible === false },
                  },
                })
              }
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted transition-colors hover:bg-line/60 hover:text-ink disabled:opacity-50"
            >
              {layout.slots.message.visible === false ? (
                <>
                  <Eye size={16} weight="regular" />
                  <span>{t("editor.show")}</span>
                </>
              ) : (
                <>
                  <EyeSlash size={16} weight="regular" />
                  <span>{t("editor.hide")}</span>
                </>
              )}
            </button>
          </div>
          <label className="block space-y-1">
            <span className="text-xs text-muted">{t("editor.leadLabel")}</span>
            <input
              className={`desk-field !py-1.5 ${layout.slots.message.visible === false ? "opacity-50" : ""}`}
              maxLength={COPY_LIMITS.lead}
              value={layout.lead}
              disabled={busy}
              placeholder={t("editor.lead")}
              aria-label={t("editor.leadLabel")}
              onChange={(e) => patch({ lead: e.target.value.slice(0, COPY_LIMITS.lead) })}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-muted">{t("editor.wishLabel")}</span>
            <input
              className={`desk-field !py-1.5 ${layout.slots.message.visible === false ? "opacity-50" : ""}`}
              maxLength={COPY_LIMITS.wish}
              value={layout.wish}
              disabled={busy}
              placeholder={t("editor.wish")}
              aria-label={t("editor.wishLabel")}
              onChange={(e) => patch({ wish: e.target.value.slice(0, COPY_LIMITS.wish) })}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <VisibilityBox
            label={t("editor.showLogo")}
            checked={layout.slots.logo.visible !== false}
            onChange={(visible) =>
              queueSave({ ...layout, slots: { ...layout.slots, logo: { ...layout.slots.logo, visible } } })
            }
          />
          <VisibilityBox
            label={t("editor.showSlogan")}
            checked={layout.slots.slogan.visible !== false}
            onChange={(visible) =>
              queueSave({ ...layout, slots: { ...layout.slots, slogan: { ...layout.slots.slogan, visible } } })
            }
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium">{t("editor.sizesTitle")}</p>
          <SizeField
            label={t("editor.sizeLogo")}
            value={layout.sizes.logo}
            min={SIZE_LIMITS.logo.min}
            max={SIZE_LIMITS.logo.max}
            disabled={busy}
            onChange={(logo) => patch({ sizes: { ...layout.sizes, logo } })}
          />
          <SizeField
            label={t("editor.sizeName")}
            value={layout.sizes.name}
            min={SIZE_LIMITS.name.min}
            max={SIZE_LIMITS.name.max}
            disabled={busy}
            onChange={(name) => patch({ sizes: { ...layout.sizes, name } })}
          />
          <SizeField
            label={t("editor.sizeSlogan")}
            value={layout.sizes.slogan}
            min={SIZE_LIMITS.slogan.min}
            max={SIZE_LIMITS.slogan.max}
            disabled={busy}
            onChange={(slogan) => patch({ sizes: { ...layout.sizes, slogan } })}
          />
          <SizeField
            label={t("editor.sizeMessage")}
            value={layout.sizes.message}
            min={SIZE_LIMITS.message.min}
            max={SIZE_LIMITS.message.max}
            disabled={busy}
            onChange={(message) => patch({ sizes: { ...layout.sizes, message } })}
          />
          <SizeField
            label={t("editor.sizeRoom")}
            value={layout.sizes.room}
            min={SIZE_LIMITS.room.min}
            max={SIZE_LIMITS.room.max}
            disabled={busy}
            onChange={(room) => patch({ sizes: { ...layout.sizes, room } })}
          />
          <SizeField
            label={t("editor.sizeWifi")}
            value={layout.sizes.wifi}
            min={SIZE_LIMITS.wifi.min}
            max={SIZE_LIMITS.wifi.max}
            disabled={busy}
            onChange={(wifi) => patch({ sizes: { ...layout.sizes, wifi } })}
          />
          <SizeField
            label={t("editor.sizeWifiPassword")}
            value={layout.sizes.wifiPassword}
            min={SIZE_LIMITS.wifiPassword.min}
            max={SIZE_LIMITS.wifiPassword.max}
            disabled={busy}
            onChange={(wifiPassword) => patch({ sizes: { ...layout.sizes, wifiPassword } })}
          />
          <SizeField
            label={t("editor.sizeTime")}
            value={layout.sizes.time}
            min={SIZE_LIMITS.time.min}
            max={SIZE_LIMITS.time.max}
            disabled={busy}
            onChange={(time) => patch({ sizes: { ...layout.sizes, time } })}
          />
          <SizeField
            label={t("editor.sizeClock")}
            value={layout.sizes.clock}
            min={SIZE_LIMITS.clock.min}
            max={SIZE_LIMITS.clock.max}
            disabled={busy}
            onChange={(clock) => patch({ sizes: { ...layout.sizes, clock } })}
          />
          <SizeField
            label={t("editor.sizeWeather")}
            value={layout.sizes.weather}
            min={SIZE_LIMITS.weather.min}
            max={SIZE_LIMITS.weather.max}
            disabled={busy}
            onChange={(weather) => patch({ sizes: { ...layout.sizes, weather } })}
          />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium">{t("editor.colorsTitle")}</p>
          <ColorField
            label={t("editor.colorName")}
            value={layout.colors.name}
            disabled={busy}
            onChange={(name) => patch({ colors: { ...layout.colors, name } })}
          />
          <ColorField
            label={t("editor.colorSlogan")}
            value={layout.colors.slogan}
            disabled={busy}
            onChange={(slogan) => patch({ colors: { ...layout.colors, slogan } })}
          />
          <ColorField
            label={t("editor.colorMuted")}
            value={layout.colors.muted}
            disabled={busy}
            onChange={(muted) => patch({ colors: { ...layout.colors, muted } })}
          />
        </div>
        <p className="sr-only" aria-live="polite">
          {status === "saving" ? t("editor.saving") : status === "saved" ? t("editor.saved") : ""}
        </p>
      </div>
    </div>
  );
}

const TEXT_SWATCHES = ["#ffffff", "#f4efe6", "#e8dfd0", "#3a2a1c", "#243028", "#111111"];

function SizeField({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-[7.25rem] shrink-0 text-xs text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.1}
        value={value}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="desk-range !h-4 min-w-0 flex-1"
      />
    </label>
  );
}

function parseHex(raw: string): string | null {
  const next = raw.trim().toLowerCase();
  if (/^#([0-9a-f]{6})$/.test(next)) return next;
  if (/^#([0-9a-f]{3})$/.test(next)) {
    const [r, g, b] = next.slice(1).split("");
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

function ColorField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const hex = parseHex(value) ?? "#f4efe6";
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  function commit(next: string) {
    const parsed = parseHex(next);
    if (parsed) {
      setDraft(parsed);
      onChange(parsed);
      return;
    }
    setDraft(hex);
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-[4.75rem] shrink-0 text-xs text-muted">{label}</span>
      <input
        type="color"
        value={hex}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => commit(e.target.value)}
        className="h-7 w-7 shrink-0 cursor-pointer rounded-md border border-line bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60 [&::-moz-color-swatch]:rounded-[4px] [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <input
        type="text"
        inputMode="text"
        spellCheck={false}
        maxLength={7}
        value={draft}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value.trim();
          setDraft(next);
          const parsed = parseHex(next);
          if (parsed) onChange(parsed);
        }}
        onBlur={(e) => commit(e.target.value)}
        className="desk-field !w-[5.75rem] !py-1 font-mono text-xs uppercase"
        placeholder="#F4EFE6"
      />
      <div className="flex min-w-0 flex-1 flex-wrap gap-1">
        {TEXT_SWATCHES.map((swatch) => (
          <button
            key={`${label}-${swatch}`}
            type="button"
            aria-label={swatch}
            disabled={disabled}
            onClick={() => commit(swatch)}
            className={`size-4 rounded-full border ${hex === swatch ? "border-primary ring-1 ring-primary/30" : "border-line"}`}
            style={{ background: swatch }}
          />
        ))}
      </div>
    </div>
  );
}

function VisibilityBox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
