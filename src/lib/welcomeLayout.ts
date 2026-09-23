export const TEMPLATE_TONES = ["neutral", "warm", "cool", "soft", "contrast"] as const;
export type TemplateTone = (typeof TEMPLATE_TONES)[number];

export const TEMPLATE_FONTS = ["geist", "be-vietnam", "outfit", "cormorant"] as const;
export type TemplateFont = (typeof TEMPLATE_FONTS)[number];

export const TEMPLATE_COMPOSITIONS = ["full", "split"] as const;
export type TemplateComposition = (typeof TEMPLATE_COMPOSITIONS)[number];

export const GALLERY_IDS = ["sunlit", "pool", "cafe", "garden", "coastal", "lobby", "terrace", "spa", "suite"] as const;
export type GalleryId = (typeof GALLERY_IDS)[number];

export const SPLIT_PANEL = {
  width: 42,
  color: "rgb(22 18 14)",
  edge: "rgb(212 176 122 / 0.22)",
} as const;

export const SLOT_KEYS = ["logo", "name", "slogan", "message", "room"] as const;
export type SlotKey = (typeof SLOT_KEYS)[number];

export type TemplateSlot = {
  x: number;
  y: number;
  visible?: boolean;
};

export type WelcomeLayout = {
  background: {
    source: "gallery" | "upload";
    gallery_id: string;
  };
  composition: TemplateComposition;
  tone: TemplateTone;
  font: TemplateFont;
  colors: {
    name: string;
    slogan: string;
    muted: string;
  };
  sizes: {
    name: number;
    slogan: number;
    message: number;
    room: number;
    wifi: number;
    wifiPassword: number;
    time: number;
    clock: number;
    weather: number;
    logo: number;
  };
  slogan: string;
  lead: string;
  wish: string;
  slots: Record<SlotKey, TemplateSlot>;
};

export const SIZE_LIMITS = {
  name: { min: 2.5, max: 8 },
  slogan: { min: 1.2, max: 4.5 },
  message: { min: 1, max: 3.5 },
  room: { min: 0.8, max: 3 },
  wifi: { min: 0.8, max: 3.5 },
  wifiPassword: { min: 0.6, max: 3 },
  time: { min: 1.5, max: 6 },
  clock: { min: 0.7, max: 2.4 },
  weather: { min: 1.5, max: 6 },
  logo: { min: 4, max: 28 },
} as const;

export function cqw(n: number): string {
  return `${n}cqw`;
}

export function cqh(n: number): string {
  return `${n}cqh`;
}

export const COPY_LIMITS = {
  slogan: 80,
  lead: 120,
  wish: 120,
} as const;

