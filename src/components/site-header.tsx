"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
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

function HeaderNotificationButton({
  href,
  onClick,
  className,
}: {
  href: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Link href={href} onClick={onClick} className={cn("search-btn-header", className)} aria-label="الإشعارات والنشاط">
      <div className="relative">
        <Bell className="h-5 w-5 text-[#123B7A]" />
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[10px] font-bold text-white">
          3
        </span>
      </div>
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
    <header className="relative sticky top-0 z-[9999] isolate border-b border-white/70 bg-white/95 backdrop-blur-2xl">
      <div className="mx-auto flex w-[min(calc(100%-1rem),1400px)] items-center justify-between gap-3 py-3 sm:w-[min(calc(100%-2rem),1400px)] sm:gap-4 sm:py-4">
        <MiyaarLogo href={brandHref} />

        <nav className={cn("hidden items-center justify-center gap-2 text-sm font-semibold text-slate-600", isAuthenticated ? "xl:flex" : "lg:flex")}>
          {desktopLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition",
                isNavItemActive(pathname, currentSearch, item.href)
                  ? "bg-white text-[#123B7A] shadow-[inset_0_-3px_0_0_#2563eb]"
                  : "hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? <HeaderNotificationButton href="/dashboard" className="hidden xl:flex" /> : null}

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="search-btn-header xl:hidden"
            aria-label="افتح القائمة"
          >
            <Menu className="h-5 w-5 text-[#123B7A]" />
          </button>

          <HeaderAuthControls ctaHref={isAuthenticated ? undefined : ctaHref} ctaLabel={isAuthenticated ? undefined : ctaLabel} />
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-sm xl:hidden">
          <div className="mr-auto h-full w-[min(92vw,340px)] overflow-y-auto bg-white px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <MiyaarLogo href={brandHref} />
              <div className="flex items-center gap-2">
                {isAuthenticated ? <HeaderNotificationButton href="/dashboard" onClick={() => setOpen(false)} /> : null}
                <button type="button" onClick={() => setOpen(false)} className="search-btn-header" aria-label="إغلاق القائمة">
                  <X className="h-5 w-5 text-[#123B7A]" />
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
