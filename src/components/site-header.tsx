"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useMemo, useState } from "react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { HeaderAuthControls } from "@/components/header-auth-controls";
import { SearchTrigger } from "@/components/search-trigger";
import { Button } from "@/components/ui/button";
import { productSidebarItems, topNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

export function SiteHeader({
  ctaHref = "/diagnostic",
  ctaLabel = "ابدأ الآن",
  links: _links,
}: {
  ctaHref?: string;
  ctaLabel?: string;
  links?: Array<{ href: string; label: string }>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const mobileItems = useMemo(
    () =>
      [...topNavItems, ...productSidebarItems].filter(
        (item, index, array) => array.findIndex((candidate) => candidate.href === item.href) === index,
      ),
    [],
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/82 backdrop-blur-2xl">
      <div className="mx-auto flex w-[min(calc(100%-2rem),1180px)] items-center justify-between gap-4 py-4">
        <MiyaarLogo />

        <nav className="hidden items-center justify-center gap-2 text-sm font-semibold text-slate-600 lg:flex">
          {topNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 transition",
                pathname === item.href
                  ? "bg-[#fff7e8] text-[#a86f00] shadow-[inset_0_0_0_1px_rgba(212,169,76,0.18)]"
                  : "hover:bg-slate-50 hover:text-slate-950",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchTrigger />

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="search-btn-header lg:hidden"
            aria-label="افتح القائمة"
          >
            <Menu className="h-5 w-5 text-[#123B7A]" />
          </button>

          <HeaderAuthControls ctaHref={ctaHref} ctaLabel={ctaLabel} />
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden">
          <div className="mr-auto h-full w-[330px] overflow-y-auto bg-white px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <MiyaarLogo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="search-btn-header"
                aria-label="إغلاق القائمة"
              >
                <X className="h-5 w-5 text-[#123B7A]" />
              </button>
            </div>

            <div className="space-y-2">
              {mobileItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

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
                      {item.description ? (
                        <div className="text-xs font-medium text-slate-400">{item.description}</div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 space-y-3">
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
              <Link href={ctaHref} onClick={() => setOpen(false)}>
                <Button className="w-full">{ctaLabel}</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
