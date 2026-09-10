"use client";

import { FormEvent, ReactNode, useEffect } from "react";
import { useTranslations } from "next-intl";

type Props = {
  title: string;
  children: ReactNode;
  error?: string | null;
  busy?: boolean;
  wide?: boolean;
  submitLabel?: string;
  submitTone?: "primary" | "danger";
  onClose: () => void;
  onSubmit?: (event: FormEvent) => void;
};

export function DeskDialog({
  title,
  children,
  error,
  busy,
  wide,
  submitLabel,
  submitTone = "primary",
  onClose,
  onSubmit,
}: Props) {
  const t = useTranslations("desk");

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const inner = (
    <>
      <h2 id="desk-dialog-title" className="text-lg font-medium text-balance">
        {title}
      </h2>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="desk-btn-ghost">
          {t("cancel")}
        </button>
        {onSubmit ? (
          <button
            type="submit"
            disabled={busy}
            className={submitTone === "danger" ? "desk-btn-danger" : "desk-btn-primary"}
          >
            {busy ? t("saving") : (submitLabel ?? t("save"))}
          </button>
        ) : null}
      </div>
    </>
  );

  const panelClass = `w-full space-y-4 rounded-2xl border border-line bg-bg p-5 shadow-[0_24px_60px_color-mix(in_oklch,var(--ink)_12%,transparent)] ${
    wide ? "max-w-2xl" : "max-w-md"
  }`;

  return (
    <div
      className="fixed inset-0 z-[var(--z-overlay)] grid place-items-end bg-ink/40 p-4 md:place-items-center"
      onClick={onClose}
      role="presentation"
    >
      {onSubmit ? (
        <form
          onSubmit={onSubmit}
          onClick={(event) => event.stopPropagation()}
          className={panelClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="desk-dialog-title"
        >
          {inner}
        </form>
      ) : (
        <div
          onClick={(event) => event.stopPropagation()}
          className={panelClass}
          role="dialog"
          aria-modal="true"
          aria-labelledby="desk-dialog-title"
        >
          {inner}
        </div>
      )}
    </div>
  );
}
