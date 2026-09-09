export const WELCOME_TEMPLATE_KEYS = ["dusk", "linen", "harbor", "garden", "stone"] as const;
export type WelcomeTemplateKey = (typeof WELCOME_TEMPLATE_KEYS)[number];

export const BUILTIN_LABELS: Record<WelcomeTemplateKey, string> = {
  dusk: "Đêm vàng",
  linen: "Sáng nhẹ",
  harbor: "Cảng đêm",
  garden: "Vườn trà",
  stone: "Đá ấm",
};

export type TemplateTokens = {
  bg: string;
  ink: string;
  muted: string;
  name: string;
  accent?: string;
  panel?: string;
  band?: string;
  rule?: string;
};

export const TEMPLATE_TOKENS: Record<WelcomeTemplateKey, TemplateTokens> = {
  dusk: {
    bg: "oklch(0.10 0 0)",
    ink: "oklch(0.94 0.012 110)",
    muted: "oklch(0.68 0.02 110)",
    name: "oklch(0.78 0.11 110)",
    accent: "oklch(0.62 0.07 230)",
  },
  linen: {
    bg: "oklch(0.97 0.012 85)",
    ink: "oklch(0.28 0.035 55)",
    muted: "oklch(0.48 0.02 55)",
    name: "oklch(0.38 0.08 45)",
    rule: "oklch(0.82 0.03 75)",
  },
  harbor: {
    bg: "oklch(0.16 0.028 230)",
    ink: "oklch(0.93 0.015 95)",
    muted: "oklch(0.72 0.03 220)",
    name: "oklch(0.88 0.04 95)",
    accent: "oklch(0.70 0.06 200)",
    panel: "oklch(0.12 0.032 230)",
  },
  garden: {
    bg: "oklch(0.93 0.022 140)",
    ink: "oklch(0.32 0.04 55)",
    muted: "oklch(0.45 0.03 145)",
    name: "oklch(0.34 0.07 145)",
  },
  stone: {
    bg: "oklch(0.11 0.012 55)",
    ink: "oklch(0.93 0.02 80)",
    muted: "oklch(0.66 0.02 55)",
    name: "oklch(0.91 0.025 85)",
    accent: "oklch(0.72 0.08 75)",
    band: "oklch(0.15 0.016 55)",
  },
};

export function isWelcomeTemplateKey(value: string): value is WelcomeTemplateKey {
  return (WELCOME_TEMPLATE_KEYS as readonly string[]).includes(value);
}

export function templateLabel(
  key: string,
  templates: { key: string; label: string }[],
): string {
  const row = templates.find((t) => t.key === key);
  if (row) return row.label;
  if (isWelcomeTemplateKey(key)) return BUILTIN_LABELS[key];
  return key;
}
