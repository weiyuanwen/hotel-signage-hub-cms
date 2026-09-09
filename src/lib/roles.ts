import type { CmsUser } from "./api";

export const ROLE_LABEL: Record<string, string> = {
  "super-admin": "Quản trị hệ thống",
  "hotel-manager": "Quản lý khách sạn",
  receptionist: "Lễ tân",
};

export function roleLabel(role: string): string {
  return ROLE_LABEL[role] ?? role;
}

export function isSuperAdmin(user: CmsUser | null): boolean {
  return Boolean(user?.roles.includes("super-admin"));
}

export function canManageStaff(user: CmsUser | null): boolean {
  return Boolean(user?.roles.some((role) => role === "hotel-manager" || role === "super-admin"));
}

export function canManageRooms(user: CmsUser | null): boolean {
  return Boolean(user?.roles.some((role) => role === "hotel-manager" || role === "super-admin"));
}
