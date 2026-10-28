import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | SignageHub",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="site dark flex min-h-[100dvh] items-center justify-center bg-background px-5 py-16 text-foreground">
      <div className="max-w-xl text-center">
        <p className="text-sm tracking-[0.18em] text-white/50 uppercase">404</p>
        <h1 className="mt-4 font-heading text-4xl leading-tight font-medium tracking-tight sm:text-5xl">
          Trang không tồn tại
          <span className="mt-2 block text-2xl text-white/65 sm:text-3xl">Page not found</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/65">
          Đường dẫn này không có trên SignageHub. Hãy quay về trang chủ để tiếp tục.
          <span className="mt-1 block">This SignageHub page does not exist. Return to the homepage to continue.</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-[var(--ivory)] px-5 py-3 text-sm font-medium text-[var(--night)] hover:bg-[var(--ivory)]/90"
          >
            Trang chủ / Home
          </Link>
          <Link
            href="/vi"
            className="rounded-full border border-white/25 px-5 py-3 text-sm font-medium text-white hover:bg-white/10"
          >
            Tiếng Việt
          </Link>
        </div>
      </div>
    </main>
  );
}
