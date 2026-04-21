"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { studentSidebarItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

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

export function AppSidebar() {
  const pathname = usePathname();
  const { status, user } = useAuthSession();
  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    setCurrentSearch(window.location.search);
  }, []);

  if (status !== "authenticated" || !user) {
    return null;
  }

  return (
    <aside className="hidden xl:block xl:w-[292px]">
      <div className="sticky top-28 z-[120] rounded-[2.25rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(249,251,255,0.94))] p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="rounded-[1.8rem] border border-[#dfe8f6] bg-[linear-gradient(135deg,rgba(238,244,255,0.92),rgba(255,255,255,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
          <div className="text-[11px] font-bold tracking-[0.24em] text-slate-400">STUDENT SPACE</div>
          <div className="mt-3 display-font text-[1.45rem] font-extrabold text-slate-950">مساحتك داخل معيار</div>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            تنقّل سريع وواضح بين الخطة، التدريب، المراجعة، والملخصات من مكان واحد.
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          {studentSidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, currentSearch, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[1.55rem] border px-4 py-4 transition-all duration-200",
                  active
                    ? "border-[#d7e5ff] bg-[linear-gradient(135deg,rgba(238,244,255,0.98),rgba(255,255,255,0.98))] shadow-[0_16px_35px_rgba(29,78,216,0.10)]"
                    : "border-transparent bg-white/70 hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-[0_14px_28px_rgba(15,23,42,0.05)]",
                )}
              >
                <span
                  className={cn(
                    "nav-icon-wrap transition-transform duration-200 group-hover:scale-105",
                    item.iconWrap,
                    item.accent,
                    active && "shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className={cn("display-font text-[1rem] font-bold text-slate-900", active && "text-[#123B7A]")}>
                    {item.label}
                  </div>
                  {item.description ? (
                    <div className={cn("mt-1 text-xs font-medium leading-6 text-slate-400", active && "text-slate-500")}>
                      {item.description}
                    </div>
                  ) : null}
                </div>

                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
                    active ? "bg-[#e9f1ff] text-[#123B7A]" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200",
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-5 rounded-[1.6rem] border border-[#e7dcc3] bg-[linear-gradient(180deg,rgba(255,250,240,0.96),rgba(255,255,255,0.98))] px-4 py-4 text-sm leading-7 text-slate-600">
          ابدأ من <span className="font-bold text-slate-900">لوحتي</span> إذا أردت صورة سريعة ليومك، أو افتح{" "}
          <span className="font-bold text-slate-900">الخطة اليومية</span> لتكمل المهمات بالترتيب.
        </div>
      </div>
    </aside>
  );
}
