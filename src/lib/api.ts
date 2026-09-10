const TOKEN_KEY = "hsh.token";
const HOTEL_KEY = "hsh.hotel";

export function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://hubback.test/api";
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getHotelId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(HOTEL_KEY);
  return raw ? Number(raw) : null;
}

export function setHotelId(id: number | null): void {
  if (id) window.localStorage.setItem(HOTEL_KEY, String(id));
  else window.localStorage.removeItem(HOTEL_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(typeof body === "object" && body && "message" in body ? String((body as { message: string }).message) : `HTTP ${status}`);
  }
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof ApiError) || !err.body || typeof err.body !== "object") return fallback;
  const body = err.body as { message?: string; errors?: Record<string, string[]> };
  const first = body.errors ? Object.values(body.errors).flat()[0] : undefined;
  return first || body.message || fallback;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${apiBase()}${path}`, { ...init, headers });
  if (res.status === 204 || res.status === 304) {
    return undefined as T;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

export type CmsUser = {
  id: number;
  name: string;
  email: string;
  roles: string[];
  hotels: { id: number; name: string; slug: string }[];
};

export type HotelPlan = "trial" | "free" | "standard" | "premium";

export type Hotel = {
  id: number;
  name: string;
  slug: string;
  default_locale: string;
  plan?: HotelPlan;
  plan_label?: string;
  device_limit?: number | null;
  pairing_mode?: "pin" | "link";
  paired_device_count?: number;
};

export function hotelQuotaLabel(
  hotel: Hotel | undefined,
  copy: {
    plan: (plan: HotelPlan) => string;
    limited: (values: { plan: string; used: number; limit: number }) => string;
    open: (values: { plan: string; used: number }) => string;
  },
): string | null {
  if (!hotel?.plan) return null;
  const used = hotel.paired_device_count ?? 0;
  const plan = copy.plan(hotel.plan);
  if (hotel.device_limit == null) return copy.open({ plan, used });
  return copy.limited({ plan, used, limit: hotel.device_limit });
}

export type WeatherRegion = {
  key: string;
  label: string;
  latitude: number;
  longitude: number;
};

export type HotelBranding = {
  id: number;
  name: string;
  weather_region: string | null;
  weather: WeatherRegion | null;
  logo_url: string | null;
  background_url: string | null;
  background_kind: "image" | "video" | null;
  wifi_ssid: string | null;
  wifi_password: string | null;
};

export type Room = {
  id: number;
  hotel_id: number;
  code: string;
  name: string | null;
  kind: "guest" | "public";
  current_welcome_id: number | null;
  content_revision: number;
  paired_tv_count?: number;
  background_url?: string | null;
  background_kind?: "image" | "video" | null;
  current_welcome?: {
    guest_display_name: string;
    message: string | null;
    locale: string;
    template_key?: string | null;
  } | null;
};

export type WelcomeTemplate = {
  key: string;
  built_in_name: string;
  display_name: string | null;
  label: string;
  is_enabled: boolean;
  sort_order: number;
  layout?: import("./welcomeLayout").WelcomeLayout;
  background_url?: string | null;
};

export type WelcomeTemplateList = {
  default_key: string;
  templates: WelcomeTemplate[];
};

export type DeviceScreen = {
  hotel: {
    id: number;
    name: string;
    logo_url: string | null;
    wifi?: { ssid: string; password: string | null } | null;
  };
  room: {
    id: number;
    code: string;
    kind: "guest" | "public";
  };
  guest: {
    display_name: string;
    message: string | null;
    locale: string;
  } | null;
  template: { key: string; mode?: "look" | "video"; layout?: import("./welcomeLayout").WelcomeLayout | null } | null;
  media: {
    background_url: string | null;
    kind?: "image" | "video" | null;
  };
};

export type Device = {
  id: number;
  name: string | null;
  status: string;
  room_id: number | null;
  room_code?: string | null;
  room_name?: string | null;
  room_kind?: "guest" | "public" | null;
  room_guest?: string | null;
  online: boolean;
  screen?: DeviceScreen | null;
};

export type StaffMember = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
};
