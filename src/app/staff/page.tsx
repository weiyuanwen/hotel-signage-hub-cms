"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { DeskDialog } from "@/components/DeskDialog";
import { api, ApiError, type StaffMember } from "@/lib/api";
import { canManageStaff, isSuperAdmin, roleLabel } from "@/lib/roles";
import { useSession } from "@/lib/session";

type Mode = "idle" | "create" | "edit";

export default function StaffPage() {
  const { hotelId, ready, user } = useSession();
  const [staff, setStaff] = useState<StaffMember[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [active, setActive] = useState<StaffMember | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("receptionist");
  const [busy, setBusy] = useState(false);

  const allowed = canManageStaff(user);
  const admin = isSuperAdmin(user);

  const load = useCallback(async () => {
    if (!hotelId || !allowed) return;
    setError(null);
    try {
      const res = await api<{ data: StaffMember[] }>(`/cms/hotels/${hotelId}/staff`);
      setStaff(res.data);
    } catch {
      setError("Không tải được danh sách nhân viên.");
      setStaff([]);
    }
  }, [hotelId, allowed]);

  useEffect(() => {
    if (ready && user && hotelId && allowed) void load();
  }, [ready, user, hotelId, allowed, load]);

  function openCreate() {
    setMode("create");
    setActive(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("receptionist");
    setError(null);
  }

  function openEdit(member: StaffMember) {
    setMode("edit");
    setActive(member);
    setName(member.name);
    setEmail(member.email);
    setPassword("");
    setRole(member.roles[0] ?? "receptionist");
    setError(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!hotelId) return;
    setBusy(true);
    setError(null);
    try {
      if (mode === "create") {
        await api(`/cms/hotels/${hotelId}/staff`, {
          method: "POST",
          body: JSON.stringify({ name, email, password, role }),
        });
      } else if (active) {
        await api(`/cms/hotels/${hotelId}/staff/${active.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name,
            role,
            ...(password ? { password } : {}),
          }),
        });
      }
      setMode("idle");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? "Không lưu được. Kiểm tra email hoặc quyền." : "Lỗi mạng.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(member: StaffMember) {
    if (!hotelId) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/cms/hotels/${hotelId}/staff/${member.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !member.is_active }),
      });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? "Không đổi được trạng thái tài khoản." : "Lỗi mạng.");
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return (
      <AppShell>
        <main className="px-5 py-6 lg:px-10">
          <h1 className="text-2xl font-medium tracking-tight">Nhân viên</h1>
          <p className="mt-2 text-sm text-muted">Lễ tân không quản lý tài khoản nhân viên.</p>
        </main>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <main className="px-5 py-6 lg:px-10">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Nhân viên</h1>
            <p className="mt-1 text-sm text-muted">
              {admin ? "Tạo quản lý hoặc lễ tân cho khách sạn đang chọn." : "Mời lễ tân vào khách sạn của bạn."}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            disabled={!hotelId}
            className="rounded-[10px] bg-primary px-3 py-2 text-sm text-primary-ink disabled:opacity-50"
          >
            Thêm nhân viên
          </button>
        </header>

        {error && mode === "idle" ? <p className="mb-4 text-sm text-danger">{error}</p> : null}

        {staff === null ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-[10px] bg-surface" />
            ))}
          </div>
        ) : staff.length === 0 ? (
          <p className="rounded-[10px] bg-surface px-4 py-8 text-sm text-muted">
            Chưa có nhân viên gắn với khách sạn này.
          </p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {staff.map((member) => {
              const self = member.id === user?.id;
              return (
                <li key={member.id} className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <p className="font-medium">
                      {member.name}
                      {self ? <span className="ml-2 text-xs font-normal text-muted">Bạn</span> : null}
                    </p>
                    <p className="text-sm text-muted">
                      {member.email} · {member.roles.map(roleLabel).join(", ")} ·{" "}
                      {member.is_active ? "Đang mở" : "Đã khóa"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(member)}
                      className="rounded-[10px] border border-line px-3 py-1.5 text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      disabled={busy || self}
                      onClick={() => void toggleActive(member)}
                      className="rounded-[10px] border border-line px-3 py-1.5 text-sm text-danger disabled:opacity-40"
                    >
                      {member.is_active ? "Khóa" : "Mở khóa"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {mode !== "idle" ? (
          <DeskDialog
            title={mode === "create" ? "Thêm nhân viên" : `Sửa ${active?.name}`}
            error={error}
            busy={busy}
            submitLabel={mode === "create" ? "Tạo" : "Lưu"}
            onClose={() => setMode("idle")}
            onSubmit={submit}
          >
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Họ tên</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-[10px] border border-line px-3 py-2"
                required
              />
            </label>
            {mode === "create" ? (
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-[10px] border border-line px-3 py-2"
                  required
                />
              </label>
            ) : (
              <p className="text-sm text-muted">{email}</p>
            )}
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">
                {mode === "create" ? "Mật khẩu" : "Mật khẩu mới (tuỳ chọn)"}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[10px] border border-line px-3 py-2"
                minLength={mode === "create" ? 8 : undefined}
                required={mode === "create"}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Vai trò</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-[10px] border border-line bg-bg px-3 py-2"
              >
                <option value="receptionist">Lễ tân</option>
                {admin ? <option value="hotel-manager">Quản lý khách sạn</option> : null}
              </select>
            </label>
          </DeskDialog>
        ) : null}
      </main>
    </AppShell>
  );
}
