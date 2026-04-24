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
        "relative flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition hover:border-[#cdddff] hover:bg-[#f8fbff]",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
      {badge ? (
        <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f97316] px-1 text-[10px] font-extrabold text-white">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function SiteHeader({
  ctaHref = "/diagnostic",
  ctaLabel = "ابدأ الآن",
  links,
}: {
  ctaHref?: string;
  ctaLabel?: string;
  links?: BasicNavLink[];
}) {
  const pathname = usePathname();
  const { status, user, refreshSession } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const isAuthenticated = status === "authenticated" && Boolean(user);
  const brandHref = isAuthenticated ? "/dashboard" : "/";

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, []);

  const desktopLinks = useMemo(
    () => links ?? (isAuthenticated ? studentTopNavItems : publicTopNavItems),
    [isAuthenticated, links],
  );

  const mobileItems = useMemo(
    () =>
      (isAuthenticated ? [...studentTopNavItems, ...studentSidebarItems] : publicTopNavItems).filter(
        (item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index,
      ),
    [isAuthenticated],
  );

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (response.ok) {
      await refreshSession();
      setOpen(false);
      window.location.href = "/";
    }
  }

  return (
    <header className="sticky top-0 z-[9999] border-b border-[#edf1f7] bg-[#fbfdff]/95 backdrop-blur-2xl">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] py-4 sm:w-[min(calc(100%-2rem),1480px)]">
        <div className="flex items-center justify-between gap-4 rounded-[1.6rem] border border-[#e6edf9] bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:px-5">
          <div className="flex items-center gap-8">
            <MiyaarLogo href={brandHref} />

            <nav className={cn("hidden items-center gap-2 text-sm font-bold text-slate-600", isAuthenticated ? "xl:flex" : "lg:flex")}>
              {desktopLinks.map((item) => {
                const active = isNavItemActive(pathname, currentSearch, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative inline-flex items-center gap-2 rounded-[1rem] px-4 py-2.5 transition",
                      active
                        ? "bg-[#f8fbff] text-[#123B7A]"
                        : "text-slate-600 hover:bg-[#f8fbff] hover:text-slate-900",
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4" /> : null}
                    <span>{item.label}</span>
                    {active ? <span className="absolute inset-x-4 -bottom-[14px] h-[3px] rounded-full bg-[#2563eb]" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
            {isAuthenticated ? (
              <>
                <HeaderUtilityButton href="/dashboard#notifications" icon={Bell} badge={3} label="الإشعارات" className="hidden xl:flex" />
                <HeaderUtilityButton href="/account" icon={Cog} label="الإعدادات" className="hidden xl:flex" />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_24px_rgba(15,23,42,0.05)] xl:hidden"
              aria-label="افتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <HeaderAuthControls ctaHref={isAuthenticated ? undefined : ctaHref} ctaLabel={isAuthenticated ? undefined : ctaLabel} />
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-sm xl:hidden">
          <div className="mr-auto flex h-full w-[min(92vw,360px)] flex-col overflow-y-auto bg-white px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <MiyaarLogo href={brandHref} />
              <div className="flex items-center gap-2" dir="ltr">
                {isAuthenticated ? (
                  <>
                    <HeaderUtilityButton href="/dashboard#notifications" icon={Bell} badge={3} label="الإشعارات" onClick={() => setOpen(false)} />
                    <HeaderUtilityButton href="/account" icon={Cog} label="الإعدادات" onClick={() => setOpen(false)} />
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-12 w-12 items-center justify-center rounded-[1.15rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
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
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex h-11 w-full items-center justify-center rounded-[1.25rem] border border-rose-200 bg-white text-sm font-bold text-rose-600 transition hover:bg-rose-50"
                >
                  تسجيل الخروج
                </button>
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
