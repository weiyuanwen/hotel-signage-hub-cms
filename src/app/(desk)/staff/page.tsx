"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DeskDialog } from "@/components/DeskDialog";
import { DeskEmpty, DeskError, DeskHeader, DeskMain, DeskSkeleton } from "@/components/desk/ui";
import { api, ApiError, type StaffMember } from "@/lib/api";
import { canManageStaff, isSuperAdmin } from "@/lib/roles";
import { useSession } from "@/lib/session";

type Mode = "idle" | "create" | "edit";

export default function StaffPage() {
  const t = useTranslations("desk");
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
      setError(t("staffPage.loadError"));
      setStaff([]);
    }
  }, [hotelId, allowed, t]);

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
      setError(err instanceof ApiError ? t("staffPage.saveError") : t("staffPage.network"));
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
      setError(err instanceof ApiError ? t("staffPage.statusError") : t("staffPage.network"));
    } finally {
      setBusy(false);
    }
  }

  if (!allowed) {
    return (
      <DeskMain>
        <DeskHeader title={t("staffPage.title")} description={t("staffPage.forbidden")} />
      </DeskMain>
    );
  }

  return (
    <DeskMain>
      <DeskHeader
        title={t("staffPage.title")}
        description={admin ? t("staffPage.bodyAdmin") : t("staffPage.bodyManager")}
        actions={
          <button type="button" onClick={openCreate} disabled={!hotelId} className="desk-btn-primary">
            {t("staffPage.add")}
          </button>
        }
      />

      {error && mode === "idle" ? <DeskError>{error}</DeskError> : null}

      {staff === null ? (
        <DeskSkeleton rows={3} />
      ) : staff.length === 0 ? (
        <DeskEmpty>{t("staffPage.empty")}</DeskEmpty>
      ) : (
        <ul className="space-y-2">
          {staff.map((member) => {
            const self = member.id === user?.id;
            return (
              <li key={member.id} className="desk-row grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="font-medium">
                    {member.name}
                    {self ? <span className="ml-2 text-xs font-normal text-muted">{t("staffPage.you")}</span> : null}
                  </p>
                  <p className="truncate text-sm text-muted">
                    {member.email} ·{" "}
                    {member.roles
                      .map((item) =>
                        item === "super-admin" || item === "hotel-manager" || item === "receptionist"
                          ? t(`roles.${item}`)
                          : item,
                      )
                      .join(", ")}{" "}
                    · {member.is_active ? t("staffPage.active") : t("staffPage.locked")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => openEdit(member)} className="desk-btn-ghost">
                    {t("staffPage.edit")}
                  </button>
                  <button
                    type="button"
                    disabled={busy || self}
                    onClick={() => void toggleActive(member)}
                    className="desk-btn-danger"
                  >
                    {member.is_active ? t("staffPage.lock") : t("staffPage.unlock")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {mode !== "idle" ? (
        <DeskDialog
          title={mode === "create" ? t("staffPage.createTitle") : t("staffPage.editTitle", { name: active?.name ?? "" })}
          error={error}
          busy={busy}
          submitLabel={mode === "create" ? t("staffPage.create") : t("save")}
          onClose={() => setMode("idle")}
          onSubmit={submit}
        >
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("staffPage.name")}</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="desk-field" required />
          </label>
          {mode === "create" ? (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">{t("staffPage.email")}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="desk-field"
                required
              />
            </label>
          ) : (
            <p className="text-sm text-muted">{email}</p>
          )}
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">
              {mode === "create" ? t("staffPage.password") : t("staffPage.passwordNew")}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="desk-field"
              minLength={mode === "create" ? 8 : undefined}
              required={mode === "create"}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">{t("staffPage.role")}</span>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="desk-field">
              <option value="receptionist">{t("roles.receptionist")}</option>
              {admin ? <option value="hotel-manager">{t("roles.hotel-manager")}</option> : null}
            </select>
          </label>
        </DeskDialog>
      ) : null}
    </DeskMain>
  );
}
