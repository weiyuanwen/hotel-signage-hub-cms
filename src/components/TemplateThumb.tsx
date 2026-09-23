"use client";

import { TEMPLATE_TOKENS, type WelcomeTemplateKey, isWelcomeTemplateKey } from "@/lib/welcomeTemplates";

type Props = {
  templateKey: string;
  selected?: boolean;
  className?: string;
};

export function TemplateThumb({ templateKey, selected = false, className = "" }: Props) {
  const key: WelcomeTemplateKey = isWelcomeTemplateKey(templateKey) ? templateKey : "dusk";
  const t = TEMPLATE_TOKENS[key];

  return (
    <div
      className={`relative overflow-hidden rounded-[8px] border ${
        selected ? "border-primary" : "border-line"
      } ${className}`}
      style={{ aspectRatio: "16 / 9", background: t.bg, color: t.ink }}
      aria-hidden
    >
      {key === "harbor" || key === "vista" ? (
        <div className="absolute inset-y-0 left-0 w-[42%]" style={{ background: t.panel }} />
      ) : null}
      {key === "vista" ? (
        <div className="absolute inset-y-0 right-0 w-[58%]" style={{ background: "oklch(0.42 0.04 220)" }} />
      ) : null}
      {key === "stone" ? (
        <div className="absolute inset-x-0 bottom-0 h-[32%]" style={{ background: t.band }} />
      ) : null}
      <div className="absolute inset-0 flex flex-col justify-between p-2 text-[7px] leading-tight">
        <span style={{ color: t.muted }}>KS</span>
        <span className="font-medium" style={{ color: t.name }}>
          Nguyễn Văn A
        </span>
        <span style={{ color: t.accent ?? t.muted }}>101</span>
      </div>
    </div>
  );
}
