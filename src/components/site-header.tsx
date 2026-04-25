"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Cog, Menu, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { HeaderAuthControls } from "@/components/header-auth-controls";
import { MiyaarLogo } from "@/components/miyaar-logo";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { publicTopNavItems, studentSidebarItems, studentTopNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type BasicNavLink = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

type SiteHeaderVariant = "auto" | "public" | "student";

const STUDENT_ROUTE_PREFIXES = [
  "/dashboard",
  "/my-plan",
  "/challenge",
  "/statistics",
  "/account",
];

function isStudentAreaPath(pathname: string) {
  return STUDENT_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isNavItemActive(pathname: string, currentSearch: string, href: string) {
  const [hrefWithoutHash] = href.split("#");

  if (!hrefWithoutHash.includes("?")) {
    return pathname === hrefWithoutHash;
  }

  const [targetPath, queryString] = hrefWithoutHash.split("?");
  if (pathname !== targetPath) {
    return false;
  }

  const params = new URLSearchParams(queryString);
  const currentParams = new URLSearchParams(currentSearch);
  for (const [key, value] of params.entries()) {
    if (currentParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

function HeaderUtilityButton({
  href,
  badge,
  icon: Icon,
  onClick,
  className,
  label,
}: {
  href: string;
  badge?: number;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_22px_rgba(15,23,42,0.045)] transition hover:border-[#cdddff] hover:bg-[#f8fbff]",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
      {badge ? (
        <span className="absolute left-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[11px] font-extrabold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader({
  ctaHref,
  ctaLabel,
  links,
  variant = "public",
}: {
  ctaHref?: string;
  ctaLabel?: string;
  links?: BasicNavLink[];
  variant?: SiteHeaderVariant;
}) {
  const pathname = usePathname();
  const { status, user, refreshSession } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const isAuthenticated = status === "authenticated" && Boolean(user);

  const isStudentArea = useMemo(() => {
    if (variant === "student") {
      return true;
    }

    if (variant === "public") {
      return false;
    }

    return isAuthenticated || isStudentAreaPath(pathname);
  }, [isAuthenticated, pathname, variant]);

  const brandHref = isStudentArea ? "/dashboard" : "/";

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, []);

  const desktopLinks = useMemo(() => {
    if (isStudentArea) {
      return links ?? studentTopNavItems;
    }

    // Keep the public top navigation identical across the homepage and all public pages.
    return publicTopNavItems;
  }, [isStudentArea, links]);

  const mobileItems = useMemo(() => {
    const source = isStudentArea ? [...studentTopNavItems, ...studentSidebarItems] : publicTopNavItems;

    return source.filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index);
  }, [isStudentArea]);

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (response.ok) {
      await refreshSession();
      setOpen(false);
      window.location.href = "/";
    }
  }

  if (!isStudentArea) {
    return (
      <header className="sticky top-0 z-[9999] border-b border-[#e8eefb] bg-white/96 backdrop-blur-xl">
        <div className="mx-auto flex w-[min(calc(100%-1.5rem),1280px)] items-center justify-between gap-6 px-1 py-5 sm:w-[min(calc(100%-2rem),1280px)]">
          <div className="flex items-center gap-8">
            <MiyaarLogo href={brandHref} className="shrink-0" />

            <nav className="hidden items-center gap-7 text-[1.02rem] font-bold text-slate-500 lg:flex">
              {desktopLinks.map((item) => {
                const active = isNavItemActive(pathname, currentSearch, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(active ? "text-[#2563eb]" : "transition hover:text-slate-900")}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5" dir="ltr">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_22px_rgba(15,23,42,0.045)] lg:hidden"
              aria-label="افتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <HeaderAuthControls
              variant="public"
              ctaHref={isAuthenticated ? undefined : ctaHref}
              ctaLabel={isAuthenticated ? undefined : ctaLabel}
            />
          </div>
        </div>

        {open ? (
          <div className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-sm lg:hidden">
            <div className="mr-auto flex h-full w-[min(92vw,360px)] flex-col overflow-y-auto bg-white px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
              <div className="mb-6 flex items-center justify-between">
                <MiyaarLogo href={brandHref} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-[56px] w-[56px] items-center justify-center rounded-[1.2rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_12px_26px_rgba(15,23,42,0.05)]"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                {mobileItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavItemActive(pathname, currentSearch, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn("nav-item", active && "nav-item-active")}
                    >
                      <span className={cn("nav-icon-wrap", item.iconWrap, item.accent)}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate">{item.label}</div>
                        {item.description ? <div className="text-xs font-medium text-slate-400">{item.description}</div> : null}
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button className="w-full">لوحة الطالب</Button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="inline-flex h-11 w-full items-center justify-center rounded-[1.25rem] border border-rose-200 bg-white text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                    >
                      تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="outline">
                        تسجيل الدخول
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)}>
                      <Button className="w-full" variant="outline">
                        إنشاء حساب
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-[9999] border-b border-[#e6edf9] bg-white/98 shadow-[0_10px_26px_rgba(15,23,42,0.035)] backdrop-blur-2xl">
      <div className="w-full px-4 py-3.5 sm:px-5 lg:px-6 xl:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-7">
            <MiyaarLogo href={brandHref} />

            <nav className={cn("hidden items-center gap-1 text-sm font-bold text-slate-600", isStudentArea ? "xl:flex" : "lg:flex")}>
              {desktopLinks.map((item) => {
                const active = isNavItemActive(pathname, currentSearch, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex min-w-[94px] flex-col items-center justify-center gap-1.5 rounded-[0.95rem] px-3 py-2 text-center transition",
                      active ? "text-[#2563eb]" : "text-slate-600 hover:bg-[#f8fbff] hover:text-slate-900",
                    )}
                  >
                    {Icon ? <Icon className={cn("h-5 w-5", active && "text-[#2563eb]")} /> : null}
                    <span className="text-[0.95rem] leading-[1.15]">{item.label}</span>
                    {active ? <span className="absolute inset-x-3 bottom-0 h-[4px] rounded-full bg-[#2563eb]" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5" dir="ltr">
            {isStudentArea && isAuthenticated ? (
              <>
                <HeaderUtilityButton href="/dashboard#notifications" icon={Bell} badge={3} label="الإشعارات" className="hidden xl:flex" />
                <HeaderUtilityButton href="/account" icon={Cog} label="الإعدادات" className="hidden xl:flex" />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_22px_rgba(15,23,42,0.045)] xl:hidden"
              aria-label="افتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <HeaderAuthControls
              variant={isStudentArea ? "student" : "public"}
              ctaHref={isAuthenticated ? undefined : ctaHref}
              ctaLabel={isAuthenticated ? undefined : ctaLabel}
            />
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-sm xl:hidden">
          <div className="mr-auto flex h-full w-[min(92vw,360px)] flex-col overflow-y-auto bg-white px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <MiyaarLogo href={brandHref} />
              <div className="flex items-center gap-2" dir="ltr">
                {isStudentArea && isAuthenticated ? (
                  <>
                    <HeaderUtilityButton href="/dashboard#notifications" icon={Bell} badge={3} label="الإشعارات" onClick={() => setOpen(false)} />
                    <HeaderUtilityButton href="/account" icon={Cog} label="الإعدادات" onClick={() => setOpen(false)} />
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-[56px] w-[56px] items-center justify-center rounded-[1.2rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_12px_26px_rgba(15,23,42,0.05)]"
                  aria-label="إغلاق القائمة"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const active = isNavItemActive(pathname, currentSearch, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn("nav-item", active && "nav-item-active")}
                  >
                    <span className={cn("nav-icon-wrap", item.iconWrap, item.accent)}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate">{item.label}</div>
                      {item.description ? <div className="text-xs font-medium text-slate-400">{item.description}</div> : null}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  {!isStudentArea ? (
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      <Button className="w-full">لوحة الطالب</Button>
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-11 w-full items-center justify-center rounded-[1.25rem] border border-rose-200 bg-white text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="outline">
                      تسجيل الدخول
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full" variant="outline">
                      إنشاء حساب
                    </Button>
                  </Link>
                  {ctaHref && ctaLabel ? (
                    <Link href={ctaHref} onClick={() => setOpen(false)}>
                      <Button className="w-full">{ctaLabel}</Button>
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
