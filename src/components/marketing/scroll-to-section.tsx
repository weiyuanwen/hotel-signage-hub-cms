"use client";

import { useEffect } from "react";

export function ScrollToSection({ id }: { id?: string }) {
  useEffect(() => {
    if (!id) return;
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "instant", block: "start" });
  }, [id]);

  return null;
}
