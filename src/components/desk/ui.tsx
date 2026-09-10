import type { ReactNode } from "react";

export function DeskMain({ children, tight = false }: { children: ReactNode; tight?: boolean }) {
  return <main className={tight ? "px-5 py-4 lg:px-8 lg:py-5" : "px-5 py-6 lg:px-8 lg:py-8"}>{children}</main>;
}

export function DeskHeader({
  title,
  description,
  actions,
  compact = false,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
}) {
  return (
    <header className={`${compact ? "mb-3" : "mb-6"} flex flex-wrap items-end justify-between gap-3`}>
      <div className="min-w-0">
        <h1 className={`${compact ? "text-xl" : "text-[1.65rem]"} font-medium tracking-tight text-balance text-ink`}>
          {title}
        </h1>
        {description ? (
          <p className={`mt-0.5 max-w-[62ch] text-sm text-pretty text-muted ${compact ? "" : "leading-relaxed"}`}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}

export function DeskEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface/70 px-5 py-10 text-sm leading-relaxed text-muted">
      {children}
    </div>
  );
}

export function DeskNotice({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 rounded-xl bg-ok/10 px-4 py-3 text-sm text-ok" role="status">
      {children}
    </p>
  );
}

export function DeskToast({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="fixed right-5 bottom-5 z-[60] rounded-xl bg-ink px-4 py-2.5 text-sm text-bg shadow-[0_10px_28px_rgb(0_0_0_/_0.16)]"
    >
      {children}
    </p>
  );
}

export function DeskError({ children }: { children: ReactNode }) {
  return <p className="mb-4 text-sm text-danger">{children}</p>;
}

export function DeskSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface" />
      ))}
    </div>
  );
}

export function DeskPager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="desk-btn-ghost !px-2 !py-1 text-xs"
      >
        ‹
      </button>
      <span className="min-w-[4.5rem] text-center text-xs text-muted">
        {page}/{pageCount}
      </span>
      <button
        type="button"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
        className="desk-btn-ghost !px-2 !py-1 text-xs"
      >
        ›
      </button>
    </div>
  );
}

export function DeskPanel({ children, className = "", compact = false }: { children: ReactNode; className?: string; compact?: boolean }) {
  return <section className={`desk-panel ${compact ? "space-y-2 !p-3.5" : "space-y-3"} ${className}`}>{children}</section>;
}
