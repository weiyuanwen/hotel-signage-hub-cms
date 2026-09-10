"use client";

import { useState } from "react";
import { List } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LanguageSwitch } from "@/components/marketing/language-switch";
import { Link } from "@/i18n/navigation";
import { useSession } from "@/lib/session";

export function SiteHeader() {
  const t = useTranslations("nav");
  const { user } = useSession();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/product" as const, label: t("product") },
    { href: "/gallery" as const, label: t("gallery") },
    { href: "/pricing" as const, label: t("pricing") },
    { href: "/faq" as const, label: t("faq") },
  ];

  const accountHref = user ? "/rooms" : "/login";
  const accountLabel = user ? t("desk") : t("login");

  return (
    <header className="pointer-events-none sticky top-0 z-[var(--z-nav)] -mb-[4.25rem] px-3 pt-3 sm:px-5">
      <div className="pointer-events-auto mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-3 rounded-2xl border border-white/12 bg-[var(--night)]/55 px-4 shadow-[0_12px_40px_rgb(0_0_0/0.22)] backdrop-blur-xl backdrop-saturate-150 sm:px-5">
        <Link href="/" className="text-[13px] font-medium tracking-[0.16em] uppercase">
          Signage Desk
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/75 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative py-1 transition-colors duration-300 hover:text-white after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)] hover:after:scale-x-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSwitch />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white transition-colors duration-300 hover:bg-white/10 hover:text-white"
          >
            {user ? (
              <a href={accountHref}>{accountLabel}</a>
            ) : (
              <Link href="/login">{accountLabel}</Link>
            )}
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-[var(--ivory)] px-3.5 text-[var(--night)] transition-transform duration-200 hover:bg-[var(--ivory)]/90 active:scale-[0.98]"
          >
            <Link href="/join">{t("openThree")}</Link>
          </Button>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-white/30 bg-white/5 text-white hover:bg-white/10 lg:hidden"
              aria-label={t("menu")}
            >
              <List className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background">
            <SheetHeader>
              <SheetTitle>Signage Desk</SheetTitle>
            </SheetHeader>
            <nav className="grid gap-1 px-4">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <Separator />
            <div className="grid gap-2 px-4">
              <LanguageSwitch />
              {user ? (
                <Button asChild variant="outline">
                  <a href={accountHref} onClick={() => setOpen(false)}>
                    {accountLabel}
                  </a>
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    {accountLabel}
                  </Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/join" onClick={() => setOpen(false)}>
                  {t("openThree")}
                </Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
