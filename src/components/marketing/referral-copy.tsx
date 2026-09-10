"use client";

import { useState } from "react";
import { CopySimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function ReferralCopy() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = typeof window === "undefined" ? "https://signage.desk" : window.location.origin;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button type="button" variant="outline" onClick={() => void copy()} className="h-11 px-4">
      <CopySimple className="size-4" />
      {copied ? "Đã copy" : "Copy link giới thiệu"}
    </Button>
  );
}
