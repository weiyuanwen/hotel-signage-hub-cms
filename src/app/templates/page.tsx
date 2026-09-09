"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TemplateThumb } from "@/components/TemplateThumb";
import { api, ApiError, type WelcomeTemplate, type WelcomeTemplateList } from "@/lib/api";
import { canManageTemplates } from "@/lib/roles";
import { useSession } from "@/lib/session";

export default function TemplatesPage() {
  const { hotelId, ready, user } = useSession();
  const allowed = canManageTemplates(user);
  const [list, setList] = useState<WelcomeTemplateList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!hotelId || !allowed) return;
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates`);
      setList(res.data);
      setError(null);
    } catch {
      setError("Không tải được danh sách mẫu.");
      setList({ default_key: "dusk", templates: [] });
    }
  }, [hotelId, allowed]);

  useEffect(() => {
    setList(null);
    if (ready && user && hotelId && allowed) void load();
  }, [ready, user, hotelId, allowed, load]);

  async function patchRow(key: string, body: { is_enabled?: boolean; display_name?: string | null }) {
    if (!hotelId) return;
    setBusyKey(key);
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates/${key}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
      setList(res.data);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? "Không lưu được mẫu. Kiểm tra mẫu mặc định và mẫu cuối còn bật." : "Lỗi mạng.");
    } finally {
      setBusyKey(null);
    }
  }

  async function setDefault(key: string) {
    if (!hotelId) return;
    setBusyKey(key);
    try {
      const res = await api<{ data: WelcomeTemplateList }>(`/cms/hotels/${hotelId}/welcome-templates/default`, {
        method: "PATCH",
        body: JSON.stringify({ key }),
      });
      setList(res.data);
      setError(null);
    } catch {
      setError("Không đặt được mẫu mặc định.");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <AppShell>
      <main className="px-5 py-6 lg:px-10">
        <h1 className="text-2xl font-medium tracking-tight">Mẫu chào</h1>
        <p className="mt-1 text-sm text-muted">Chọn mẫu mặc định và mẫu lễ tân được dùng lúc nhận phòng.</p>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        {!allowed ? (
          <p className="mt-6 text-sm text-muted">Chỉ quản lý được sửa mẫu chào.</p>
        ) : !hotelId ? (
          <p className="mt-6 text-sm text-muted">Chưa chọn khách sạn.</p>
        ) : (
          <ul className="mt-6 divide-y divide-line border-y border-line">
            {(list?.templates ?? []).map((row: WelcomeTemplate) => {
              const isDefault = list?.default_key === row.key;
              return (
                <li key={`${hotelId}-${row.key}`} className="grid gap-4 py-4 md:grid-cols-[240px_minmax(0,1fr)_auto] md:items-center">
                  <TemplateThumb templateKey={row.key} />
                  <div className="space-y-2">
                    <label className="block space-y-1.5">
                      <span className="text-sm font-medium">Tên gọi</span>
                      <input
                        defaultValue={row.display_name ?? ""}
                        placeholder={row.built_in_name}
                        maxLength={40}
                        className="w-full rounded-[10px] border border-line px-3 py-2"
                        disabled={busyKey === row.key}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          const prev = row.display_name ?? "";
                          if (next === prev) return;
                          void patchRow(row.key, { display_name: next });
                        }}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={row.is_enabled}
                        disabled={busyKey === row.key || isDefault}
                        onChange={(e) => void patchRow(row.key, { is_enabled: e.target.checked })}
                      />
                      Bật cho lễ tân
                    </label>
                  </div>
                  <button
                    type="button"
                    disabled={!row.is_enabled || isDefault || busyKey === row.key}
                    onClick={() => void setDefault(row.key)}
                    className="rounded-[10px] border border-line px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {isDefault ? "Đang mặc định" : "Mặc định"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </AppShell>
  );
}
