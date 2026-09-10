import type { ReactNode } from "react";

export function TvFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="absolute inset-[10%] -z-10 bg-[oklch(0.68_0.08_85/0.38)] blur-3xl"
      />
      <div className="rounded-[22px] bg-[#0c0b0a] p-[5px] shadow-[0_40px_100px_rgb(0_0_0/0.5)] ring-1 ring-white/15">
        <div className="relative overflow-hidden rounded-[18px] bg-black ring-1 ring-inset ring-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
