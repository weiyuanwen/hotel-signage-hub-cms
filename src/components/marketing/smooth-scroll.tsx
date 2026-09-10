"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.08,
        wheelMultiplier: 0.86,
        touchMultiplier: 1.05,
        anchors: true,
        allowNestedScroll: true,
        stopInertiaOnNavigate: true,
        respectReducedMotion: true,
        prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
      }}
    >
      {children}
    </ReactLenis>
  );
}
