"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, ClipboardList, Cog, Menu, Tag, Trophy, X, type LucideIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { AuthSessionUser } from "@/lib/auth-shared";
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
  accent?: string;
  iconWrap?: string;
  description?: string;
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

const headerNotifications = [
  {
    title: "إنجاز جديد",
    description: "مبروك! لقد حققت إنجاز التميز",
    time: "منذ 5 دقائق",
    icon: Trophy,
    tone: "bg-[#fff4df] text-[#f5a623]",
  },
  {
    title: "تذكير يومي",
    description: "لا تنس حل أسئلتك اليومية",
    time: "منذ 1 ساعة",
    icon: ClipboardList,
    tone: "bg-[#eef4ff] text-[#2563eb]",
  },
  {
    title: "محتوى جديد",
    description: "تم إضافة 10 أسئلة جديدة في قسم القدرات",
    time: "منذ 3 ساعات",
    icon: BookOpen,
    tone: "bg-[#eafaf1] text-[#16a34a]",
  },
  {
    title: "عرض خاص",
    description: "احصل على خصم 20% على الاشتراك السنوي",
    time: "منذ يوم واحد",
    icon: Tag,
    tone: "bg-[#f4ecff] text-[#8b5cf6]",
  },
];

function HeaderNotificationsButton({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div className={cn("relative", className)} ref={panelRef}>
      <button
        type="button"
        aria-label="الإشعارات"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_22px_rgba(15,23,42,0.045)] transition hover:border-[#cdddff] hover:bg-[#f8fbff]"
      >
        <Bell className="h-5 w-5" />
        <span className="absolute left-1 top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-[#ef4444] px-1 text-[11px] font-extrabold text-white">
          3
        </span>
      </button>

      {open ? (
        <div
          dir="rtl"
          className="absolute left-0 top-[calc(100%+0.8rem)] z-[10020] w-[340px] rounded-[1.5rem] border border-[#e7edf8] bg-white p-4 shadow-[0_30px_65px_rgba(15,23,42,0.14)]"
        >
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
            >
              عرض الكل
            </Link>
            <h3 className="text-[1.75rem] font-black text-[#123B7A]">الإشعارات</h3>
          </div>

          <div className="space-y-3">
            {headerNotifications.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="relative rounded-[1.15rem] border border-[#f1f5fd] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.025)]"
                >
                  <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#ff3b3b]" />
                  <div className="flex items-center justify-between gap-4">
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", item.tone)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-1 text-right">
                      <div className="text-[1.05rem] font-extrabold text-slate-800">{item.title}</div>
                      <div className="text-sm leading-6 text-slate-500">{item.description}</div>
                      <div className="text-xs font-medium text-slate-400">{item.time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between px-1">
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-[#123B7A]"
            >
              <Cog className="h-4 w-4" />
              إعدادات الإشعارات
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-[#2563eb] transition hover:text-[#1d4ed8]"
            >
              عرض الكل
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({
  ctaHref,
  ctaLabel,
  links,
  variant = "public",
  initialUser = null,
}: {
  ctaHref?: string;
  ctaLabel?: string;
  links?: BasicNavLink[];
  variant?: SiteHeaderVariant;
  initialUser?: AuthSessionUser | null;
}) {
  const pathname = usePathname();
  const { status, user, refreshSession } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const effectiveUser = status === "authenticated" ? user : status === "loading" ? initialUser : null;
  const isAuthenticated = Boolean(effectiveUser);

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

    if (!isAuthenticated) {
      return publicTopNavItems;
    }

    return publicTopNavItems.map((item) => {
      if (item.href === "/plans") {
        return { ...item, href: "/my-plan" };
      }

      if (item.href === "/summary-center") {
        return { ...item, href: "/summaries" };
      }

      if (item.href === "/competitions") {
        return { ...item, href: "/challenge" };
      }

      return item;
    });
  }, [isAuthenticated, isStudentArea, links]);

  const mobileItems = useMemo(() => {
    if (links?.length) {
      return links.filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index);
    }

    const source = isStudentArea
      ? [...studentTopNavItems, ...studentSidebarItems]
      : isAuthenticated
        ? desktopLinks
        : publicTopNavItems;

    return source.filter((item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index);
  }, [desktopLinks, isAuthenticated, isStudentArea, links]);

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

            {isAuthenticated ? <HeaderNotificationsButton className="hidden lg:block" /> : null}

            <HeaderAuthControls
              variant="public"
              ctaHref={isAuthenticated ? undefined : ctaHref}
              ctaLabel={isAuthenticated ? undefined : ctaLabel}
              initialUser={initialUser}
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
                      {Icon ? (
                        <span className={cn("nav-icon-wrap", item.iconWrap, item.accent)}>
                          <Icon className="h-5 w-5" />
                        </span>
                      ) : null}
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
      <div className="w-full px-3 py-3 sm:px-5 lg:px-5 xl:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4 lg:gap-5 xl:gap-7">
            <MiyaarLogo href={brandHref} />

            <nav
              className={cn(
                "hidden min-w-0 items-center gap-0.5 overflow-x-auto text-sm font-bold text-slate-600 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                isStudentArea ? "md:flex lg:gap-1 xl:gap-1" : "lg:flex",
              )}
            >
              {desktopLinks.map((item) => {
                const active = isNavItemActive(pathname, currentSearch, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex min-w-[74px] flex-col items-center justify-center gap-1 rounded-[0.95rem] px-2 py-2 text-center transition xl:min-w-[94px] xl:gap-1.5 xl:px-3",
                      active ? "text-[#2563eb]" : "text-slate-600 hover:bg-[#f8fbff] hover:text-slate-900",
                    )}
                  >
                    {Icon ? <Icon className={cn("h-4 w-4 xl:h-5 xl:w-5", active && "text-[#2563eb]")} /> : null}
                    <span className="text-[0.78rem] leading-[1.15] lg:text-[0.82rem] xl:text-[0.95rem]">{item.label}</span>
                    {active ? <span className="absolute inset-x-3 bottom-0 h-[4px] rounded-full bg-[#2563eb]" /> : null}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2.5" dir="ltr">
            {isStudentArea && isAuthenticated ? (
              <>
                <HeaderNotificationsButton className="hidden xl:block" />
                <HeaderUtilityButton href="/account" icon={Cog} label="الإعدادات" className="hidden xl:flex" />
              </>
            ) : null}

            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white text-[#123B7A] shadow-[0_10px_22px_rgba(15,23,42,0.045)] md:hidden"
              aria-label="افتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            <HeaderAuthControls
              variant={isStudentArea ? "student" : "public"}
              ctaHref={isAuthenticated ? undefined : ctaHref}
              ctaLabel={isAuthenticated ? undefined : ctaLabel}
              initialUser={initialUser}
            />
          </div>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[220] bg-black/30 backdrop-blur-sm md:hidden">
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
                    {Icon ? (
                      <span className={cn("nav-icon-wrap", item.iconWrap, item.accent)}>
                        <Icon className="h-5 w-5" />
                      </span>
                    ) : null}
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
