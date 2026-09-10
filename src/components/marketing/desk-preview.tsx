"use client";

import { useTranslations } from "next-intl";

export function DeskPreview() {
  const t = useTranslations("deskPreview");
  const tTpl = useTranslations("templates");
  const rows = [
    { code: "1204", guest: "Lan Nguyễn", meta: `${tTpl("dusk")} · ${t("oneTv")}`, action: t("rename") },
    { code: "1208", guest: t("vacant"), meta: t("branding"), action: t("checkIn") },
    { code: "0712", guest: "Minh Trần", meta: `${tTpl("linen")} · ${t("twoTv")}`, action: t("rename") },
  ];

  return (
    <div
      className="overflow-hidden rounded-2xl shadow-[0_30px_70px_rgb(0_0_0/0.4)] ring-1 ring-black/10"
      style={{
        background: "oklch(1 0 0)",
        color: "oklch(0.22 0.025 40)",
        fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
      }}
    >
      <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: "oklch(0.88 0.01 40)" }}>
        <div>
          <p className="text-sm font-medium">{t("rooms")}</p>
          <p className="text-xs" style={{ color: "oklch(0.42 0.02 40)" }}>
            Saigon Pearl
          </p>
        </div>
        <span
          className="rounded-[10px] px-3 py-1.5 text-xs font-medium"
          style={{ background: "oklch(0.55 0.16 40)", color: "oklch(1 0 0)" }}
        >
          {t("checkIn")}
        </span>
      </div>
      <ul>
        {rows.map((row, index) => (
          <li
            key={row.code}
            className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-sm"
            style={{
              borderTop: index === 0 ? undefined : "1px solid oklch(0.88 0.01 40)",
            }}
          >
            <p className="font-medium">{row.code}</p>
            <div className="min-w-0">
              <p className="truncate">{row.guest}</p>
              <p className="text-xs" style={{ color: "oklch(0.42 0.02 40)" }}>
                {row.meta}
              </p>
            </div>
            <span className="rounded-[10px] border px-2.5 py-1 text-xs" style={{ borderColor: "oklch(0.88 0.01 40)" }}>
              {row.action}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