export const GALLERY: Record<GalleryId, { url: string }> = {
  sunlit: { url: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1920&q=80" },
  pool: { url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80" },
  cafe: { url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1920&q=80" },
  garden: { url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=80" },
  coastal: { url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1920&q=80" },
  lobby: { url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80" },
  terrace: { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=80" },
  spa: { url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=80" },
  suite: { url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1920&q=80" },
};

export const TONE_FILTER: Record<TemplateTone, string> = {
  neutral: "none",
  warm: "sepia(0.28) saturate(1.12) hue-rotate(-12deg)",
  cool: "saturate(0.92) hue-rotate(14deg) brightness(1.03)",
  soft: "brightness(1.08) contrast(0.9) saturate(0.82)",
  contrast: "contrast(1.22) saturate(1.1) brightness(0.98)",
};

export const TONE_OVERLAY: Record<TemplateTone, string> = {
  neutral: "rgb(8 10 14 / 0.28)",
  warm: "rgb(42 18 8 / 0.3)",
  cool: "rgb(6 16 28 / 0.34)",
  soft: "rgb(22 16 12 / 0.2)",
  contrast: "rgb(0 0 0 / 0.42)",
};

export const FONT_FAMILY: Record<TemplateFont, string> = {
  geist: 'var(--font-geist-sans), "Geist Variable", Geist, ui-sans-serif, system-ui, sans-serif',
  "be-vietnam": 'var(--font-be-vietnam), "Be Vietnam Pro", ui-sans-serif, sans-serif',
  outfit: 'var(--font-outfit), Outfit, var(--font-be-vietnam), ui-sans-serif, sans-serif',
  cormorant: 'var(--font-cormorant), "Cormorant Garamond", ui-serif, serif',
};

export function galleryUrl(id: string): string | null {
  return GALLERY[id as GalleryId]?.url ?? null;
}

export function defaultGalleryId(key: string): GalleryId {
  if (key === "linen") return "sunlit";
  if (key === "harbor") return "coastal";
  if (key === "garden") return "garden";
  if (key === "stone") return "lobby";
  if (key === "vista") return "suite";
  return "terrace";
}

export function isSplitLayout(layout: WelcomeLayout): boolean {
  return layout.composition === "split";
}

export function defaultLayout(key: string): WelcomeLayout {
  const galleryId = defaultGalleryId(key);
  const colors =
    key === "linen"
      ? { name: "#3a2a1c", slogan: "#5a4634", muted: "#6b5a4a" }
      : key === "garden"
        ? { name: "#243028", slogan: "#3d4a3e", muted: "#5a665c" }
        : key === "harbor"
          ? { name: "#f4efe4", slogan: "#e4ddd0", muted: "#c8c2b4" }
          : key === "stone"
            ? { name: "#f3eadc", slogan: "#e2d6c4", muted: "#c4b8a6" }
            : key === "vista"
              ? { name: "#d4b07a", slogan: "#e8dfd0", muted: "#c4b8a6" }
              : { name: "#f4efe6", slogan: "#e8dfd0", muted: "#cfc4b4" };
  const slots =
    key === "vista"
      ? {
          logo: { x: 6, y: 12, visible: true },
          name: { x: 6, y: 30 },
          slogan: { x: 6, y: 66, visible: true },
          message: { x: 6, y: 50, visible: true },
          room: { x: 6, y: 86 },
        }
      : key === "harbor"
      ? {
          logo: { x: 8, y: 16, visible: true },
          name: { x: 8, y: 38 },
          slogan: { x: 8, y: 54, visible: true },
          message: { x: 8, y: 64, visible: true },
          room: { x: 86, y: 88 },
        }
      : key === "stone"
        ? {
            logo: { x: 8, y: 14, visible: true },
            name: { x: 8, y: 62 },
            slogan: { x: 8, y: 76, visible: true },
            message: { x: 8, y: 84, visible: true },
            room: { x: 86, y: 88 },
          }
        : key === "linen"
          ? {
              logo: { x: 42, y: 18, visible: true },
              name: { x: 22, y: 42 },
              slogan: { x: 22, y: 58, visible: true },
              message: { x: 22, y: 68, visible: true },
              room: { x: 46, y: 88 },
            }
          : {
              logo: { x: 8, y: 16, visible: true },
              name: { x: 8, y: 40 },
              slogan: { x: 8, y: 56, visible: true },
              message: { x: 8, y: 66, visible: true },
              room: { x: 86, y: 88 },
            };

  return {
    background: { source: "gallery", gallery_id: galleryId },
    composition: key === "vista" ? "split" : "full",
    tone: key === "linen" ? "soft" : key === "harbor" ? "cool" : key === "garden" ? "warm" : key === "stone" || key === "vista" ? "contrast" : "warm",
    font: key === "linen" ? "be-vietnam" : key === "harbor" ? "outfit" : key === "garden" || key === "stone" || key === "vista" ? "cormorant" : "geist",
    colors,
    sizes: defaultSizes(key),
    slogan: "",
    lead: key === "vista" ? "Chúng tôi rất hân hạnh chào đón quý khách." : "Chào mừng quý khách",
    wish: key === "vista" ? "Chúc quý khách kỳ nghỉ thư thái và đáng nhớ." : "Chúc quý khách có những trải nghiệm tuyệt vời.",
    slots,
  };
}

export function defaultSizes(key: string): WelcomeLayout["sizes"] {
  return {
    name: key === "garden" || key === "stone" ? 5.4 : key === "vista" ? 3.8 : 4.5,
    slogan: key === "vista" ? 1.8 : 2.2,
    message: 1.7,
    room: 1.4,
    wifi: 1.5,
    wifiPassword: 1.2,
    time: 3.4,
    clock: 1.2,
    weather: 3.4,
    logo: key === "vista" ? 8 : 11,
  };
}

function isTone(value: unknown): value is TemplateTone {
  return typeof value === "string" && (TEMPLATE_TONES as readonly string[]).includes(value);
}

function isFont(value: unknown): value is TemplateFont {
  return typeof value === "string" && (TEMPLATE_FONTS as readonly string[]).includes(value);
}

function isComposition(value: unknown): value is TemplateComposition {
  return typeof value === "string" && (TEMPLATE_COMPOSITIONS as readonly string[]).includes(value);
}

function copyLine(value: unknown, fallback: string, max: number, present: boolean): string {
  if (!present) return fallback;
  if (typeof value !== "string") return fallback;
  return value.trim().slice(0, max);
}

function color(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const next = value.trim();
  return /^#([0-9a-fA-F]{6})$/.test(next) ? next.toLowerCase() : fallback;
}

function size(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  const rounded = Math.round(n * 10) / 10;
  return Math.min(max, Math.max(min, rounded));
}

function coord(value: number): number {
  const n = Math.max(0, Math.min(92, Math.round(value * 10) / 10));
  return n % 1 === 0 ? Math.trunc(n) : n;
}

function slot(value: unknown, fallback: TemplateSlot, withVisible: boolean): TemplateSlot {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  const x = raw && typeof raw.x === "number" ? raw.x : fallback.x;
  const y = raw && typeof raw.y === "number" ? raw.y : fallback.y;
  const next: TemplateSlot = { x: coord(Number(x)), y: coord(Number(y)) };
  if (withVisible) {
    next.visible = raw && "visible" in raw ? Boolean(raw.visible) : Boolean(fallback.visible ?? true);
  }
  return next;
}

export function normalizeLayout(raw: unknown, key: string): WelcomeLayout {
  const base = defaultLayout(key);
  if (!raw || typeof raw !== "object") return base;
  const input = raw as Record<string, unknown>;
  const bg = input.background && typeof input.background === "object" ? (input.background as Record<string, unknown>) : {};
  const galleryId = typeof bg.gallery_id === "string" && galleryUrl(bg.gallery_id) ? bg.gallery_id : base.background.gallery_id;
  const colorsIn = input.colors && typeof input.colors === "object" ? (input.colors as Record<string, unknown>) : {};
  const sizesIn = input.sizes && typeof input.sizes === "object" ? (input.sizes as Record<string, unknown>) : {};
  const slotsIn = input.slots && typeof input.slots === "object" ? (input.slots as Record<string, unknown>) : {};

  return {
    background: {
      source: bg.source === "upload" ? "upload" : "gallery",
      gallery_id: galleryId,
    },
    composition: isComposition(input.composition) ? input.composition : base.composition,
    tone: isTone(input.tone) ? input.tone : base.tone,
    font: isFont(input.font) ? input.font : base.font,
    colors: {
      name: color(colorsIn.name, base.colors.name),
      slogan: color(colorsIn.slogan, base.colors.slogan),
      muted: color(colorsIn.muted, base.colors.muted),
    },
    sizes: {
      name: size(sizesIn.name, base.sizes.name, SIZE_LIMITS.name.min, SIZE_LIMITS.name.max),
      slogan: size(sizesIn.slogan, base.sizes.slogan, SIZE_LIMITS.slogan.min, SIZE_LIMITS.slogan.max),
      message: size(sizesIn.message, base.sizes.message, SIZE_LIMITS.message.min, SIZE_LIMITS.message.max),
      room: size(sizesIn.room, base.sizes.room, SIZE_LIMITS.room.min, SIZE_LIMITS.room.max),
      wifi: size(sizesIn.wifi, base.sizes.wifi, SIZE_LIMITS.wifi.min, SIZE_LIMITS.wifi.max),
      wifiPassword: size(sizesIn.wifiPassword, base.sizes.wifiPassword, SIZE_LIMITS.wifiPassword.min, SIZE_LIMITS.wifiPassword.max),
      time: size(sizesIn.time, base.sizes.time, SIZE_LIMITS.time.min, SIZE_LIMITS.time.max),
      clock: size(sizesIn.clock, base.sizes.clock, SIZE_LIMITS.clock.min, SIZE_LIMITS.clock.max),
      weather: size(sizesIn.weather, base.sizes.weather, SIZE_LIMITS.weather.min, SIZE_LIMITS.weather.max),
      logo: size(sizesIn.logo, base.sizes.logo, SIZE_LIMITS.logo.min, SIZE_LIMITS.logo.max),
    },
    slogan: typeof input.slogan === "string" ? input.slogan.trim().slice(0, COPY_LIMITS.slogan) : base.slogan,
    lead: copyLine(input.lead, base.lead, COPY_LIMITS.lead, "lead" in input),
    wish: copyLine(input.wish, base.wish, COPY_LIMITS.wish, "wish" in input),
    slots: {
      logo: slot(slotsIn.logo, base.slots.logo, true),
      name: slot(slotsIn.name, base.slots.name, false),
      slogan: slot(slotsIn.slogan, base.slots.slogan, true),
      message: slot(slotsIn.message, base.slots.message, true),
      room: slot(slotsIn.room, base.slots.room, false),
    },
  };
}

export function resolveBackgroundUrl(layout: WelcomeLayout, uploadUrl?: string | null): string {
  if (layout.background.source === "upload" && uploadUrl) return uploadUrl;
  return galleryUrl(layout.background.gallery_id) ?? GALLERY[defaultGalleryId("dusk")].url;
}

export function layoutSignature(layout: WelcomeLayout): string {
  return JSON.stringify(layout);
}
