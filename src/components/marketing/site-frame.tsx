import type { ReactNode } from "react";
import { SmoothScroll } from "@/components/marketing/smooth-scroll";

export function SiteFrame({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <div className="site dark relative min-h-[100dvh] bg-background text-foreground">{children}</div>
    </SmoothScroll>
  );
}
