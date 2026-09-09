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

export type Hotel = {
  id: number;
  name: string;
  slug: string;
  default_locale: string;
};

export type Room = {
  id: number;
  hotel_id: number;
  code: string;
  name: string | null;
  kind: "guest" | "public";
  current_welcome_id: number | null;
  content_revision: number;
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
};

export type WelcomeTemplateList = {
  default_key: string;
  templates: WelcomeTemplate[];
};

export type Device = {
  id: number;
  name: string | null;
  status: string;
  room_id: number | null;
  online: boolean;
};

export type StaffMember = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles: string[];
};
