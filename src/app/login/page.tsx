"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useSession } from "@/lib/session";

export default function LoginPage() {
  const { login, user, ready } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("desk@saigon-pearl.test");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/rooms");
  }, [ready, user, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      router.replace("/rooms");
    } catch (err) {
      setError(err instanceof ApiError ? "Email hoặc mật khẩu không đúng." : "Không kết nối được máy chủ API.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-[100dvh] lg:grid-cols-[minmax(0,1fr)_420px]">
      <section className="hidden flex-col justify-end bg-ink px-12 py-14 text-bg lg:flex">
        <p className="max-w-sm text-4xl font-medium leading-[1.15] tracking-tight text-wrap-balance">
          Tên khách lên TV trong một nhịp.
        </p>
        <p className="mt-4 max-w-sm text-sm text-bg/70">
          Signage Desk cho quầy lễ tân. Không phải bảng điều khiển kỹ thuật.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-5">
          <div>
            <h1 className="text-2xl font-medium tracking-tight">Đăng nhập</h1>
            <p className="mt-1 text-sm text-muted">Dùng tài khoản CMS Sanctum.</p>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-ink"
              required
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Mật khẩu</span>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[10px] border border-line bg-bg px-3 py-2.5 text-ink"
              required
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-[10px] bg-primary py-2.5 text-sm font-medium text-primary-ink disabled:opacity-50"
          >
            {busy ? "Đang vào..." : "Vào quầy"}
          </button>
          <p className="text-xs text-muted">Demo: desk@saigon-pearl.test / password</p>
        </form>
      </section>
    </main>
  );
}
