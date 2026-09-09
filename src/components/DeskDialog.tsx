"use client";

import { FormEvent, ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  error?: string | null;
  busy?: boolean;
  wide?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit?: (event: FormEvent) => void;
};

export function DeskDialog({
  title,
  children,
  error,
  busy,
  wide,
  submitLabel = "Lưu",
  onClose,
  onSubmit,
}: Props) {
  const inner = (
    <>
      <h2 className="text-lg font-medium text-wrap-balance">{title}</h2>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="rounded-[10px] px-3 py-2 text-sm text-muted">
          Hủy
        </button>
        {onSubmit ? (
          <button
            type="submit"
            disabled={busy}
            className="rounded-[10px] bg-primary px-4 py-2 text-sm text-primary-ink disabled:opacity-50"
          >
            {busy ? "Đang lưu..." : submitLabel}
          </button>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-20 grid place-items-end bg-ink/40 p-4 md:place-items-center">
      {onSubmit ? (
        <form
          onSubmit={onSubmit}
          className={`w-full space-y-4 rounded-[10px] bg-bg p-5 ${wide ? "max-w-2xl" : "max-w-md"}`}
        >
          {inner}
        </form>
      ) : (
        <div className={`w-full space-y-4 rounded-[10px] bg-bg p-5 ${wide ? "max-w-2xl" : "max-w-md"}`}>
          {inner}
        </div>
      )}
    </div>
  );
}
